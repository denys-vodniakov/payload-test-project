'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Eye, EyeOff, UserPlus, Mail, Lock, User, Moon, Sun } from 'lucide-react'
import AnimatedBackground from '@/components/AnimatedBackground'
import GlassCard from '@/components/GlassCard'
import GradientText from '@/components/GradientText'
import { useTheme } from '@/providers/Theme'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно для заполнения'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен для заполнения'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Введите корректный email'
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен для заполнения'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите пароль'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают'
    }

    if (!agreeToTerms) {
      newErrors.terms = 'Необходимо согласиться с условиями использования'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      // Используем register из AuthContext для правильного обновления состояния
      const result = await register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password,
      )

      if (result.success) {
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        setErrors({ general: result.error || 'Registration error' })
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ general: 'Registration error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 relative transition-colors duration-300">
      <AnimatedBackground />

      {/* Header */}
      <div className="relative z-10 pt-8 px-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Link>
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <GradientText className="text-4xl font-bold mb-2">Registration</GradientText>
            <p className="text-muted-foreground">Create an account to take tests</p>
          </div>

          <GlassCard className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Введите ваше имя"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                    disabled={loading}
                  />
                </div>
                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Введите ваш email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    disabled={loading}
                  />
                </div>
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Введите пароль"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Подтвердите пароль"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  disabled={loading}
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 leading-5">
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-800 underline">
                    terms of use
                  </Link>{' '}
                  и{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                    privacy policy
                  </Link>
                </Label>
              </div>
              {errors.terms && <p className="text-sm text-red-600">{errors.terms}</p>}

              {/* General Error */}
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register
                  </>
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  Login
                </Link>
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
