import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function POST(_request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    // Create test questions
    const questions = [
      {
        question: 'What is a React Hook?',
        category: 'react' as const,
        difficulty: 'easy' as const,
        options: [
          {
            text: 'A function that allows you to use state and other React features in functional components',
            isCorrect: true,
          },
          { text: 'A class component in React', isCorrect: false },
          { text: 'A method for creating animations', isCorrect: false },
          { text: 'A testing tool', isCorrect: false },
        ],
        explanation:
          'React Hooks are functions that allow you to use state and other React features in functional components.',
      },
      {
        question: 'Which hook is used to manage state in functional components?',
        category: 'react' as const,
        difficulty: 'easy' as const,
        options: [
          { text: 'useState', isCorrect: true },
          { text: 'useEffect', isCorrect: false },
          { text: 'useContext', isCorrect: false },
          { text: 'useReducer', isCorrect: false },
        ],
        explanation:
          'useState is a hook for managing local state in functional components.',
      },
      {
        question: 'What are Server Components in Next.js 13+?',
        category: 'nextjs' as const,
        difficulty: 'medium' as const,
        options: [
          { text: 'Components that render on the server', isCorrect: true },
          { text: 'Components that only work on the client', isCorrect: false },
          { text: 'Components for API routes', isCorrect: false },
          { text: 'Components for middleware', isCorrect: false },
        ],
        explanation:
          'Server Components render on the server and allow you to execute server-side logic directly in components.',
      },
      {
        question: 'Which method is used to create a new element in React?',
        category: 'react' as const,
        difficulty: 'easy' as const,
        options: [
          { text: 'React.createElement()', isCorrect: true },
          { text: 'React.newElement()', isCorrect: false },
          { text: 'React.makeElement()', isCorrect: false },
          { text: 'React.buildElement()', isCorrect: false },
        ],
        explanation: 'React.createElement() is the method for creating React elements.',
      },
      {
        question: 'What is TypeScript?',
        category: 'typescript' as const,
        difficulty: 'easy' as const,
        options: [
          { text: 'A typed superset of JavaScript', isCorrect: true },
          { text: 'A new programming language', isCorrect: false },
          { text: 'A framework for React', isCorrect: false },
          { text: 'A testing tool', isCorrect: false },
        ],
        explanation:
          'TypeScript is a typed superset of JavaScript that adds static typing.',
      },
      {
        question: 'What syntax is used for object destructuring in JavaScript?',
        category: 'javascript' as const,
        difficulty: 'easy' as const,
        options: [
          { text: 'const { name, age } = person', isCorrect: true },
          { text: 'const name, age = person', isCorrect: false },
          { text: 'const [name, age] = person', isCorrect: false },
          { text: 'const name = person.name, age = person.age', isCorrect: false },
        ],
        explanation:
          'Object destructuring uses curly braces {} to extract properties.',
      },
      {
        question: 'What is CSS Grid?',
        category: 'css-html' as const,
        difficulty: 'medium' as const,
        options: [
          { text: 'A two-dimensional layout system for CSS', isCorrect: true },
          { text: 'A one-dimensional layout system', isCorrect: false },
          { text: 'An animation system', isCorrect: false },
          { text: 'A color management system', isCorrect: false },
        ],
        explanation:
          'CSS Grid is a two-dimensional layout system that allows you to create complex layouts.',
      },
      {
        question:
          'Which array method creates a new array with the results of calling a function for every element?',
        category: 'javascript' as const,
        difficulty: 'easy' as const,
        options: [
          { text: 'map()', isCorrect: true },
          { text: 'filter()', isCorrect: false },
          { text: 'reduce()', isCorrect: false },
          { text: 'forEach()', isCorrect: false },
        ],
        explanation:
          'map() creates a new array with the results of calling a function for every element.',
      },
      {
        question: 'What is Virtual DOM in React?',
        category: 'react',
        difficulty: 'medium',
        options: [
          { text: 'A lightweight copy of the real DOM', isCorrect: true },
          { text: 'A real DOM element', isCorrect: false },
          { text: 'A React component', isCorrect: false },
          { text: 'A React hook', isCorrect: false },
        ],
        explanation:
          'Virtual DOM is a lightweight copy of the real DOM that is used to optimize updates.',
      },
      {
        question: 'Which hook is used for performing side effects?',
        category: 'react' as const,
        difficulty: 'easy' as const,
        options: [
          { text: 'useEffect', isCorrect: true },
          { text: 'useState', isCorrect: false },
          { text: 'useContext', isCorrect: false },
          { text: 'useMemo', isCorrect: false },
        ],
        explanation:
          'useEffect is used for performing side effects in functional components.',
      },
    ]

    // Create questions in the database
    const createdQuestions: any[] = []
    for (const questionData of questions) {
      const question = await payload.create({
        collection: 'questions',
        data: questionData as any,
      })
      createdQuestions.push(question)
    }

    // Create tests
    const tests = [
      {
        title: 'React Fundamentals',
        description: 'Test on React basics, including components, hooks, and state',
        category: 'react' as const,
        difficulty: 'easy' as const,
        timeLimit: 15,
        questions: createdQuestions.filter((q) => q.category === 'react').map((q) => q.id),
        isActive: true,
        passingScore: 70,
      },
      {
        title: 'JavaScript ES6+',
        description: 'Test on modern JavaScript features',
        category: 'javascript' as const,
        difficulty: 'medium' as const,
        timeLimit: 20,
        questions: createdQuestions.filter((q) => q.category === 'javascript').map((q) => q.id),
        isActive: true,
        passingScore: 75,
      },
      {
        title: 'Next.js 15',
        description: 'Test on new Next.js 15 features',
        category: 'nextjs' as const,
        difficulty: 'medium' as const,
        timeLimit: 25,
        questions: createdQuestions.filter((q) => q.category === 'nextjs').map((q) => q.id),
        isActive: true,
        passingScore: 80,
      },
      {
        title: 'TypeScript Basics',
        description: 'Test on TypeScript fundamentals',
        category: 'typescript' as const,
        difficulty: 'easy' as const,
        timeLimit: 15,
        questions: createdQuestions.filter((q) => q.category === 'typescript').map((q) => q.id),
        isActive: true,
        passingScore: 70,
      },
      {
        title: 'CSS Grid and Flexbox',
        description: 'Test on modern CSS layout methods',
        category: 'css-html' as const,
        difficulty: 'medium' as const,
        timeLimit: 20,
        questions: createdQuestions.filter((q) => q.category === 'css-html').map((q) => q.id),
        isActive: true,
        passingScore: 75,
      },
      {
        title: 'Full Stack Developer',
        description: 'Comprehensive test covering all technologies',
        category: 'mixed' as const,
        difficulty: 'hard' as const,
        timeLimit: 45,
        questions: createdQuestions.map((q) => q.id),
        isActive: true,
        passingScore: 80,
      },
    ]

    // Create tests in the database
    const createdTests: any[] = []
    for (const testData of tests) {
      const test = await payload.create({
        collection: 'tests',
        data: testData as any,
      })
      createdTests.push(test)
    }

    return NextResponse.json({
      message: 'Test data successfully created',
      questions: createdQuestions.length,
      tests: createdTests.length,
    })
  } catch (error) {
    console.error('Error seeding data:', error)
    return NextResponse.json({ error: 'Failed to seed data' }, { status: 500 })
  }
}
