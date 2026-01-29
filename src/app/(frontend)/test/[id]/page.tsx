'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { flushSync } from 'react-dom'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  X,
  Check,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import RichText from '@/components/RichText'
import { useTestStore } from '@/store/testStore'
import { useTheme } from '@/providers/Theme'
import { cn } from '@/utilities/ui'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

interface Question {
  id: string
  question: string | DefaultTypedEditorState
  options: Array<{
    text: string | DefaultTypedEditorState
    isCorrect: boolean
  }>
  explanation?: string
  answerFeedback?: Array<{
    optionIndex: number
    correctAnswerFeedback?: DefaultTypedEditorState | null
    incorrectAnswerFeedback?: DefaultTypedEditorState | null
  }>
}

interface Test {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  timeLimit?: number
  questions: Question[]
}

export default function TestPage() {
  const { user, isAuthenticated, login, register } = useAuth()
  const params = useParams()
  const router = useRouter()
  const testId = params.id as string

  // Zustand store
  const {
    currentTest,
    startTest,
    setAnswer,
    setCurrentQuestionIndex,
    decrementTimeLeft,
    finishTest,
    resetTest,
    isTestInProgress,
  } = useTestStore()

  const [test, setTest] = useState<Test | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedOptions, setSelectedOptions] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [showResumeDialog, setShowResumeDialog] = useState(false)
  const testInitializedRef = useRef(false)

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register')
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [pendingAnswers, setPendingAnswers] = useState<any[]>([])

  // Get current state from store
  const currentQuestionIndex = currentTest?.currentQuestionIndex ?? 0
  const timeLeft = currentTest?.timeLeft ?? null
  const answers = currentTest?.answers ?? []

  const fetchTest = useCallback(async () => {
    try {
      const response = await fetch(`/api/tests/${testId}/questions`)

      if (!response.ok) {
        throw new Error(`Failed to fetch test: ${response.status}`)
      }

      const data = await response.json()

      if (!data.test) {
        throw new Error('Test data is missing')
      }

      setTest(data.test)
      setQuestions(data.questions || [])
    } catch (error) {
      console.error('Error fetching test:', error)
    } finally {
      setLoading(false)
    }
  }, [testId])

  const handleResumeTest = () => {
    setShowResumeDialog(false)
    // Restore selected options from store
    const storeState = useTestStore.getState()
    const savedAnswer = storeState.currentTest?.answers[storeState.currentTest.currentQuestionIndex]
    if (savedAnswer) {
      setSelectedOptions(savedAnswer.selectedOptions)
    }
  }

  const handleRestartTest = () => {
    setShowResumeDialog(false)
    resetTest()
    startTest(testId, questions.length, test?.timeLimit)
    setSelectedOptions([])
  }

  const handleOptionChange = (optionIndex: number) => {
    const currentQuestion = questions[currentQuestionIndex]
    if (!currentQuestion) return

    // Single select mode - only one option can be selected
    // If clicking the same option, deselect it; otherwise select the new one
    const newOptions = selectedOptions.includes(optionIndex) ? [] : [optionIndex]

    setSelectedOptions(newOptions)
    setAnswer(String(currentQuestion.id), newOptions)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIndex)
      // Load saved answer for next question
      const savedAnswer = answers[nextIndex]
      setSelectedOptions(savedAnswer?.selectedOptions || [])
    } else {
      // Last question - check auth and submit
      handleFinishTest()
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1
      setCurrentQuestionIndex(prevIndex)
      // Load saved answer for previous question
      const savedAnswer = answers[prevIndex]
      setSelectedOptions(savedAnswer?.selectedOptions || [])
    }
  }

  // Handle finish - check if user is authenticated
  const handleFinishTest = () => {
    if (!isAuthenticated) {
      // Save current answers with correct question IDs
      const storeAnswers = currentTest?.answers || []
      // Map answers to include correct questionId from questions array
      const answersWithIds = storeAnswers.map((answer, index) => ({
        ...answer,
        questionId: questions[index]?.id || answer.questionId,
      }))
      setPendingAnswers(answersWithIds)
      setShowAuthModal(true)
    } else {
      // User is authenticated, submit directly
      handleSubmitTest()
    }
  }

  // Handle auth form submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')

    // Validation for registration
    if (authMode === 'register') {
      if (!authForm.name.trim()) {
        setAuthError('Name is required')
        return
      }
      if (authForm.name.trim().length < 2) {
        setAuthError('Name must be at least 2 characters')
        return
      }
      if (!authForm.email.trim()) {
        setAuthError('Email is required')
        return
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authForm.email)) {
        setAuthError('Enter a valid email address')
        return
      }
      if (authForm.password.length < 6) {
        setAuthError('Password must be at least 6 characters')
        return
      }
      if (authForm.password !== authForm.confirmPassword) {
        setAuthError('Passwords do not match')
        return
      }
    }

    setAuthLoading(true)

    try {
      let result
      if (authMode === 'login') {
        result = await login(authForm.email, authForm.password)
      } else {
        result = await register(authForm.name.trim(), authForm.email.trim(), authForm.password)
      }

      if (result.success) {
        setShowAuthModal(false)
        // Reset form
        setAuthForm({ name: '', email: '', password: '', confirmPassword: '' })
        // Submit test with pending answers
        handleSubmitTestWithAnswers(pendingAnswers)
      } else {
        setAuthError(result.error || 'Authentication failed')
      }
    } catch (error) {
      setAuthError('An error occurred')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSubmitTest = useCallback(async () => {
    const storeAnswers = finishTest()
    // Map answers to include correct questionId from questions array
    const answersWithIds = storeAnswers.map((answer, index) => ({
      ...answer,
      questionId: questions[index]?.id || answer.questionId,
    }))
    await handleSubmitTestWithAnswers(answersWithIds)
  }, [finishTest, questions])

  const handleSubmitTestWithAnswers = async (answersToSubmit: any[]) => {
    setSubmitting(true)
    try {
      console.log('Submitting test with answers:', answersToSubmit)

      // Get auth token from localStorage
      const authToken = localStorage.getItem('authToken')
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const response = await fetch('/api/test-results', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          testId,
          answers: answersToSubmit.map((answer) => ({
            questionId: String(answer.questionId),
            selectedOptions: answer.selectedOptions || [],
            timeSpent: answer.timeSpent || 0,
          })),
          timeSpent: test?.timeLimit ? test.timeLimit * 60 - (timeLeft || 0) : 0,
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('API Error:', errorData)
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Test result received:', result)

      if (!result || (result.error && !result.score)) {
        throw new Error(result.error || 'Invalid response from server')
      }

      // Use flushSync to ensure React state updates before clearing Zustand store
      // This prevents the flash of question 1 and potential infinite re-renders
      flushSync(() => {
        setResult(result)
        setShowResult(true)
      })
      
      // Now safe to clear store - React already rendered with showResult = true
      resetTest()
    } catch (error) {
      console.error('Error submitting test:', error)
      alert(`Error submitting test: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Reset initialization when testId changes
  useEffect(() => {
    testInitializedRef.current = false
  }, [testId])

  useEffect(() => {
    if (testId) {
      fetchTest()
    }
  }, [testId, fetchTest])

  // Initialize test after data is loaded (runs only once per testId)
  useEffect(() => {
    // Skip if already initialized or still loading
    if (loading || !test || questions.length === 0 || testInitializedRef.current) {
      return
    }
    
    // Mark as initialized FIRST to prevent any re-runs
    testInitializedRef.current = true
    
    // Get current store state directly (avoid stale closure)
    const storeState = useTestStore.getState()
    
    // Check if there's saved progress for this specific test
    const hasProgress = storeState.currentTest?.testId === testId && 
      storeState.currentTest.answers.some(a => a.selectedOptions.length > 0)
    
    if (hasProgress) {
      setShowResumeDialog(true)
      // Restore selected options for current question
      const savedAnswer = storeState.currentTest?.answers[storeState.currentTest.currentQuestionIndex]
      if (savedAnswer) {
        setSelectedOptions(savedAnswer.selectedOptions)
      }
    } else if (!storeState.currentTest || storeState.currentTest.testId !== testId) {
      // Only start new test if no existing test for this testId
      startTest(testId, questions.length, test.timeLimit)
    }
  }, [loading, test, questions.length, testId, startTest])

  // Timer effect
  useEffect(() => {
    if (
      test?.timeLimit &&
      timeLeft !== null &&
      timeLeft > 0 &&
      !showResult &&
      !showResumeDialog &&
      !showAuthModal
    ) {
      const timer = setInterval(() => {
        decrementTimeLeft()
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [test?.timeLimit, timeLeft, decrementTimeLeft, showResult, showResumeDialog, showAuthModal])

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && !showResult && !submitting && !showAuthModal) {
      handleFinishTest()
    }
  }, [timeLeft, showResult, submitting, showAuthModal])

  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Prevent hydration mismatch - only use theme after mount
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Use light theme on server, actual theme after hydration
  const isDark = mounted && theme === 'dark'
  
  // Background classes (computed once per render, not a new component)
  const bgClass = cn(
    'fixed inset-0 -z-10 transition-colors duration-500',
    isDark
      ? 'bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950'
      : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100',
  )
  
  const auroraClasses = {
    blob1: cn('absolute top-0 -left-40 w-[600px] h-[600px] rounded-full blur-[120px] animate-aurora-1', isDark ? 'bg-blue-600/20' : 'bg-blue-400/30'),
    blob2: cn('absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full blur-[100px] animate-aurora-2', isDark ? 'bg-purple-600/15' : 'bg-purple-400/25'),
    blob3: cn('absolute bottom-0 left-1/3 w-[700px] h-[400px] rounded-full blur-[120px] animate-aurora-3', isDark ? 'bg-indigo-600/15' : 'bg-indigo-300/30'),
    blob4: cn('absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] animate-aurora-4', isDark ? 'bg-cyan-600/10' : 'bg-cyan-300/25'),
  }
  
  // Inline background JSX (not a component to avoid remounting)
  const renderBackground = (children: React.ReactNode) => (
    <div className="min-h-screen relative overflow-hidden">
      <div className={bgClass}>
        <div className={auroraClasses.blob1} />
        <div className={auroraClasses.blob2} />
        <div className={auroraClasses.blob3} />
        <div className={auroraClasses.blob4} />
      </div>
      {children}
    </div>
  )

  if (loading) {
    return renderBackground(
      <div className="flex items-center justify-center min-h-screen">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className={cn(
            "animate-spin rounded-full h-32 w-32 border-4 mx-auto mb-4",
            isDark ? "border-blue-500 border-t-transparent" : "border-blue-600 border-t-transparent"
          )} />
          <p className={cn("text-xl", isDark ? "text-gray-300" : "text-gray-600")}>Loading test...</p>
        </motion.div>
      </div>
    )
  }

  // Resume dialog
  if (showResumeDialog) {
    return renderBackground(
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className={cn(
            "w-full max-w-md backdrop-blur-sm",
            isDark ? "bg-gray-900/80 border-gray-700" : "bg-white/90"
          )}>
            <CardHeader className="text-center">
              <motion.div 
                className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-yellow-500/20"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </motion.div>
              <CardTitle className="text-2xl">Test in Progress</CardTitle>
              <p className={cn("mt-2", isDark ? "text-gray-400" : "text-gray-600")}>
                You have an unfinished test. Would you like to continue where you left off?
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={cn(
                "rounded-lg p-4 text-sm",
                isDark ? "bg-gray-800/50" : "bg-gray-50"
              )}>
                <p>
                  <strong>Progress:</strong> Question{' '}
                  {(currentTest?.currentQuestionIndex ?? 0) + 1} of {questions.length}
                </p>
                {currentTest?.timeLeft != null && currentTest.timeLeft > 0 && (
                  <p>
                    <strong>Time remaining:</strong> {formatTime(currentTest.timeLeft)}
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <Button onClick={handleRestartTest} variant="outline" className="flex-1">
                  Start Over
                </Button>
                <Button
                  onClick={handleResumeTest}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (showResult) {
    if (!result) {
      return renderBackground(
        <div className="flex items-center justify-center min-h-screen">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className={cn(
              "animate-spin rounded-full h-32 w-32 border-4 mx-auto mb-4",
              isDark ? "border-blue-500 border-t-transparent" : "border-blue-600 border-t-transparent"
            )} />
            <p className={cn("text-xl", isDark ? "text-gray-300" : "text-gray-600")}>Processing results...</p>
          </motion.div>
        </div>
      )
    }

    return renderBackground(
        <div className="flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className={cn(
              "w-full max-w-2xl backdrop-blur-sm",
              isDark ? "bg-gray-900/80 border-gray-700" : "bg-white/90"
            )}>
              <CardHeader className="text-center">
                <motion.div
                  className={cn(
                    "mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4",
                    result.isPassed 
                      ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20" 
                      : "bg-gradient-to-br from-red-500/20 to-rose-500/20"
                  )}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  {result.isPassed ? (
                    <CheckCircle className="h-10 w-10 text-green-500" />
                  ) : (
                    <XCircle className="h-10 w-10 text-red-500" />
                  )}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <CardTitle
                    className={cn(
                      "text-3xl font-bold",
                      result.isPassed 
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent" 
                        : "bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent"
                    )}
                  >
                    {result.isPassed ? 'Congratulations!' : 'Try Again'}
                  </CardTitle>
                  <p className={cn("mt-2", isDark ? "text-gray-400" : "text-gray-600")}>
                    {result.isPassed
                      ? 'You have successfully passed the test!'
                      : 'Unfortunately, you did not pass the test. Please try again!'}
                  </p>
                </motion.div>
              </CardHeader>
              <CardContent className="space-y-6">
                <motion.div 
                  className="grid grid-cols-2 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className={cn(
                    "text-center p-6 rounded-xl",
                    isDark ? "bg-blue-500/10 border border-blue-500/20" : "bg-blue-50"
                  )}>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                      {result.score !== undefined ? `${result.score}%` : 'N/A'}
                    </p>
                    <p className={cn("text-sm mt-1", isDark ? "text-gray-400" : "text-gray-600")}>Total Score</p>
                  </div>
                  <div className={cn(
                    "text-center p-6 rounded-xl",
                    isDark ? "bg-green-500/10 border border-green-500/20" : "bg-green-50"
                  )}>
                    <p className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                      {result.correctAnswers !== undefined && result.totalQuestions !== undefined
                        ? `${result.correctAnswers}/${result.totalQuestions}`
                        : 'N/A'}
                    </p>
                    <p className={cn("text-sm mt-1", isDark ? "text-gray-400" : "text-gray-600")}>Correct Answers</p>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button onClick={() => router.push('/')} variant="outline" className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                  </Button>
                  <Button 
                    onClick={() => router.push('/dashboard')} 
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Go to Dashboard
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
    )
  }

  if (!test || !questions.length) {
    return renderBackground(
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={cn(
            "w-full max-w-md backdrop-blur-sm",
            isDark ? "bg-gray-900/80 border-gray-700" : "bg-white/90"
          )}>
            <CardHeader>
              <CardTitle className="text-center text-red-500">Test Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/')} className="w-full" variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  // Calculate answered questions for progress indicator
  const answeredCount = answers.filter((a) => a.selectedOptions.length > 0).length

  return (
    <>
      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {authMode === 'login' ? 'Log In to Save Results' : 'Register to Save Results'}
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Create an account to save your test results and track your progress
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'register' && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      placeholder="Your name"
                      required={authMode === 'register'}
                      disabled={authLoading}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                    disabled={authLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      placeholder="Password (min 6 characters)"
                      required
                      minLength={6}
                      disabled={authLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {authMode === 'register' && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={authForm.confirmPassword}
                        onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                        placeholder="Confirm your password"
                        required
                        disabled={authLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {authError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {authError}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : authMode === 'login' ? (
                    <LogIn className="h-4 w-4 mr-2" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  {authMode === 'login' ? 'Log In & Save Results' : 'Register & Save Results'}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  {authMode === 'login' ? (
                    <>
                      Don&apos;t have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setAuthMode('register')}
                        className="text-blue-600 hover:underline"
                      >
                        Register
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setAuthMode('login')}
                        className="text-blue-600 hover:underline"
                      >
                        Log In
                      </button>
                    </>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {renderBackground(
        <>
        {/* Header */}
        <div className={cn(
          "backdrop-blur-md border-b sticky top-0 z-10",
          isDark ? "bg-gray-900/80 border-gray-700" : "bg-white/80 border-gray-200"
        )}>
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className={cn(
                  "text-2xl font-bold",
                  isDark ? "text-white" : "text-gray-800"
                )}>{test.title}</h1>
                <p className={cn(isDark ? "text-gray-400" : "text-gray-600")}>
                  Question {currentQuestionIndex + 1} of {questions.length}
                  <span className={cn("ml-2", isDark ? "text-gray-500" : "text-gray-400")}>({answeredCount} answered)</span>
                </p>
              </div>
              <div className="flex items-center gap-4">
                {!isAuthenticated && (
                  <span className={cn("text-sm", isDark ? "text-gray-500" : "text-gray-500")}>Guest mode</span>
                )}
                {timeLeft !== null && (
                  <motion.div
                    className={cn(
                      "flex items-center text-lg font-semibold px-4 py-2 rounded-full",
                      timeLeft < 60 
                        ? "bg-red-500/10 text-red-500" 
                        : isDark 
                          ? "bg-blue-500/10 text-blue-400" 
                          : "bg-blue-500/10 text-blue-600"
                    )}
                    animate={timeLeft < 60 ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 0.5, repeat: timeLeft < 60 ? Infinity : 0 }}
                  >
                    <Clock className="mr-2 h-5 w-5" />
                    {formatTime(timeLeft)}
                  </motion.div>
                )}
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={cn(
                "mb-8 backdrop-blur-sm",
                isDark ? "bg-gray-900/80 border-gray-700" : "bg-white/90"
              )}>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className={cn(
                      isDark && "border-gray-600 text-gray-300"
                    )}>{test.category}</Badge>
                    <Badge variant="outline" className={cn(
                      isDark && "border-gray-600 text-gray-300"
                    )}>{test.difficulty}</Badge>
                  </div>
                  <div className={cn("text-xl leading-relaxed", isDark && "text-white")}>
                    {typeof currentQuestion.question === 'string' ? (
                      <CardTitle>{currentQuestion.question}</CardTitle>
                    ) : (
                      <RichText data={currentQuestion.question} enableGutter={false} />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedOptions.includes(index)
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "flex items-start space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer group",
                          isSelected
                            ? "border-blue-500 bg-gradient-to-r from-blue-500/10 to-purple-500/10 shadow-lg shadow-blue-500/10"
                            : isDark
                              ? "border-gray-700 hover:border-gray-600 hover:bg-gray-800/50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        )}
                        onClick={() => handleOptionChange(index)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className={cn(
                          "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all mt-0.5",
                          isSelected
                            ? "border-blue-500 bg-blue-500"
                            : isDark
                              ? "border-gray-600 group-hover:border-gray-500"
                              : "border-gray-300 group-hover:border-gray-400"
                        )}>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500 }}
                              className="w-3 h-3 rounded-full bg-white"
                            />
                          )}
                        </div>
                        <div className={cn(
                          "flex-1",
                          isDark ? "text-gray-200" : "text-gray-700"
                        )}>
                          {typeof option.text === 'string' ? (
                            <span>{option.text}</span>
                          ) : (
                            <RichText data={option.text} enableGutter={false} enableProse={false} />
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Stepper Navigation */}
          <div className={cn(
            "mb-8 p-4 rounded-2xl backdrop-blur-sm",
            isDark ? "bg-gray-900/50" : "bg-white/50"
          )}>
            <div className="flex flex-wrap justify-center gap-2">
              {questions.map((_, index) => {
                const step = index + 1
                const isActive = index === currentQuestionIndex
                const isCompleted = answers[index]?.selectedOptions?.length > 0
                
                return (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setCurrentQuestionIndex(index)
                      const savedAnswer = answers[index]
                      setSelectedOptions(savedAnswer?.selectedOptions || [])
                    }}
                    className={cn(
                      "relative flex items-center justify-center w-10 h-10 rounded-full font-medium text-sm transition-all duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                      isActive && "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg ring-2 ring-blue-400/50",
                      !isActive && isCompleted && "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md",
                      !isActive && !isCompleted && (
                        isDark 
                          ? "bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700" 
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                      )
                    )}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    {isCompleted && !isActive ? (
                      <Check className="h-4 w-4" />
                    ) : isActive ? (
                      <motion.div
                        className="w-3 h-3 rounded-full bg-white"
                        layoutId="activeDot"
                      />
                    ) : (
                      step
                    )}

                    {/* Active pulse */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-blue-400"
                        initial={{ scale: 1, opacity: 1 }}
                        animate={{ scale: 1.4, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className={cn(
                isDark && "border-gray-700 hover:bg-gray-800"
              )}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <Button
              onClick={handleNextQuestion}
              disabled={selectedOptions.length === 0 || submitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
            >
              {currentQuestionIndex === questions.length - 1 ? (
                <>
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Finish Test
                      <CheckCircle className="ml-2 h-4 w-4" />
                    </>
                  )}
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
        </>
      )}
    </>
  )
}
