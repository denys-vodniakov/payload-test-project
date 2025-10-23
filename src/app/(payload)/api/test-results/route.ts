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
    
    // Получаем тест и вопросы
    const test = await payload.findByID({
      collection: 'tests',
      id: testId,
    })
    
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
    
    // Вычисляем результаты
    let correctAnswers = 0
    const processedAnswers = answers.map((answer: any) => {
      const question = questions.docs.find((q: any) => q.id === answer.questionId)
      if (!question) return null
      
      const isCorrect = answer.selectedOptions.every((optionIndex: number) => {
        const option = question.options[optionIndex]
        return option && option.isCorrect
      }) && answer.selectedOptions.length === question.options.filter((opt: any) => opt.isCorrect).length
      
      if (isCorrect) correctAnswers++
      
      return {
        question: answer.questionId,
        selectedOptions: answer.selectedOptions.map((index: number) => ({ optionIndex: index })),
        isCorrect,
        timeSpent: answer.timeSpent || 0,
      }
    }).filter(Boolean)
    
    const score = Math.round((correctAnswers / questions.docs.length) * 100)
    const isPassed = score >= (test.passingScore || 70)
    
    // Сохраняем результат
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
