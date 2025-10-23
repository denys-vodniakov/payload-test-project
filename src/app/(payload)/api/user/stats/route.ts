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

      const testResults = await payload.find({
        collection: 'test-results',
        where: {
          user: {
            equals: decoded.userId,
          },
        },
        limit: 100,
        pagination: false,
      })

      const testIds = testResults.docs.map((result) => result.test).filter(Boolean)
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
        const test = testsMap.get(result.test as number)
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
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
        .slice(0, 5)
        .map((result) => {
          const test = testsMap.get(result.test as number)
          return {
            id: result.id,
            test: {
              id: test?.id || 'unknown',
              title: test?.title || 'Unknown test',
              category: test?.category || 'unknown',
              difficulty: test?.difficulty || 'unknown',
            },
            score: result.score,
            correctAnswers: result.correctAnswers,
            totalQuestions: result.totalQuestions,
            timeSpent: result.timeSpent || 0,
            isPassed: result.isPassed,
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
