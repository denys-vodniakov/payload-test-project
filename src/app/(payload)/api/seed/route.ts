import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function POST(_request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    // Создаем тестовые вопросы
    const questions = [
      {
        question: 'Что такое React Hook?',
        category: 'react' as const,
        difficulty: 'easy' as const,
        options: [
          {
            text: 'Функция, которая позволяет использовать состояние и другие возможности React в функциональных компонентах',
            isCorrect: true,
          },
          { text: 'Классовый компонент React', isCorrect: false },
          { text: 'Метод для создания анимаций', isCorrect: false },
          { text: 'Инструмент для тестирования', isCorrect: false },
        ],
        explanation:
          'React Hooks - это функции, которые позволяют использовать состояние и другие возможности React в функциональных компонентах.',
      },
      {
        question: 'Какой хук используется для управления состоянием в функциональных компонентах?',
        category: 'react' as const,
        difficulty: 'easy' as const,
        options: [
          { text: 'useState', isCorrect: true },
          { text: 'useEffect', isCorrect: false },
          { text: 'useContext', isCorrect: false },
          { text: 'useReducer', isCorrect: false },
        ],
        explanation:
          'useState - это хук для управления локальным состоянием в функциональных компонентах.',
      },
      {
        question: 'Что такое Server Components в Next.js 13+?',
        category: 'nextjs' as const,
        difficulty: 'medium' as const,
        options: [
          { text: 'Компоненты, которые рендерятся на сервере', isCorrect: true },
          { text: 'Компоненты, которые работают только на клиенте', isCorrect: false },
          { text: 'Компоненты для API роутов', isCorrect: false },
          { text: 'Компоненты для middleware', isCorrect: false },
        ],
        explanation:
          'Server Components рендерятся на сервере и позволяют выполнять серверную логику прямо в компонентах.',
      },
      {
        question: 'Какой метод используется для создания нового элемента в React?',
        category: 'react' as const,
        difficulty: 'easy' as const,
        options: [
          { text: 'React.createElement()', isCorrect: true },
          { text: 'React.newElement()', isCorrect: false },
          { text: 'React.makeElement()', isCorrect: false },
          { text: 'React.buildElement()', isCorrect: false },
        ],
        explanation: 'React.createElement() - это метод для создания React элементов.',
      },
      {
        question: 'Что такое TypeScript?',
        category: 'typescript' as const,
        difficulty: 'easy' as const,
        options: [
          { text: 'Типизированная надстройка над JavaScript', isCorrect: true },
          { text: 'Новый язык программирования', isCorrect: false },
          { text: 'Фреймворк для React', isCorrect: false },
          { text: 'Инструмент для тестирования', isCorrect: false },
        ],
        explanation:
          'TypeScript - это типизированная надстройка над JavaScript, которая добавляет статическую типизацию.',
      },
      {
        question: 'Какой синтаксис используется для деструктуризации в JavaScript?',
        category: 'javascript' as const,
        difficulty: 'easy' as const,
        options: [
          { text: 'const { name, age } = person', isCorrect: true },
          { text: 'const name, age = person', isCorrect: false },
          { text: 'const [name, age] = person', isCorrect: false },
          { text: 'const name = person.name, age = person.age', isCorrect: false },
        ],
        explanation:
          'Деструктуризация объектов использует фигурные скобки {} для извлечения свойств.',
      },
      {
        question: 'Что такое CSS Grid?',
        category: 'css-html' as const,
        difficulty: 'medium' as const,
        options: [
          { text: 'Двумерная система компоновки для CSS', isCorrect: true },
          { text: 'Одномерная система компоновки', isCorrect: false },
          { text: 'Система анимаций', isCorrect: false },
          { text: 'Система для работы с цветами', isCorrect: false },
        ],
        explanation:
          'CSS Grid - это двумерная система компоновки, которая позволяет создавать сложные макеты.',
      },
      {
        question:
          'Какой метод массива создает новый массив с результатами вызова функции для каждого элемента?',
        category: 'javascript' as const,
        difficulty: 'easy' as const,
        options: [
          { text: 'map()', isCorrect: true },
          { text: 'filter()', isCorrect: false },
          { text: 'reduce()', isCorrect: false },
          { text: 'forEach()', isCorrect: false },
        ],
        explanation:
          'map() создает новый массив с результатами вызова функции для каждого элемента.',
      },
      {
        question: 'Что такое Virtual DOM в React?',
        category: 'react',
        difficulty: 'medium',
        options: [
          { text: 'Легковесная копия реального DOM', isCorrect: true },
          { text: 'Реальный DOM элемент', isCorrect: false },
          { text: 'Компонент React', isCorrect: false },
          { text: 'Хук React', isCorrect: false },
        ],
        explanation:
          'Virtual DOM - это легковесная копия реального DOM, которая используется для оптимизации обновлений.',
      },
      {
        question: 'Какой хук используется для выполнения побочных эффектов?',
        category: 'react' as const,
        difficulty: 'easy' as const,
        options: [
          { text: 'useEffect', isCorrect: true },
          { text: 'useState', isCorrect: false },
          { text: 'useContext', isCorrect: false },
          { text: 'useMemo', isCorrect: false },
        ],
        explanation:
          'useEffect используется для выполнения побочных эффектов в функциональных компонентах.',
      },
    ]

    // Создаем вопросы в базе данных
    const createdQuestions: any[] = []
    for (const questionData of questions) {
      const question = await payload.create({
        collection: 'questions',
        data: questionData as any,
      })
      createdQuestions.push(question)
    }

    // Создаем тесты
    const tests = [
      {
        title: 'Основы React',
        description: 'Тест по основам React, включая компоненты, хуки и состояние',
        category: 'react' as const,
        difficulty: 'easy' as const,
        timeLimit: 15,
        questions: createdQuestions.filter((q) => q.category === 'react').map((q) => q.id),
        isActive: true,
        passingScore: 70,
      },
      {
        title: 'JavaScript ES6+',
        description: 'Тест по современным возможностям JavaScript',
        category: 'javascript' as const,
        difficulty: 'medium' as const,
        timeLimit: 20,
        questions: createdQuestions.filter((q) => q.category === 'javascript').map((q) => q.id),
        isActive: true,
        passingScore: 75,
      },
      {
        title: 'Next.js 15',
        description: 'Тест по новым возможностям Next.js 15',
        category: 'nextjs' as const,
        difficulty: 'medium' as const,
        timeLimit: 25,
        questions: createdQuestions.filter((q) => q.category === 'nextjs').map((q) => q.id),
        isActive: true,
        passingScore: 80,
      },
      {
        title: 'TypeScript Основы',
        description: 'Тест по основам TypeScript',
        category: 'typescript' as const,
        difficulty: 'easy' as const,
        timeLimit: 15,
        questions: createdQuestions.filter((q) => q.category === 'typescript').map((q) => q.id),
        isActive: true,
        passingScore: 70,
      },
      {
        title: 'CSS Grid и Flexbox',
        description: 'Тест по современным методам компоновки в CSS',
        category: 'css-html' as const,
        difficulty: 'medium' as const,
        timeLimit: 20,
        questions: createdQuestions.filter((q) => q.category === 'css-html').map((q) => q.id),
        isActive: true,
        passingScore: 75,
      },
      {
        title: 'Полный стек разработчик',
        description: 'Комплексный тест по всем технологиям',
        category: 'mixed' as const,
        difficulty: 'hard' as const,
        timeLimit: 45,
        questions: createdQuestions.map((q) => q.id),
        isActive: true,
        passingScore: 80,
      },
    ]

    // Создаем тесты в базе данных
    const createdTests: any[] = []
    for (const testData of tests) {
      const test = await payload.create({
        collection: 'tests',
        data: testData as any,
      })
      createdTests.push(test)
    }

    return NextResponse.json({
      message: 'Тестовые данные успешно созданы',
      questions: createdQuestions.length,
      tests: createdTests.length,
    })
  } catch (error) {
    console.error('Error seeding data:', error)
    return NextResponse.json({ error: 'Failed to seed data' }, { status: 500 })
  }
}
