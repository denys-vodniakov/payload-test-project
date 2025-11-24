'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string | number
  name?: string | null
  email: string
  createdAt: string
  updatedAt: string
  role?: ('user' | 'admin') | null
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Проверяем сохраненные данные при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedToken = localStorage.getItem('authToken')
        const savedUser = localStorage.getItem('user')

        if (savedToken && savedUser) {
          // Проверяем валидность токена из localStorage
          const response = await fetch('/api/auth/verify', {
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          })

          if (response.ok) {
            setToken(savedToken)
            setUser(JSON.parse(savedUser))
            setLoading(false)
            return
          } else {
            // Токен недействителен, очищаем данные
            localStorage.removeItem('authToken')
            localStorage.removeItem('user')
          }
        }

        // Если в localStorage нет токена, проверяем куку payload-token
        // Это нужно для пользователей, авторизованных через админку Payload
        const cookieResponse = await fetch('/api/auth/me', {
          credentials: 'include', // Важно: отправляем куки
        })

        if (cookieResponse.ok) {
          const data = await cookieResponse.json()
          if (data.user) {
            setUser(data.user)
            // Для куки токена не сохраняем в localStorage, так как это Payload токен
            // Но устанавливаем флаг, что пользователь авторизован
            setToken('cookie-auth') // Маркер для авторизации через куки
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Ошибка входа' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Произошла ошибка при входе' }
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Ошибка регистрации' }
      }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, error: 'Произошла ошибка при регистрации' }
    }
  }

  const logout = async () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')

    // Очищаем куку payload-token, если она есть
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    }

    router.push('/')
  }

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
