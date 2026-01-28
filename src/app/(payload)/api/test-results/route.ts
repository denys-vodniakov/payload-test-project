import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.PAYLOAD_SECRET || 'fallback-secret'

interface JWTPayload {
  userId: string | number
  email: string
}

async function getUserFromRequest(request: NextRequest, payload: any) {
  // Try Authorization header first
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
      return decoded.userId
    } catch (error) {
      // Token invalid, try cookie
    }
  }

  // Try Payload cookie
  try {
    const { user } = await payload.auth({ headers: request.headers })
    if (user) {
      return user.id
    }
  } catch (error) {
    // Cookie invalid
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const { testId, answers, timeSpent } = body

    if (!testId || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user ID from authentication
    const userId = await getUserFromRequest(request, payload)

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required to save test results' }, { status: 401 })
    }

    // Normalize IDs to numbers (Payload requires numeric IDs for relationships)
    const normalizedTestId = typeof testId === 'string' ? parseInt(testId, 10) : testId
    const normalizedUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId

    if (isNaN(normalizedTestId) || isNaN(normalizedUserId)) {
      return NextResponse.json({ error: 'Invalid testId or userId format' }, { status: 400 })
    }

    // Get test and questions
    const test = await payload.findByID({
      collection: 'tests',
      id: normalizedTestId,
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    if (!test.questions || !Array.isArray(test.questions) || test.questions.length === 0) {
      return NextResponse.json({ error: 'Test has no questions' }, { status: 400 })
    }

    // Handle both cases: questions as array of IDs or array of objects with id property
    const questionIds = test.questions.map((q: any) => (typeof q === 'number' ? q : q.id))

    const questions = await payload.find({
      collection: 'questions',
      where: {
        id: {
          in: questionIds,
        },
      },
      limit: 100,
      pagination: false,
    })

    // Calculate results
    console.log('Processing test results:', {
      testId,
      userId,
      answersCount: answers.length,
      questionsCount: questions.docs.length,
      questionIds: questions.docs.map((q: any) => String(q.id)),
      answerQuestionIds: answers.map((a: any) => String(a.questionId)),
    })

    let correctAnswers = 0
    const processedAnswers = answers
      .map((answer: any) => {
        // Normalize IDs for comparison (handle both string and number types)
        const question = questions.docs.find((q: any) => {
          const qId = String(q.id)
          const answerId = String(answer.questionId)
          return qId === answerId
        })
        if (!question) {
          console.warn(
            `Question not found for ID: ${answer.questionId}. Available IDs:`,
            questions.docs.map((q: any) => String(q.id)),
          )
          return null
        }

        // Check if question has options
        if (
          !question.options ||
          !Array.isArray(question.options) ||
          question.options.length === 0
        ) {
          console.warn(`Question ${question.id} has no options`)
          return null
        }

        // Get correct option indices
        const correctOptionIndices = question.options
          .map((opt: any, index: number) => (opt.isCorrect ? index : -1))
          .filter((index: number) => index !== -1)

        // Check if answer is correct:
        // 1. All selected options must be correct
        // 2. Number of selected options must match number of correct options
        // 3. Must have at least one selected option (if there are correct options)
        const allSelectedAreCorrect = (answer.selectedOptions || []).every(
          (optionIndex: number) => {
            const option = question.options?.[optionIndex]
            return option && option.isCorrect
          },
        )

        const correctCount = correctOptionIndices.length
        const selectedCount = answer.selectedOptions?.length || 0

        const isCorrect =
          allSelectedAreCorrect && selectedCount === correctCount && selectedCount > 0

        if (isCorrect) correctAnswers++

        // Ensure question ID is a number
        const questionId = typeof question.id === 'string' ? parseInt(question.id, 10) : question.id

        if (isNaN(questionId)) {
          console.error(`Invalid question ID: ${question.id}`)
          return null
        }

        return {
          question: questionId, // Use numeric ID from the found question
          selectedOptions: (answer.selectedOptions || []).map((index: number) => ({
            optionIndex: index,
          })),
          isCorrect,
          timeSpent: answer.timeSpent || 0,
        }
      })
      .filter(Boolean)

    const score = Math.round((correctAnswers / questions.docs.length) * 100)
    const isPassed = score >= (test.passingScore || 70)

    // Save result - ensure all relationship IDs are numbers
    const dataToSave = {
      user: normalizedUserId,
      test: normalizedTestId,
      answers: processedAnswers,
      score,
      totalQuestions: questions.docs.length,
      correctAnswers,
      timeSpent,
      isPassed,
      completedAt: new Date().toISOString(),
    }

    console.log('Saving test result with data:', {
      user: dataToSave.user,
      test: dataToSave.test,
      answersCount: dataToSave.answers.length,
      answers: dataToSave.answers.map((a: any) => ({
        question: a.question,
        questionType: typeof a.question,
        selectedOptions: a.selectedOptions?.length || 0,
        isCorrect: a.isCorrect,
      })),
    })

    const result = await payload.create({
      collection: 'test-results',
      data: dataToSave,
    })

    const responseData = {
      result,
      score,
      correctAnswers,
      totalQuestions: questions.docs.length,
      isPassed,
    }

    console.log('Test result calculated:', {
      score,
      correctAnswers,
      totalQuestions: questions.docs.length,
      isPassed,
      answersCount: answers.length,
      questionsCount: questions.docs.length,
    })

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error submitting test:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit test'
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.stack : String(error) },
      { status: 500 },
    )
  }
}
