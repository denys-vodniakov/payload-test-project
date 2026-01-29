'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Trophy,
  BookOpen,
  Clock,
  RefreshCw,
  BarChart3,
  Calendar,
  Target,
  Award,
  Sparkles,
  Zap,
  ChevronDown,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import dynamic from 'next/dynamic'
import GlassCard from '@/components/GlassCard'
import GradientText from '@/components/GradientText'
import RichText from '@/components/RichText'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { Stats, TestResult, DashboardUser } from './types'

const AnimatedBackground = dynamic(
  () => import('@/components/AnimatedBackground'),
  { ssr: false },
)

interface DashboardClientProps {
  initialStats: Stats
  initialUser: DashboardUser
}

export function DashboardClient({ initialStats, initialUser }: DashboardClientProps) {
  const { user: authUser } = useAuth()
  const user = initialUser ?? authUser
  const stats = initialStats
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set())

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30'
      case 'hard':
        return 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30'
      default:
        return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Easy'
      case 'medium':
        return 'Medium'
      case 'hard':
        return 'Hard'
      default:
        return 'Mixed'
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
        return 'General'
      default:
        return 'Mixed'
    }
  }

  const passRate = stats.totalTests > 0 ? Math.round((stats.passedTests / stats.totalTests) * 100) : 0

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 relative transition-colors duration-300">
        <AnimatedBackground />

        <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 relative">
              {user?.avatar && typeof user.avatar === 'object' && 'url' in user.avatar ? (
                <Image
                  src={(user.avatar as { url?: string }).url!}
                  alt={user?.name || 'Avatar'}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div>
              <GradientText className="text-4xl font-bold mb-2">My Dashboard</GradientText>
              <p className="text-xl text-muted-foreground">
                Welcome back, <span className="font-semibold text-primary">{user?.name}</span>! 👋
              </p>
            </div>
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
                  {stats.categoryStats.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No category statistics yet</p>
                      <p className="text-sm mt-2">Complete tests to see statistics by category</p>
                    </div>
                  ) : (
                    stats.categoryStats.map((category, index) => (
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
                    ))
                  )}
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
                {stats.recentResults.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No test results yet</p>
                    <p className="text-sm mt-2">Start taking tests to see your results here</p>
                    <Button asChild className="mt-4">
                      <Link href="/">Take Your First Test</Link>
                    </Button>
                  </div>
                ) : (
                  stats.recentResults.map((result) => {
                    const isExpanded = expandedResults.has(result.id)
                    return (
                      <Collapsible
                        key={result.id}
                        open={isExpanded}
                        onOpenChange={(open) => {
                          const newSet = new Set(expandedResults)
                          if (open) newSet.add(result.id)
                          else newSet.delete(result.id)
                          setExpandedResults(newSet)
                        }}
                      >
                        <div className="border border-border rounded-lg overflow-hidden bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-all duration-200 cursor-pointer">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h4 className="font-medium text-foreground">{result.test.title}</h4>
                                  <Badge className={getDifficultyColor(result.test.difficulty)}>
                                    {getDifficultyLabel(result.test.difficulty)}
                                  </Badge>
                                  <Badge variant="outline" className="border-border">
                                    {getCategoryLabel(result.test.category)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {result.correctAnswers}/{result.totalQuestions} correct •{' '}
                                  {formatTime(result.timeSpent)} • {formatDate(result.completedAt)}
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div
                                    className={`text-2xl font-bold transition-colors ${
                                      result.isPassed
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                    }`}
                                  >
                                    {result.score}%
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {result.isPassed ? (
                                      <Trophy className="h-4 w-4 text-green-600 dark:text-green-400 animate-pulse" />
                                    ) : (
                                      <RefreshCw className="h-4 w-4 text-red-600 dark:text-red-400" />
                                    )}
                                    <span className="text-sm text-muted-foreground">
                                      {result.isPassed ? 'Passed' : 'Failed'}
                                    </span>
                                  </div>
                                </div>
                                <div
                                  className="transition-transform duration-200"
                                  style={{
                                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                  }}
                                >
                                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                </div>
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                            <div className="p-4 pt-0 border-t border-border bg-muted/30">
                              {result.answers && result.answers.length > 0 ? (
                                <div className="space-y-4">
                                  <h5 className="font-semibold text-sm mb-3">Answers & Feedback:</h5>
                                  {result.answers.map((answer, idx) => (
                                    <div
                                      key={idx}
                                      className={`p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-md ${
                                        answer.isCorrect
                                          ? 'border-green-500/30 bg-green-500/10 dark:bg-green-500/20'
                                          : 'border-red-500/30 bg-red-500/10 dark:bg-red-500/20'
                                      }`}
                                      style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                      <div className="flex items-start gap-3 mb-3">
                                        <div
                                          className={`mt-0.5 flex-shrink-0 ${
                                            answer.isCorrect
                                              ? 'text-green-600 dark:text-green-400'
                                              : 'text-red-600 dark:text-red-400'
                                          }`}
                                        >
                                          {answer.isCorrect ? (
                                            <CheckCircle2 className="h-5 w-5 animate-in fade-in zoom-in duration-300" />
                                          ) : (
                                            <XCircle className="h-5 w-5 animate-in fade-in zoom-in duration-300" />
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <div className="font-medium text-sm mb-2 text-foreground">
                                            Question {idx + 1}
                                            {answer.question?.questionTitle && (
                                              <span className="text-muted-foreground ml-2">
                                                - {answer.question.questionTitle}
                                              </span>
                                            )}
                                          </div>
                                          {answer.feedback && answer.feedback.length > 0 && (
                                            <div className="mt-3 space-y-3">
                                              {answer.feedback.map((fb, fbIdx) => (
                                                <div
                                                  key={fbIdx}
                                                  className={`p-3 rounded-lg border transition-all duration-200 animate-in slide-in-from-left fade-in ${
                                                    fb.feedbackType === 'correct'
                                                      ? 'bg-green-500/20 dark:bg-green-500/30 border-green-500/30'
                                                      : 'bg-red-500/20 dark:bg-red-500/30 border-red-500/30'
                                                  }`}
                                                  style={{
                                                    animationDelay: `${idx * 50 + fbIdx * 100}ms`,
                                                  }}
                                                >
                                                  <div
                                                    className={`text-xs font-semibold mb-2 flex items-center gap-2 ${
                                                      fb.feedbackType === 'correct'
                                                        ? 'text-green-700 dark:text-green-300'
                                                        : 'text-red-700 dark:text-red-300'
                                                    }`}
                                                  >
                                                    <span className="text-base">
                                                      {fb.feedbackType === 'correct' ? '✓' : '✗'}
                                                    </span>
                                                    {fb.feedbackType === 'correct'
                                                      ? 'Correct Answer Feedback'
                                                      : 'Incorrect Answer Feedback'}
                                                  </div>
                                                  <div className="text-sm text-foreground">
                                                    <RichText data={fb.content} enableGutter={false} />
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                          {answer.explanation && (
                                            <div className="mt-3 p-3 bg-blue-500/20 dark:bg-blue-500/30 border border-blue-500/30 rounded-lg text-sm animate-in slide-in-from-left fade-in">
                                              <div className="font-semibold mb-1 text-blue-700 dark:text-blue-300">
                                                Explanation:
                                              </div>
                                              <p className="text-foreground">{answer.explanation}</p>
                                            </div>
                                          )}
                                          {!answer.feedback && !answer.explanation && (
                                            <div className="text-sm text-muted-foreground mt-2 italic">
                                              No feedback available for this answer
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  No answer details available
                                </p>
                              )}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
