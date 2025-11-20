import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()
    
    const { testId, answers, timeSpent, userId } = body
    
    if (!testId || !answers || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Get test and questions
    const test = await payload.findByID({
      collection: 'tests',
      id: testId,
    })
    
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
    let correctAnswers = 0
    const processedAnswers = answers.map((answer: any) => {
      // Normalize IDs for comparison (handle both string and number types)
      const question = questions.docs.find((q: any) => {
        const qId = String(q.id)
        const answerId = String(answer.questionId)
        return qId === answerId
      })
      if (!question) {
        console.warn(`Question not found for ID: ${answer.questionId}`)
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
      const allSelectedAreCorrect = (answer.selectedOptions || []).every((optionIndex: number) => {
        const option = question.options[optionIndex]
        return option && option.isCorrect
      })
      
      const correctCount = correctOptionIndices.length
      const selectedCount = answer.selectedOptions?.length || 0
      
      const isCorrect = 
        allSelectedAreCorrect && 
        selectedCount === correctCount && 
        selectedCount > 0
      
      if (isCorrect) correctAnswers++
      
      return {
        question: answer.questionId,
        selectedOptions: (answer.selectedOptions || []).map((index: number) => ({ optionIndex: index })),
        isCorrect,
        timeSpent: answer.timeSpent || 0,
      }
    }).filter(Boolean)
    
    const score = Math.round((correctAnswers / questions.docs.length) * 100)
    const isPassed = score >= (test.passingScore || 70)
    
    // Save result
    const result = await payload.create({
      collection: 'test-results',
      data: {
        user: userId,
        test: testId,
        answers: processedAnswers,
        score,
        totalQuestions: questions.docs.length,
        correctAnswers,
        timeSpent,
        isPassed,
        completedAt: new Date().toISOString(),
      },
    })
    
    return NextResponse.json({
      result,
      score,
      correctAnswers,
      totalQuestions: questions.docs.length,
      isPassed,
    })
  } catch (error) {
    console.error('Error submitting test:', error)
    return NextResponse.json(
      { error: 'Failed to submit test' },
      { status: 500 }
    )
  }
}
