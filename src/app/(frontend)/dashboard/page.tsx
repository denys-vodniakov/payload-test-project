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
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useTheme } from '@/providers/Theme'
import AnimatedBackground from '@/components/AnimatedBackground'
import GlassCard from '@/components/GlassCard'
import GradientText from '@/components/GradientText'

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
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      // Получаем результаты тестов пользователя
      const response = await fetch('/api/(payload)/user/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
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
      // Fallback к mock данным
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
    return new Date(dateString).toLocaleDateString('ru-RU', {
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
        return 'Легкий'
      case 'medium':
        return 'Средний'
      case 'hard':
        return 'Сложный'
      default:
        return 'Смешанный'
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
        return 'Общие вопросы'
      default:
        return 'Смешанный'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Загрузка статистики...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Ошибка загрузки</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchStats} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Попробовать снова
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
                  {stats.categoryStats.map((category, index) => (
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
                  ))}
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
                {stats.recentResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{result.test.title}</h4>
                        <Badge className={getDifficultyColor(result.test.difficulty)}>
                          {getDifficultyLabel(result.test.difficulty)}
                        </Badge>
                        <Badge variant="outline">{getCategoryLabel(result.test.category)}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {result.correctAnswers}/{result.totalQuestions} correct answers •
                        {formatTime(result.timeSpent)} •{formatDate(result.completedAt)}
                      </p>
                    </div>
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
                          {result.isPassed ? 'Пройден' : 'Не пройден'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
