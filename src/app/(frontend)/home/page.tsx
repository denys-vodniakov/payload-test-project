'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, BookOpen, Clock, Trophy, Users, Zap, LogOut, User } from 'lucide-react'
import Link from 'next/link'
import AnimatedBackground from '@/components/AnimatedBackground'
import GlassCard from '@/components/GlassCard'
import GradientText from '@/components/GradientText'
import { useAuth } from '@/contexts/AuthContext'

interface Test {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  timeLimit?: number
  questions: any[]
}

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuth()
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/tests')
      const data = await response.json()
      setTests(data.docs || [])
    } catch (error) {
      console.error('Error fetching tests:', error)
    } finally {
      setLoading(false)
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
      <AnimatedBackground />
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <GradientText className="text-5xl md:text-7xl font-bold mb-6 animate-gradient">
              Ассесмент Тесты
            </GradientText>
            {isAuthenticated && user && (
              <div className="mb-4 p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <p className="text-lg text-gray-700">
                  Добро пожаловать, <span className="font-semibold text-blue-600">{user.name}</span>
                  ! 👋
                </p>
              </div>
            )}
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Проверьте свои знания в области веб-разработки с помощью наших интерактивных тестов по
              React, Next.js и современным технологиям
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
            >
              <Link href="#tests">
                <BookOpen className="mr-2 h-5 w-5" />
                Начать тестирование
              </Link>
            </Button>
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="lg" className="px-8 py-4 text-lg">
                  <Link href="/dashboard">
                    <User className="mr-2 h-5 w-5" />
                    Мой кабинет
                  </Link>
                </Button>
                <Button
                  onClick={logout}
                  variant="ghost"
                  size="lg"
                  className="px-6 py-4 text-lg text-gray-600 hover:text-gray-800"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Выйти
                </Button>
              </div>
            ) : (
              <div className="flex gap-4">
                <Button asChild variant="outline" size="lg" className="px-8 py-4 text-lg">
                  <Link href="/login">
                    <Users className="mr-2 h-5 w-5" />
                    Войти
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="px-8 py-4 text-lg bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                >
                  <Link href="/register">
                    <Users className="mr-2 h-5 w-5" />
                    Регистрация
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <GlassCard className="p-6 shadow-lg animate-float">
              <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800">1000+</h3>
              <p className="text-gray-600">Вопросов в базе</p>
            </GlassCard>
            <GlassCard className="p-6 shadow-lg animate-float" style={{ animationDelay: '0.5s' }}>
              <Zap className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800">50+</h3>
              <p className="text-gray-600">Тестов доступно</p>
            </GlassCard>
            <GlassCard className="p-6 shadow-lg animate-float" style={{ animationDelay: '1s' }}>
              <Clock className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800">15 мин</h3>
              <p className="text-gray-600">Среднее время</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Tests Section */}
      <section id="tests" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Доступные тесты</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Выберите тест по интересующей вас технологии и проверьте свои знания
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tests.map((test, index) => (
                <Card
                  key={test.id}
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/80 backdrop-blur-sm animate-slide-in-up hover-lift"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getDifficultyColor(test.difficulty)}>
                        {getDifficultyLabel(test.difficulty)}
                      </Badge>
                      <Badge variant="outline">{getCategoryLabel(test.category)}</Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                      {test.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">{test.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1" />
                        {test.questions?.length || 0} вопросов
                      </span>
                      {test.timeLimit && (
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {test.timeLimit} мин
                        </span>
                      )}
                    </div>
                    <Button asChild className="w-full group-hover:bg-blue-600 transition-colors">
                      <Link href={`/test/${test.id}`}>
                        Начать тест
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Почему выбирают нас?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Современная платформа для оценки навыков веб-разработки
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 mb-4 w-16 h-16 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Быстро</h3>
              <p className="text-gray-600">Мгновенные результаты и обратная связь</p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl p-6 mb-4 w-16 h-16 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Актуально</h3>
              <p className="text-gray-600">Самые свежие вопросы по современным технологиям</p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 mb-4 w-16 h-16 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Эффективно</h3>
              <p className="text-gray-600">Помогает выявить пробелы в знаниях</p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 mb-4 w-16 h-16 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Удобно</h3>
              <p className="text-gray-600">Интуитивный интерфейс и статистика</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
