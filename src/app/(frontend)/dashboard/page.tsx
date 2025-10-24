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
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'

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
      const response = await fetch('/api/user/stats', {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Мой кабинет</h1>
              <p className="text-xl text-gray-600">
                Добро пожаловать, <span className="font-semibold text-blue-600">{user?.name}</span>!
              </p>
            </div>
            <Button onClick={logout} variant="outline" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Выйти
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Всего тестов</p>
                    <p className="text-3xl font-bold">{stats.totalTests}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Пройдено</p>
                    <p className="text-3xl font-bold">{stats.passedTests}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Средний балл</p>
                    <p className="text-3xl font-bold">{stats.averageScore}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Время изучения</p>
                    <p className="text-3xl font-bold">{formatTime(stats.totalTimeSpent)}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Category Stats */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Статистика по категориям
                  </CardTitle>
                  <CardDescription>Ваши результаты по разным технологиям</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.categoryStats.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{getCategoryLabel(category.category)}</span>
                        <span className="text-sm text-gray-600">
                          {category.tests} тестов • {category.averageScore}% средний балл
                        </span>
                      </div>
                      <Progress value={category.averageScore} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="mr-2 h-5 w-5" />
                    Быстрые действия
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full">
                    <Link href="/">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Пройти новый тест
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Повторить неудачные
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Award className="mr-2 h-4 w-4" />
                    Сложные тесты
                  </Button>
                </CardContent>
              </Card>

              {/* Pass Rate */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="mr-2 h-5 w-5" />
                    Процент прохождения
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">{passRate}%</div>
                    <Progress value={passRate} className="h-3 mb-2" />
                    <p className="text-sm text-gray-600">
                      {stats.passedTests} из {stats.totalTests} тестов пройдено
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
                Последние результаты
              </CardTitle>
              <CardDescription>Ваши недавние попытки прохождения тестов</CardDescription>
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
                        {result.correctAnswers}/{result.totalQuestions} правильных ответов •
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
