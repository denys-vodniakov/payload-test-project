'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogIn, UserPlus, ArrowLeft } from 'lucide-react'
import AnimatedBackground from '@/components/AnimatedBackground'
import GlassCard from '@/components/GlassCard'
import GradientText from '@/components/GradientText'

interface ProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Не перенаправляем автоматически, показываем fallback
    }
  }, [isAuthenticated, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
        <AnimatedBackground />

        <div className="relative z-10 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <GradientText className="text-4xl font-bold mb-2">Доступ ограничен</GradientText>
              <p className="text-gray-600">
                Для доступа к этой странице необходимо войти в систему
              </p>
            </div>

            <GlassCard className="p-8">
              <CardHeader className="text-center">
                <CardTitle className="text-xl mb-4">Выберите действие</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Войти в систему
                  </Link>
                </Button>

                <Button asChild variant="outline" className="w-full">
                  <Link href="/register">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Зарегистрироваться
                  </Link>
                </Button>

                <Button asChild variant="ghost" className="w-full">
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    На главную
                  </Link>
                </Button>
              </CardContent>
            </GlassCard>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
