import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.PAYLOAD_SECRET || 'fallback-secret'

export async function GET(request: NextRequest) {
  try {
    let userId: number | null = null
    const authHeader = request.headers.get('authorization')
    const payloadToken = request.cookies.get('payload-token')?.value

    const payload = await getPayload({ config: configPromise })

    // Проверяем Bearer токен из заголовка
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7) // Remove "Bearer " prefix

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

        // Normalize userId to number (Payload uses numeric IDs)
        const normalizedUserId =
          typeof decoded.userId === 'string' ? parseInt(decoded.userId, 10) : decoded.userId

        if (!isNaN(normalizedUserId)) {
          userId = normalizedUserId
        }
      } catch (jwtError) {
        // Токен невалиден, пробуем куку
      }
    }

    // Если Bearer токен не найден или невалиден, проверяем куку payload-token
    if (!userId && payloadToken) {
      try {
        // Используем Payload API для получения пользователя из куки
        const origin = request.nextUrl.origin
        
        // Используем короткий таймаут для локального запроса
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 секунды таймаут
        
        const meUserReq = await fetch(`${origin}/api/users/me`, {
          headers: {
            Authorization: `JWT ${payloadToken}`,
          },
          signal: controller.signal,
          cache: 'no-store',
        })
        
        clearTimeout(timeoutId)

        if (meUserReq.ok) {
          const { user } = await meUserReq.json()
          if (user && user.id) {
            userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id
          }
        }
      } catch (error: any) {
        // Если это таймаут, логируем, но не падаем
        if (error.name === 'AbortError' || error.code === 'UND_ERR_HEADERS_TIMEOUT') {
          console.error('Timeout when fetching user from cookie:', error)
        } else {
          console.error('Error fetching user from cookie:', error)
        }
      }
    }

    if (!userId || isNaN(userId)) {
      return NextResponse.json({ error: 'Authorization token not provided' }, { status: 401 })
    }

    // Get user to verify they exist
    // Note: Admins can access user features, so no additional check needed here
    const currentUser = await payload.findByID({
      collection: 'users',
      id: userId,
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const testResults = await payload.find({
        collection: 'test-results',
        where: {
          user: {
            equals: userId,
          },
        },
        limit: 100,
        pagination: false,
        sort: '-completedAt',
      })

      // Extract test IDs and normalize them
      const testIds = testResults.docs
        .map((result) => {
          const testId = result.test
          return typeof testId === 'number' ? testId : parseInt(String(testId), 10)
        })
        .filter((id) => !isNaN(id))

      const tests = await payload.find({
        collection: 'tests',
        where: {
          id: {
            in: testIds,
          },
        },
        limit: 100,
        pagination: false,
      })

      const testsMap = new Map(tests.docs.map((test) => [test.id, test]))

      const totalTests = testResults.docs.length
      const passedTests = testResults.docs.filter((result) => result.isPassed).length
      const averageScore =
        totalTests > 0
          ? Math.round(testResults.docs.reduce((sum, result) => sum + result.score, 0) / totalTests)
          : 0
      const totalTimeSpent = testResults.docs.reduce(
        (sum, result) => sum + (result.timeSpent || 0),
        0,
      )

      const categoryStats: Record<string, { tests: number; totalScore: number }> = {}

      testResults.docs.forEach((result) => {
        const testId =
          typeof result.test === 'number' ? result.test : parseInt(String(result.test), 10)
        const test = testsMap.get(testId)
        if (test && 'category' in test) {
          const category = test.category as string
          if (!categoryStats[category]) {
            categoryStats[category] = { tests: 0, totalScore: 0 }
          }
          categoryStats[category].tests++
          categoryStats[category].totalScore += result.score
        }
      })

      const categoryStatsArray = Object.entries(categoryStats).map(([category, data]) => ({
        category,
        tests: data.tests,
        averageScore: Math.round(data.totalScore / data.tests),
      }))

      // Get all question IDs from all results
      const allQuestionIds = new Set<number>()
      testResults.docs.forEach((result) => {
        if (result.answers && Array.isArray(result.answers)) {
          result.answers.forEach((answer: any) => {
            const qId = typeof answer.question === 'number' 
              ? answer.question 
              : parseInt(String(answer.question), 10)
            if (!isNaN(qId)) {
              allQuestionIds.add(qId)
            }
          })
        }
      })

      // Fetch all questions with their options and feedback
      const questions = await payload.find({
        collection: 'questions',
        where: {
          id: {
            in: Array.from(allQuestionIds),
          },
        },
        limit: 1000,
        pagination: false,
      })

      const questionsMap = new Map(questions.docs.map((q) => [q.id, q]))

      const recentResults = testResults.docs
        .slice(0, 10) // Already sorted by completedAt desc
        .map((result) => {
          const testId =
            typeof result.test === 'number' ? result.test : parseInt(String(result.test), 10)
          const test = testsMap.get(testId)
          
          // Map answers with feedback
          const answersWithFeedback = (result.answers || []).map((answer: any) => {
            const questionId = typeof answer.question === 'number' 
              ? answer.question 
              : parseInt(String(answer.question), 10)
            const question = questionsMap.get(questionId)
            
            if (!question) {
              return {
                questionId,
                isCorrect: answer.isCorrect || false,
                selectedOptions: answer.selectedOptions || [],
                feedback: null,
              }
            }

            // Collect feedback from selected options
            const feedbackItems: Array<{
              optionIndex: number
              feedbackType: 'correct' | 'incorrect'
              content: any
            }> = []

            if (answer.selectedOptions && Array.isArray(answer.selectedOptions)) {
              answer.selectedOptions.forEach((selectedOption: any) => {
                const optionIndex = selectedOption.optionIndex ?? selectedOption
                const option = question.options?.[optionIndex]
                
                if (option && option.feedback && Array.isArray(option.feedback)) {
                  option.feedback.forEach((fb: any) => {
                    if (fb.content) {
                      feedbackItems.push({
                        optionIndex,
                        feedbackType: fb.feedbackType || (option.isCorrect ? 'correct' : 'incorrect'),
                        content: fb.content,
                      })
                    }
                  })
                }
              })
            }

            return {
              questionId,
              question: {
                id: String(question.id),
                questionTitle: question.questionTitle || 'Question',
                question: question.question,
              },
              isCorrect: answer.isCorrect || false,
              selectedOptions: answer.selectedOptions || [],
              timeSpent: answer.timeSpent || 0,
              feedback: feedbackItems.length > 0 ? feedbackItems : null,
              explanation: question.explanation || null,
            }
          })

          return {
            id: String(result.id),
            test: {
              id: String(test?.id || testId),
              title: test?.title || 'Unknown test',
              category: test?.category || 'unknown',
              difficulty: test?.difficulty || 'unknown',
            },
            score: result.score,
            correctAnswers: result.correctAnswers,
            totalQuestions: result.totalQuestions,
            timeSpent: result.timeSpent || 0,
            isPassed: result.isPassed || false,
            completedAt: result.completedAt,
            answers: answersWithFeedback,
          }
        })

      return NextResponse.json({
        totalTests,
        passedTests,
        averageScore,
        totalTimeSpent,
        categoryStats: categoryStatsArray,
        recentResults,
      })
  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json({ error: 'Error fetching statistics' }, { status: 500 })
  }
}
