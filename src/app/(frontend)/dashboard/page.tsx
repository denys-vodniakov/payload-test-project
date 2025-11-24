'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Trophy,
  BookOpen,
  Clock,
  TrendingUp,
  RefreshCw,
  BarChart3,
  Calendar,
  Target,
  Award,
  LogOut,
  Moon,
  Sun,
  Sparkles,
  Zap,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useTheme } from '@/providers/Theme'
import AnimatedBackground from '@/components/AnimatedBackground'
import GlassCard from '@/components/GlassCard'
import GradientText from '@/components/GradientText'
import RichText from '@/components/RichText'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface AnswerFeedback {
  optionIndex: number
  feedbackType: 'correct' | 'incorrect'
  content: any
}

interface TestAnswer {
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

interface TestResult {
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

interface Stats {
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

export default function DashboardPage() {
  const { user, logout, token, loading: authLoading } = useAuth()
  const { theme, setTheme } = useTheme()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Ждем завершения проверки авторизации перед загрузкой статистики
    if (!authLoading && user) {
      fetchStats()
    } else if (!authLoading && !user) {
      // Если авторизация завершена, но пользователя нет, останавливаем загрузку
      setLoading(false)
    }
  }, [user, authLoading])

  const fetchStats = async () => {
    try {
      // Проверяем токен из localStorage или из AuthContext
      const localToken = localStorage.getItem('authToken')
      const authToken = localToken || (token && token !== 'cookie-auth' ? token : null)

      // Подготавливаем заголовки и опции запроса
      const headers: HeadersInit = {}
      const options: RequestInit = {
        credentials: 'include', // Всегда отправляем куки
      }

      // Если есть токен в localStorage или AuthContext (не cookie-auth), используем его
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }
      // Если токена нет, полагаемся на куку payload-token

      // Получаем результаты тестов пользователя
      const response = await fetch('/api/user/stats', {
        ...options,
        headers,
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Error fetching stats:', response.status, errorData)
        
        // Если это ошибка авторизации, не устанавливаем mock данные
        if (response.status === 401) {
          console.error('Unauthorized - user may not be authenticated')
          setStats(null)
          return
        }
        
        // Fallback к mock данным если API недоступен
        const mockStats: Stats = {
          totalTests: 0,
          passedTests: 0,
          averageScore: 0,
          totalTimeSpent: 0,
          categoryStats: [],
          recentResults: [],
        }
        setStats(mockStats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Fallback к mock данным только если это не ошибка сети/таймаута
      const mockStats: Stats = {
        totalTests: 0,
        passedTests: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        categoryStats: [],
        recentResults: [],
      }
      setStats(mockStats)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}ч ${minutes}м`
    }
    return `${minutes}м`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Easy'
      case 'medium':
        return 'Medium'
      case 'hard':
        return 'Hard'
      default:
        return 'Mixed'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'react':
        return 'React'
      case 'nextjs':
        return 'Next.js'
      case 'javascript':
        return 'JavaScript'
      case 'typescript':
        return 'TypeScript'
      case 'css-html':
        return 'CSS/HTML'
      case 'general':
        return 'General'
      default:
        return 'Mixed'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading statistics...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Loading Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchStats} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const passRate = Math.round((stats.passedTests / stats.totalTests) * 100)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 relative transition-colors duration-300">
        <AnimatedBackground />

        {/* Theme Toggle - Fixed Position */}
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-muted-foreground hover:text-foreground bg-background/80 backdrop-blur-sm border border-border/50"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <GradientText className="text-4xl font-bold mb-2">My Dashboard</GradientText>
              <p className="text-xl text-muted-foreground">
                Welcome back, <span className="font-semibold text-primary">{user?.name}</span>! 👋
              </p>
            </div>
            <Button onClick={logout} variant="outline" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <GlassCard className="p-6 shadow-lg animate-float hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Tests</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalTests}</p>
                </div>
                <div className="p-3 bg-primary/20 rounded-full">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
              </div>
            </GlassCard>

            <GlassCard
              className="p-6 shadow-lg animate-float hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Passed Tests</p>
                  <p className="text-3xl font-bold text-foreground">{stats.passedTests}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-full">
                  <Trophy className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </GlassCard>

            <GlassCard
              className="p-6 shadow-lg animate-float hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Average Score</p>
                  <p className="text-3xl font-bold text-foreground">{stats.averageScore}%</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <Target className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </GlassCard>

            <GlassCard
              className="p-6 shadow-lg animate-float hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Time Spent</p>
                  <p className="text-3xl font-bold text-foreground">
                    {formatTime(stats.totalTimeSpent)}
                  </p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-full">
                  <Clock className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Category Stats */}
            <div className="lg:col-span-2">
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold text-foreground">Category Statistics</h3>
                  </div>
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                </div>
                <div className="space-y-4">
                  {stats.categoryStats.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No category statistics yet</p>
                      <p className="text-sm mt-2">Complete tests to see statistics by category</p>
                    </div>
                  ) : (
                    stats.categoryStats.map((category, index) => (
                    <div
                      key={index}
                      className="animate-slide-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">
                          {getCategoryLabel(category.category)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {category.tests} tests • {category.averageScore}% avg
                        </span>
                      </div>
                      <Progress value={category.averageScore} className="h-2" />
                    </div>
                    ))
                  )}
                </div>
              </GlassCard>
            </div>

            {/* Quick Actions */}
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="mr-2 h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full">
                    <Link href="/">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Take New Test
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retake Failed Tests
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Award className="mr-2 h-4 w-4" />
                    Advanced Tests
                  </Button>
                </CardContent>
              </Card>

              {/* Pass Rate */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="mr-2 h-5 w-5" />
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">{passRate}%</div>
                    <Progress value={passRate} className="h-3 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {stats.passedTests} of {stats.totalTests} tests passed
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Results */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Recent Results
              </CardTitle>
              <CardDescription>Your recent test attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentResults.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No test results yet</p>
                    <p className="text-sm mt-2">Start taking tests to see your results here</p>
                    <Button asChild className="mt-4">
                      <Link href="/">Take Your First Test</Link>
                    </Button>
                  </div>
                ) : (
                  stats.recentResults.map((result) => {
                    const isExpanded = expandedResults.has(result.id)
                    return (
                    <Collapsible
                      key={result.id}
                      open={isExpanded}
                      onOpenChange={(open) => {
                        const newSet = new Set(expandedResults)
                        if (open) {
                          newSet.add(result.id)
                        } else {
                          newSet.delete(result.id)
                        }
                        setExpandedResults(newSet)
                      }}
                    >
                      <div className="border rounded-lg">
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{result.test.title}</h4>
                                <Badge className={getDifficultyColor(result.test.difficulty)}>
                                  {getDifficultyLabel(result.test.difficulty)}
                                </Badge>
                                <Badge variant="outline">{getCategoryLabel(result.test.category)}</Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                {result.correctAnswers}/{result.totalQuestions} correct answers •{' '}
                                {formatTime(result.timeSpent)} • {formatDate(result.completedAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div
                                  className={`text-2xl font-bold ${
                                    result.isPassed ? 'text-green-600' : 'text-red-600'
                                  }`}
                                >
                                  {result.score}%
                                </div>
                                <div className="flex items-center gap-1">
                                  {result.isPassed ? (
                                    <Trophy className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <RefreshCw className="h-4 w-4 text-red-600" />
                                  )}
                                  <span className="text-sm text-gray-600">
                                    {result.isPassed ? 'Passed' : 'Failed'}
                                  </span>
                                </div>
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="p-4 pt-0 border-t bg-gray-50">
                            {result.answers && result.answers.length > 0 ? (
                              <div className="space-y-4">
                                <h5 className="font-semibold text-sm mb-3">Answers & Feedback:</h5>
                                {result.answers.map((answer, idx) => (
                                  <div
                                    key={idx}
                                    className={`p-3 rounded-lg border-2 ${
                                      answer.isCorrect
                                        ? 'border-green-200 bg-green-50'
                                        : 'border-red-200 bg-red-50'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2 mb-2">
                                      {answer.isCorrect ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                      ) : (
                                        <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                      )}
                                      <div className="flex-1">
                                        <div className="font-medium text-sm mb-1">
                                          Question {idx + 1}
                                          {answer.question?.questionTitle && (
                                            <span className="text-gray-600 ml-2">
                                              - {answer.question.questionTitle}
                                            </span>
                                          )}
                                        </div>
                                        {answer.feedback && answer.feedback.length > 0 && (
                                          <div className="mt-2 space-y-2">
                                            {answer.feedback.map((fb, fbIdx) => (
                                              <div
                                                key={fbIdx}
                                                className={`p-2 rounded ${
                                                  fb.feedbackType === 'correct'
                                                    ? 'bg-green-100'
                                                    : 'bg-red-100'
                                                }`}
                                              >
                                                <div className="text-xs font-medium mb-1">
                                                  {fb.feedbackType === 'correct'
                                                    ? '✓ Correct Answer Feedback'
                                                    : '✗ Incorrect Answer Feedback'}
                                                </div>
                                                <RichText data={fb.content} enableGutter={false} />
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                        {answer.explanation && (
                                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                                            <div className="font-medium mb-1">Explanation:</div>
                                            <p>{answer.explanation}</p>
                                          </div>
                                        )}
                                        {!answer.feedback && !answer.explanation && (
                                          <div className="text-sm text-gray-500 mt-1">
                                            No feedback available for this answer
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No answer details available</p>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
