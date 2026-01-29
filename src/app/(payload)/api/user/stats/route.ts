import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.PAYLOAD_SECRET || 'fallback-secret'

// Helper function to check if richText content is not empty
const hasRichTextContent = (richText: any): boolean => {
  if (!richText || typeof richText !== 'object') return false

  try {
    // Lexical editor stores content in root.children array
    const root = richText.root || richText
    const children = root.children || []

    if (!Array.isArray(children) || children.length === 0) return false

    // Check if any child has text content
    const hasText = (node: any): boolean => {
      if (node.text && typeof node.text === 'string' && node.text.trim().length > 0) {
        return true
      }
      if (node.children && Array.isArray(node.children)) {
        return node.children.some(hasText)
      }
      return false
    }

    return children.some(hasText)
  } catch (error) {
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    let userId: number | null = null
    const authHeader = request.headers.get('authorization')
    const payloadToken = request.cookies.get('payload-token')?.value

    const payload = await getPayload({ config: configPromise })

    // Check Bearer token from header
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
        // Invalid token, try cookie
      }
    }

    // If Bearer token not found or invalid, check payload-token cookie
    if (!userId && payloadToken) {
      try {
        // Use Payload API to get user from cookie
        const origin = request.nextUrl.origin

        // Use short timeout for local request
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 seconds timeout

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
        // If it's a timeout, log but don't crash
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
      depth: 2, // Load test and question relationship data (depth 2 for nested questions in answers)
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
      depth: 2, // Load test data including relationships
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
          // Handle both cases: question as number or object (from depth)
          let qId: number | null = null
          if (typeof answer.question === 'number') {
            qId = answer.question
          } else if (typeof answer.question === 'object' && answer.question !== null) {
            // Question is populated from depth
            qId =
              typeof answer.question.id === 'number'
                ? answer.question.id
                : parseInt(String(answer.question.id), 10)
          } else {
            // Try to parse as string/number
            qId = parseInt(String(answer.question), 10)
          }

          if (qId && !isNaN(qId)) {
            allQuestionIds.add(qId)
          } else {
            console.warn(`[Stats API] Invalid question ID in answer:`, {
              question: answer.question,
              questionType: typeof answer.question,
            })
          }
        })
      }
    })

    // Fetch all questions with their options and feedback (depth: 2 to get nested feedback)
    const questions = await payload.find({
      collection: 'questions',
      where: {
        id: {
          in: Array.from(allQuestionIds),
        },
      },
      limit: 1000,
      pagination: false,
      depth: 2, // Important: depth 2 to load nested feedback data
    })

    const questionsMap = new Map(questions.docs.map((q) => [q.id, q]))

    const recentResults = testResults.docs
      .slice(0, 10) // Already sorted by completedAt desc
      .map((result) => {
        // Try to get test from populated relationship first, then fallback to map lookup
        let test: any = null
        let testId: number | null = null

        if (typeof result.test === 'object' && result.test !== null) {
          // Test is already populated from depth: 1
          test = result.test
          testId = typeof test.id === 'number' ? test.id : parseInt(String(test.id), 10)
        } else {
          // Test is just an ID, need to look it up
          testId = typeof result.test === 'number' ? result.test : parseInt(String(result.test), 10)
          test = testsMap.get(testId)
        }

        // Note: Tests should already be loaded in testsMap above
        // If test is still not found, it means the test was deleted or testId is invalid

        // Debug logging
        if (!test) {
          console.warn(
            `[Stats API] Test not found for testId: ${testId}, result.test:`,
            result.test,
          )
          console.warn(`[Stats API] Available test IDs in map:`, Array.from(testsMap.keys()))
        } else if (!test.title) {
          console.warn(`[Stats API] Test found but has no title, testId: ${testId}`)
          console.warn(`[Stats API] Test object keys:`, Object.keys(test))
        } else {
          console.log(`[Stats API] Successfully loaded test: "${test.title}" (ID: ${testId})`)
        }

        // Map answers with feedback
        const answersWithFeedback = (result.answers || []).map((answer: any) => {
          // Handle both cases: question as number or object (from depth)
          let questionId: number | null = null
          if (typeof answer.question === 'number') {
            questionId = answer.question
          } else if (typeof answer.question === 'object' && answer.question !== null) {
            // Question is populated from depth
            questionId =
              typeof answer.question.id === 'number'
                ? answer.question.id
                : parseInt(String(answer.question.id), 10)
          } else {
            // Try to parse as string/number
            questionId = parseInt(String(answer.question), 10)
          }

          if (!questionId || isNaN(questionId)) {
            console.warn(`[Stats API] Invalid question ID in answer:`, {
              question: answer.question,
              questionType: typeof answer.question,
              answerKeys: Object.keys(answer),
            })
            return {
              questionId: null,
              isCorrect: answer.isCorrect || false,
              selectedOptions: answer.selectedOptions || [],
              feedback: null,
            }
          }

          const question = questionsMap.get(questionId)

          if (!question) {
            console.warn(`[Stats API] Question ${questionId} not found in questionsMap`)
            return {
              questionId,
              isCorrect: answer.isCorrect || false,
              selectedOptions: answer.selectedOptions || [],
              feedback: null,
            }
          }

          // Debug: log question structure
          console.log(`[Stats API] Processing question ${questionId}:`, {
            hasOptions: !!question.options,
            optionsType: Array.isArray(question.options) ? 'array' : typeof question.options,
            optionsLength: Array.isArray(question.options) ? question.options.length : 0,
            firstOptionStructure:
              question.options && question.options[0]
                ? {
                    keys: Object.keys(question.options[0]),
                    hasFeedback: !!question.options[0].feedback,
                    feedbackType: Array.isArray(question.options[0].feedback)
                      ? 'array'
                      : typeof question.options[0].feedback,
                    feedbackLength: Array.isArray(question.options[0].feedback)
                      ? question.options[0].feedback.length
                      : 0,
                  }
                : 'no options',
          })

          // Collect feedback from selected options AND correct options
          const feedbackItems: Array<{
            optionIndex: number
            feedbackType: 'correct' | 'incorrect'
            content: any
          }> = []

          // Collect feedback from selected options
          if (answer.selectedOptions && Array.isArray(answer.selectedOptions)) {
            answer.selectedOptions.forEach((selectedOption: any) => {
              const optionIndex = selectedOption.optionIndex ?? selectedOption

              // Debug logging
              if (!question.options || !Array.isArray(question.options)) {
                console.warn(`Question ${questionId} has no options array`)
                return
              }

              if (optionIndex >= question.options.length) {
                console.warn(
                  `Option index ${optionIndex} out of bounds for question ${questionId} (has ${question.options.length} options)`,
                )
                return
              }

              const option = question.options[optionIndex]

              if (option && option.feedback && Array.isArray(option.feedback)) {
                console.log(
                  `[Stats API] Option ${optionIndex} has ${option.feedback.length} feedback items`,
                )
                option.feedback.forEach((fb: any, fbIdx: number) => {
                  console.log(
                    `[Stats API] Processing feedback ${fbIdx} for option ${optionIndex}:`,
                    {
                      hasContent: !!fb?.content,
                      contentType: fb?.content ? typeof fb?.content : 'missing',
                      contentKeys:
                        fb?.content && typeof fb?.content === 'object'
                          ? Object.keys(fb.content)
                          : [],
                      feedbackType: fb?.feedbackType,
                      hasRichTextContent: fb?.content ? hasRichTextContent(fb.content) : false,
                    },
                  )

                  // Check if content exists and is not empty using helper function
                  const hasContent = fb && fb.content && hasRichTextContent(fb.content)

                  if (hasContent) {
                    feedbackItems.push({
                      optionIndex,
                      feedbackType: fb.feedbackType || (option.isCorrect ? 'correct' : 'incorrect'),
                      content: fb.content,
                    })
                    console.log(
                      `[Stats API] ✓ Collected feedback from option ${optionIndex} for question ${questionId}`,
                      {
                        feedbackType:
                          fb.feedbackType || (option.isCorrect ? 'correct' : 'incorrect'),
                        hasContent: true,
                      },
                    )
                  } else {
                    console.log(
                      `[Stats API] Feedback item has no valid content for option ${optionIndex}, question ${questionId}:`,
                      {
                        fb: fb ? Object.keys(fb) : 'null',
                        content: fb?.content
                          ? typeof fb.content === 'object'
                            ? Object.keys(fb.content)
                            : typeof fb.content
                          : 'missing',
                      },
                    )
                  }
                })
              } else if (option) {
                // Debug: log when option exists but has no feedback
                console.log(
                  `[Stats API] Option ${optionIndex} for question ${questionId} has no feedback:`,
                  {
                    hasFeedback: !!option.feedback,
                    feedbackType: Array.isArray(option.feedback) ? 'array' : typeof option.feedback,
                    isCorrect: option.isCorrect,
                    optionKeys: option ? Object.keys(option) : 'no option',
                  },
                )
              }
            })
          }

          // If answer is correct, also collect feedback from all correct options
          // This ensures we show feedback even if user didn't select all correct options
          if (answer.isCorrect && question.options && Array.isArray(question.options)) {
            question.options.forEach((option: any, optionIndex: number) => {
              // Skip if we already collected feedback from this option
              const alreadyCollected = feedbackItems.some((fb) => fb.optionIndex === optionIndex)

              if (
                !alreadyCollected &&
                option.isCorrect &&
                option.feedback &&
                Array.isArray(option.feedback)
              ) {
                option.feedback.forEach((fb: any) => {
                  // Check if content exists and is not empty using helper function
                  const hasContent = fb && fb.content && hasRichTextContent(fb.content)

                  if (hasContent) {
                    // Only add feedback marked as 'correct' for correct options
                    const feedbackType = fb.feedbackType || 'correct'
                    if (feedbackType === 'correct') {
                      feedbackItems.push({
                        optionIndex,
                        feedbackType: 'correct',
                        content: fb.content,
                      })
                      console.log(
                        `[Stats API] ✓ Collected feedback from correct option ${optionIndex} for question ${questionId}`,
                      )
                    }
                  } else {
                    console.log(
                      `[Stats API] Correct option ${optionIndex} feedback has no valid content:`,
                      {
                        fb: fb ? Object.keys(fb) : 'null',
                        content: fb?.content
                          ? typeof fb.content === 'object'
                            ? Object.keys(fb.content)
                            : typeof fb.content
                          : 'missing',
                      },
                    )
                  }
                })
              }
            })
          }

          // Debug logging for feedback collection
          if (feedbackItems.length === 0 && question.options && Array.isArray(question.options)) {
            console.log(`[Stats API] ⚠ No feedback collected for question ${questionId}:`, {
              isCorrect: answer.isCorrect,
              selectedOptionsCount: answer.selectedOptions?.length || 0,
              totalOptions: question.options.length,
              optionsWithFeedback: question.options.filter(
                (opt: any) =>
                  opt.feedback && Array.isArray(opt.feedback) && opt.feedback.length > 0,
              ).length,
              optionsDetails: question.options.map((opt: any, idx: number) => ({
                index: idx,
                isCorrect: opt.isCorrect,
                hasFeedback: !!opt.feedback,
                feedbackLength: Array.isArray(opt.feedback) ? opt.feedback.length : 0,
                feedbackContent: Array.isArray(opt.feedback)
                  ? opt.feedback.map((fb: any) => ({
                      hasContent: !!(fb && fb.content),
                      contentType: fb?.content
                        ? typeof fb.content === 'object'
                          ? 'object'
                          : typeof fb.content
                        : 'missing',
                      contentKeys:
                        fb?.content && typeof fb.content === 'object'
                          ? Object.keys(fb.content)
                          : [],
                      feedbackType: fb?.feedbackType,
                    }))
                  : [],
              })),
            })
          } else if (feedbackItems.length > 0) {
            console.log(
              `[Stats API] ✓ Collected ${feedbackItems.length} feedback items for question ${questionId}`,
            )
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
            id: String(test?.id || testId || 'unknown'),
            title: test?.title || test?.name || 'Unknown test',
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
