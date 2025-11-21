import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getPayload({ config: configPromise })

    const { id: testId } = await params

    if (!testId) {
      return NextResponse.json({ error: 'Test ID is required' }, { status: 400 })
    }

    const test = await payload.findByID({
      collection: 'tests',
      id: testId,
      depth: 0,
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    // Check if the test has questions
    if (!test.questions || test.questions.length === 0) {
      return NextResponse.json(
        {
          error: 'Test has no questions',
          test,
          questions: [],
        },
        { status: 400 },
      )
    }

    // Get questions for the test
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
      depth: 2, // Depth for getting all related data (media, code, etc.)
    })

    // Shuffle questions
    const shuffledQuestions = questions.docs.sort(() => Math.random() - 0.5)

    return NextResponse.json({
      test,
      questions: shuffledQuestions,
    })
  } catch (error) {
    console.error('Error fetching test questions:', error)
    return NextResponse.json({ error: 'Failed to fetch test questions' }, { status: 500 })
  }
}
