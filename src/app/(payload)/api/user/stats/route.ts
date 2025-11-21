import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.PAYLOAD_SECRET || 'fallback-secret'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token not provided' }, { status: 401 })
    }

    const token = authHeader.substring(7) // Remove "Bearer " prefix

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

      const payload = await getPayload({ config: configPromise })

      // Normalize userId to number (Payload uses numeric IDs)
      const normalizedUserId =
        typeof decoded.userId === 'string' ? parseInt(decoded.userId, 10) : decoded.userId

      if (isNaN(normalizedUserId)) {
        return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 })
      }

      const testResults = await payload.find({
        collection: 'test-results',
        where: {
          user: {
            equals: normalizedUserId,
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

      const recentResults = testResults.docs
        .slice(0, 10) // Already sorted by completedAt desc
        .map((result) => {
          const testId =
            typeof result.test === 'number' ? result.test : parseInt(String(result.test), 10)
          const test = testsMap.get(testId)
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
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json({ error: 'Error fetching statistics' }, { status: 500 })
  }
}
