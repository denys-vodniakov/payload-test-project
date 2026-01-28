'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string | number
  name?: string | null
  email: string
  phone?: string | null
  bio?: string | null
  company?: string | null
  position?: string | null
  avatar?: {
    url?: string
    alt?: string
  } | null
  createdAt: string
  updatedAt: string
  role?: ('user' | 'admin') | null
}

interface UpdateProfileData {
  name?: string
  phone?: string
  bio?: string
  company?: string
  position?: string
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
  updateProfile: (data: UpdateProfileData) => Promise<{ success: boolean; error?: string }>
  updateAvatar: (file: File) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
  refreshUser: () => Promise<void>
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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedToken = localStorage.getItem('authToken')
        const savedUser = localStorage.getItem('user')

        if (savedToken && savedUser) {
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
            localStorage.removeItem('authToken')
            localStorage.removeItem('user')
          }
        }

        const cookieResponse = await fetch('/api/auth/me', {
          credentials: 'include',
        })

        if (cookieResponse.ok) {
          const data = await cookieResponse.json()
          if (data.user) {
            setUser(data.user)
            setToken('cookie-auth')
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
        return { success: false, error: data.error || 'Login error' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login error' }
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
        return { success: false, error: data.error || 'Registration error' }
      }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, error: 'Registration error' }
    }
  }

  const updateProfile = async (data: UpdateProfileData) => {
    try {
      const localToken = localStorage.getItem('authToken')
      const authToken = localToken || (token && token !== 'cookie-auth' ? token : null)

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setUser(result.user)
        localStorage.setItem('user', JSON.stringify(result.user))
        return { success: true }
      } else {
        return { success: false, error: result.error || 'Failed to update profile' }
      }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, error: 'Failed to update profile' }
    }
  }

  const updateAvatar = async (file: File) => {
    try {
      const localToken = localStorage.getItem('authToken')
      const authToken = localToken || (token && token !== 'cookie-auth' ? token : null)

      const formData = new FormData()
      formData.append('file', file)

      const headers: HeadersInit = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setUser(result.user)
        localStorage.setItem('user', JSON.stringify(result.user))
        return { success: true }
      } else {
        return { success: false, error: result.error || 'Failed to update avatar' }
      }
    } catch (error) {
      console.error('Update avatar error:', error)
      return { success: false, error: 'Failed to update avatar' }
    }
  }

  const refreshUser = async () => {
    try {
      const localToken = localStorage.getItem('authToken')
      const authToken = localToken || (token && token !== 'cookie-auth' ? token : null)

      const headers: HeadersInit = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const response = await fetch('/api/auth/me', {
        headers,
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setUser(data.user)
          localStorage.setItem('user', JSON.stringify(data.user))
        }
      }
    } catch (error) {
      console.error('Refresh user error:', error)
    }
  }

  const logout = async () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')

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
    updateProfile,
    updateAvatar,
    logout,
    isAuthenticated: !!user && !!token,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
