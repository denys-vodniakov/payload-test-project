import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    const { searchParams } = new URL(request.url)
    const testId = searchParams.get('testId')

    if (!testId) {
      return NextResponse.json({ error: 'Test ID is required' }, { status: 400 })
    }

    const test = await payload.findByID({
      collection: 'tests',
      id: testId,
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    // Получаем вопросы для теста
    const questions = await payload.find({
      collection: 'questions',
      where: {
        id: {
          in: test.questions.map((q: any) => q.id),
        },
      },
      limit: 100,
      pagination: false,
    })

    // Перемешиваем вопросы
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
