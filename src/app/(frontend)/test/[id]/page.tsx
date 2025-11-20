'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'

interface Question {
  id: string
  question: string
  options: Array<{
    text: string
    isCorrect: boolean
  }>
  explanation?: string
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

interface Answer {
  questionId: string
  selectedOptions: number[]
  timeSpent: number
}

export default function TestPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const testId = params.id as string

  const [test, setTest] = useState<Test | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [selectedOptions, setSelectedOptions] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState<any>(null)

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

      // Set time limit if available (convert minutes to seconds)
      if (data.test?.timeLimit) {
        setTimeLeft(data.test.timeLimit * 60)
      }

      // Initialize answers array
      if (data.questions && data.questions.length > 0) {
        setAnswers(
          data.questions.map((q: Question) => ({
            questionId: q.id,
            selectedOptions: [],
            timeSpent: 0,
          })),
        )
      }
    } catch (error) {
      console.error('Error fetching test:', error)
    } finally {
      setLoading(false)
    }
  }, [testId])

  const handleOptionChange = (optionIndex: number) => {
    setSelectedOptions((prev) => {
      if (prev.includes(optionIndex)) {
        return prev.filter((index) => index !== optionIndex)
      } else {
        return [...prev, optionIndex]
      }
    })
  }

  const handleNextQuestion = () => {
    // Save current answer
    const currentAnswer = answers[currentQuestionIndex]
    const updatedAnswers = [...answers]
    updatedAnswers[currentQuestionIndex] = {
      ...currentAnswer,
      selectedOptions: [...selectedOptions],
      timeSpent: currentAnswer.timeSpent + 1, // Simple time tracking
    }
    setAnswers(updatedAnswers)

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedOptions(answers[currentQuestionIndex + 1]?.selectedOptions || [])
    } else {
      handleSubmitTest()
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
      setSelectedOptions(answers[currentQuestionIndex - 1]?.selectedOptions || [])
    }
  }

  const handleSubmitTest = useCallback(async () => {
    setSubmitting(true)
    try {
      const response = await fetch('/api/test-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testId,
          answers: answers.map((answer, index) => ({
            questionId: answer.questionId,
            selectedOptions: answer.selectedOptions,
            timeSpent: answer.timeSpent,
          })),
          timeSpent: test?.timeLimit ? test.timeLimit * 60 - (timeLeft || 0) : 0,
          userId: user?.id || 'unknown',
        }),
      })

      const result = await response.json()
      setResult(result)
      setShowResult(true)
    } catch (error) {
      console.error('Error submitting test:', error)
    } finally {
      setSubmitting(false)
    }
  }, [answers, test?.timeLimit, timeLeft, testId])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (testId) {
      fetchTest()
    }
  }, [testId, fetchTest])

  useEffect(() => {
    if (test?.timeLimit && timeLeft !== null) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 0) {
            handleSubmitTest()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [test?.timeLimit, timeLeft, handleSubmitTest])

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

  if (showResult && result) {
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
                <p className="text-2xl font-bold text-blue-600">{result.score}%</p>
                <p className="text-sm text-gray-600">Total Score</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {result.correctAnswers}/{result.totalQuestions}
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{test.title}</h1>
                <p className="text-gray-600">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
              {timeLeft !== null && (
                <div className="flex items-center text-lg font-semibold text-blue-600">
                  <Clock className="mr-2 h-5 w-5" />
                  {formatTime(timeLeft)}
                </div>
              )}
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
              <CardTitle className="text-xl leading-relaxed">{currentQuestion.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedOptions.includes(index)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleOptionChange(index)}
                >
                  <Checkbox
                    checked={selectedOptions.includes(index)}
                    onChange={() => handleOptionChange(index)}
                  />
                  <span className="flex-1 text-gray-700">{option.text}</span>
                </div>
              ))}
            </CardContent>
          </Card>

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
              disabled={selectedOptions.length === 0}
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
    </ProtectedRoute>
  )
}
