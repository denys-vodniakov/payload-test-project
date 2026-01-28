'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
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
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import RichText from '@/components/RichText'
import { useTestStore } from '@/store/testStore'
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

    setSelectedOptions((prev) => {
      const newOptions = prev.includes(optionIndex)
        ? prev.filter((index) => index !== optionIndex)
        : [...prev, optionIndex]

      // Save to store
      setAnswer(String(currentQuestion.id), newOptions)
      return newOptions
    })
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

      // Clear store after successful submission
      resetTest()
      setResult(result)
      setShowResult(true)
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

  // Initialize test after data is loaded (runs only once)
  useEffect(() => {
    if (!loading && test && questions.length > 0 && !testInitializedRef.current) {
      testInitializedRef.current = true
      
      // Get current store state directly (avoid stale closure)
      const storeState = useTestStore.getState()
      const hasProgress = storeState.currentTest?.testId === testId && 
        storeState.currentTest.answers.some(a => a.selectedOptions.length > 0)
      
      if (hasProgress) {
        setShowResumeDialog(true)
        // Restore selected options for current question
        const savedAnswer = storeState.currentTest?.answers[storeState.currentTest.currentQuestionIndex]
        if (savedAnswer) {
          setSelectedOptions(savedAnswer.selectedOptions)
        }
      } else {
        // Start new test
        startTest(testId, questions.length, test.timeLimit)
      }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading test...</p>
        </div>
      </div>
    )
  }

  // Resume dialog
  if (showResumeDialog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-yellow-100">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl">Test in Progress</CardTitle>
            <p className="text-gray-600 mt-2">
              You have an unfinished test. Would you like to continue where you left off?
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
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
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showResult) {
    if (!result) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Processing results...</p>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div
              className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                result.isPassed ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              {result.isPassed ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
            </div>
            <CardTitle
              className={`text-3xl ${result.isPassed ? 'text-green-600' : 'text-red-600'}`}
            >
              {result.isPassed ? 'Congratulations!' : 'Try Again'}
            </CardTitle>
            <p className="text-gray-600">
              {result.isPassed
                ? 'You have successfully passed the test!'
                : 'Unfortunately, you did not pass the test. Please try again!'}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {result.score !== undefined ? `${result.score}%` : 'N/A'}
                </p>
                <p className="text-sm text-gray-600">Total Score</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {result.correctAnswers !== undefined && result.totalQuestions !== undefined
                    ? `${result.correctAnswers}/${result.totalQuestions}`
                    : 'N/A'}
                </p>
                <p className="text-sm text-gray-600">Correct Answers</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => router.push('/')} variant="outline" className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <Button onClick={() => router.push('/dashboard')} className="flex-1">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!test || !questions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Test Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
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

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{test.title}</h1>
                <p className="text-gray-600">
                  Question {currentQuestionIndex + 1} of {questions.length}
                  <span className="text-gray-400 ml-2">({answeredCount} answered)</span>
                </p>
              </div>
              <div className="flex items-center gap-4">
                {!isAuthenticated && (
                  <span className="text-sm text-gray-500">Guest mode</span>
                )}
                {timeLeft !== null && (
                  <div
                    className={`flex items-center text-lg font-semibold ${
                      timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-blue-600'
                    }`}
                  >
                    <Clock className="mr-2 h-5 w-5" />
                    {formatTime(timeLeft)}
                  </div>
                )}
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline">{test.category}</Badge>
                <Badge variant="outline">{test.difficulty}</Badge>
              </div>
              <div className="text-xl leading-relaxed">
                {typeof currentQuestion.question === 'string' ? (
                  <CardTitle>{currentQuestion.question}</CardTitle>
                ) : (
                  <RichText data={currentQuestion.question} enableGutter={false} />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedOptions.includes(index)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleOptionChange(index)}
                >
                  <Checkbox
                    checked={selectedOptions.includes(index)}
                    onChange={() => handleOptionChange(index)}
                    className="mt-1"
                  />
                  <div className="flex-1 text-gray-700">
                    {typeof option.text === 'string' ? (
                      <span>{option.text}</span>
                    ) : (
                      <RichText data={option.text} enableGutter={false} enableProse={false} />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Question Navigation Dots */}
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentQuestionIndex(index)
                  const savedAnswer = answers[index]
                  setSelectedOptions(savedAnswer?.selectedOptions || [])
                }}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : answers[index]?.selectedOptions?.length > 0
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <Button
              onClick={handleNextQuestion}
              disabled={selectedOptions.length === 0 || submitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {currentQuestionIndex === questions.length - 1 ? (
                <>
                  {submitting ? 'Submitting...' : 'Finish Test'}
                  <CheckCircle className="ml-2 h-4 w-4" />
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
      </div>
    </>
  )
}
