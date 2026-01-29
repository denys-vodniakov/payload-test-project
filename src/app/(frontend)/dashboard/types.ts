// Shared types for dashboard stats (server + client)

export interface AnswerFeedback {
  optionIndex: number
  feedbackType: 'correct' | 'incorrect'
  content: any
}

export interface TestAnswer {
  questionId: number
  question?: {
    id: string
    questionTitle: string
    question: any
  }
  isCorrect: boolean
  selectedOptions: Array<{ optionIndex: number }>
  timeSpent: number
  feedback: AnswerFeedback[] | null
  explanation: string | null
}

export interface TestResult {
  id: string
  test: {
    id: string
    title: string
    category: string
    difficulty: string
  }
  score: number
  correctAnswers: number
  totalQuestions: number
  timeSpent: number
  isPassed: boolean
  completedAt: string
  answers?: TestAnswer[]
}

export interface Stats {
  totalTests: number
  passedTests: number
  averageScore: number
  totalTimeSpent: number
  categoryStats: Array<{
    category: string
    tests: number
    averageScore: number
  }>
  recentResults: TestResult[]
}

export interface DashboardUser {
  id: string | number
  name?: string | null
  email: string
  avatar?: { url?: string; alt?: string } | number | null
  [key: string]: any
}
