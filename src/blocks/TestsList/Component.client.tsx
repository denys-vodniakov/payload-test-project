'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Clock,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Loader2,
  SlidersHorizontal,
  X,
  Grid3X3,
  List,
  Trophy,
  ChevronDown,
} from 'lucide-react'
import { useTheme } from '@/providers/Theme'
import { cn } from '@/utilities/ui'

interface Test {
  id: string
  title: string
  description?: string
  category: string
  difficulty: string
  timeLimit?: number
  questionsCount: number
  passingScore?: number
  createdAt: string
}

interface TestsListClientProps {
  title?: string
  subtitle?: string
  showSearch: boolean
  showCategoryFilter: boolean
  showDifficultyFilter: boolean
  showSortOptions: boolean
  showViewToggle: boolean
  collapsibleFilters: boolean
  defaultCategory: string
  defaultDifficulty: string
  defaultSort: string
  defaultView: 'grid' | 'list'
  loadMode: 'pagination' | 'infinite' | 'loadMore'
  allowLoadModeSwitch: boolean
  itemsPerPage: number
  showBackground: boolean
  cardsPerRow: string
  cardStyle: 'default' | 'compact' | 'detailed'
  initialTests: Test[]
  initialTotalPages: number
  initialTotalDocs: number
  initialHasNextPage: boolean
}

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'react', label: 'React' },
  { value: 'nextjs', label: 'Next.js' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'css-html', label: 'CSS/HTML' },
  { value: 'general', label: 'General' },
  { value: 'mixed', label: 'Mixed' },
]

const DIFFICULTIES = [
  { value: 'all', label: 'All Levels' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'mixed', label: 'Mixed' },
]

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest' },
  { value: 'createdAt', label: 'Oldest' },
  { value: 'title', label: 'A-Z' },
  { value: '-title', label: 'Z-A' },
]

export const TestsListClient: React.FC<TestsListClientProps> = ({
  title,
  subtitle,
  showSearch,
  showCategoryFilter,
  showDifficultyFilter,
  showSortOptions,
  showViewToggle,
  collapsibleFilters,
  defaultCategory,
  defaultDifficulty,
  defaultSort,
  defaultView,
  loadMode: initialLoadMode,
  allowLoadModeSwitch,
  itemsPerPage,
  showBackground,
  cardsPerRow,
  cardStyle,
  initialTests,
  initialTotalPages,
  initialTotalDocs,
  initialHasNextPage,
}) => {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // State
  const [tests, setTests] = useState<Test[]>(initialTests)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [totalDocs, setTotalDocs] = useState(initialTotalDocs)
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage)
  
  // Filters
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(defaultCategory)
  const [difficulty, setDifficulty] = useState(defaultDifficulty)
  const [sort, setSort] = useState(defaultSort)
  const [page, setPage] = useState(1)
  
  // UI state
  const [showFilters, setShowFilters] = useState(!collapsibleFilters)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultView)
  const [loadMode, setLoadMode] = useState(initialLoadMode)
  
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const prevSearchRef = useRef(search)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && theme === 'dark'

  const fetchTests = useCallback(async (pageNum: number, append = false, searchOverride?: string) => {
    if (append) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }

    try {
      const searchValue = searchOverride !== undefined ? searchOverride : search
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: itemsPerPage.toString(),
        sort,
        ...(category !== 'all' && { category }),
        ...(difficulty !== 'all' && { difficulty }),
        ...(searchValue && { search: searchValue }),
      })

      const response = await fetch(`/api/tests/list?${params}`)
      const data = await response.json()

      if (append) {
        setTests(prev => [...prev, ...data.docs])
      } else {
        setTests(data.docs)
      }
      
      setTotalPages(data.totalPages)
      setTotalDocs(data.totalDocs)
      setHasNextPage(data.hasNextPage)
      setPage(pageNum)
    } catch (error) {
      console.error('Error fetching tests:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [category, difficulty, search, sort, itemsPerPage])

  // Debounced search - triggers after 2+ characters with 300ms delay
  useEffect(() => {
    // Skip on first render
    if (prevSearchRef.current === search) return
    prevSearchRef.current = search

    // Clear any pending timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // If search is cleared, immediately show all tests
    if (search === '') {
      if (loadMode === 'infinite') setTests([])
      fetchTests(1, false, '')
      return
    }

    // If 2+ characters, search after delay
    if (search.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        if (loadMode === 'infinite') setTests([])
        fetchTests(1)
      }, 300)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [search, loadMode, fetchTests])

  // Fetch when filters change (skip initial since we have server data)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    fetchTests(1)
  }, [category, difficulty, sort])

  // Infinite scroll observer
  useEffect(() => {
    if (loadMode !== 'infinite' || !hasNextPage) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !loadingMore && !loading) {
          fetchTests(page + 1, true)
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      observerRef.current?.disconnect()
    }
  }, [loadMode, hasNextPage, page, loadingMore, loading, fetchTests])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Manual search submission - search even with 1 character
    if (search.length > 0) {
      if (loadMode === 'infinite') setTests([])
      fetchTests(1)
    }
  }

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'hard': return 'bg-red-500/10 text-red-500 border-red-500/20'
      default: return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    }
  }

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'react': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
      case 'nextjs': return 'bg-white/10 text-gray-900 dark:text-white border-gray-500/20'
      case 'javascript': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
      case 'typescript': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const gridCols = {
    '2': 'md:grid-cols-2',
    '3': 'md:grid-cols-2 lg:grid-cols-3',
    '4': 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[cardsPerRow] || 'md:grid-cols-2 lg:grid-cols-3'

  return (
    <div className={cn("relative pt-6 pb-16", showBackground && "overflow-hidden")}>
      {/* Background */}
      {showBackground && (
        <div className={cn(
          'absolute inset-0 -z-10 transition-colors duration-500',
          isDark
            ? 'bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950'
            : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100',
        )}>
          <div className={cn(
            'absolute top-0 -left-40 w-[600px] h-[600px] rounded-full blur-[120px] animate-aurora-1',
            isDark ? 'bg-blue-600/20' : 'bg-blue-400/30',
          )} />
          <div className={cn(
            'absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] animate-aurora-2',
            isDark ? 'bg-purple-600/15' : 'bg-purple-400/25',
          )} />
        </div>
      )}

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            {title && (
              <h2 className={cn(
                "text-3xl md:text-4xl font-bold mb-4",
                isDark ? "text-white" : "text-gray-900"
              )}>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {title}
                </span>
              </h2>
            )}
            {subtitle && (
              <p className={cn(
                "text-lg max-w-2xl mx-auto",
                isDark ? "text-gray-400" : "text-gray-600"
              )}>
                {subtitle}
              </p>
            )}
            {totalDocs > 0 && (
              <p className={cn("mt-2 text-sm", isDark ? "text-gray-500" : "text-gray-500")}>
                {totalDocs} test{totalDocs !== 1 ? 's' : ''} available
              </p>
            )}
          </motion.div>
        )}

        {/* Filters Panel */}
        {(showSearch || showCategoryFilter || showDifficultyFilter || showSortOptions || showViewToggle) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cn(
              "rounded-2xl p-4 md:p-6 mb-8 backdrop-blur-sm",
              isDark ? "bg-gray-900/50 border border-gray-800" : "bg-white/70 border border-gray-200"
            )}
          >
            {/* Main Controls Row */}
            <div className="flex flex-wrap gap-3 items-stretch">
              {/* Search */}
              {showSearch && (
                <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px] items-stretch">
                  <div className="relative flex-1">
                    <Search className={cn(
                      "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                      isDark ? "text-gray-500" : "text-gray-400"
                    )} />
                    <Input
                      type="text"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className={cn(
                        "pl-9 h-10",
                        isDark && "bg-gray-800/50 border-gray-700"
                      )}
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="h-10 w-10 flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </form>
              )}

              {/* Quick Filters Toggle */}
              {collapsibleFilters && (showCategoryFilter || showDifficultyFilter) && (
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "h-10 px-4 flex items-center gap-2 rounded-lg border text-sm font-medium transition-colors",
                    isDark
                      ? "bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
                      : "bg-transparent border-gray-200 text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {(category !== 'all' || difficulty !== 'all') && (
                    <Badge className="bg-blue-500 text-xs text-white">
                      {[category !== 'all', difficulty !== 'all'].filter(Boolean).length}
                    </Badge>
                  )}
                  <ChevronDown className={cn("h-4 w-4 transition-transform", showFilters && "rotate-180")} />
                </button>
              )}

              {/* Sort */}
              {showSortOptions && (
                <div className="relative h-10">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className={cn(
                      "h-full px-3 pr-9 rounded-lg text-sm border appearance-none cursor-pointer",
                      isDark
                        ? "bg-gray-800 text-gray-300 border-gray-700"
                        : "bg-white text-gray-700 border-gray-200"
                    )}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none",
                    isDark ? "text-gray-500" : "text-gray-400"
                  )} />
                </div>
              )}

              {/* View Toggle */}
              {showViewToggle && (
                <div className={cn(
                  "flex h-10 rounded-lg overflow-hidden border",
                  isDark ? "border-gray-700" : "border-gray-200"
                )}>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "w-10 h-full flex items-center justify-center transition-colors",
                      viewMode === 'grid'
                        ? "bg-blue-500 text-white"
                        : isDark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-600"
                    )}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "w-10 h-full flex items-center justify-center transition-colors",
                      viewMode === 'list'
                        ? "bg-blue-500 text-white"
                        : isDark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-600"
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Load Mode Toggle */}
              {allowLoadModeSwitch && (
                <div className="relative h-10">
                  <select
                    value={loadMode}
                    onChange={(e) => setLoadMode(e.target.value as any)}
                    className={cn(
                      "h-full px-3 pr-9 rounded-lg text-sm border appearance-none cursor-pointer",
                      isDark
                        ? "bg-gray-800 text-gray-300 border-gray-700"
                        : "bg-white text-gray-700 border-gray-200"
                    )}
                  >
                    <option value="pagination">Pages</option>
                    <option value="infinite">Infinite</option>
                    <option value="loadMore">Load More</option>
                  </select>
                  <ChevronDown className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none",
                    isDark ? "text-gray-500" : "text-gray-400"
                  )} />
                </div>
              )}
            </div>

            {/* Expanded Filters */}
            <AnimatePresence>
              {showFilters && (showCategoryFilter || showDifficultyFilter) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className={cn(
                    "pt-4 mt-4 border-t flex flex-wrap gap-6",
                    isDark ? "border-gray-700" : "border-gray-200"
                  )}>
                    {/* Category */}
                    {showCategoryFilter && (
                      <div>
                        <label className={cn(
                          "block text-xs font-medium mb-2 uppercase tracking-wider",
                          isDark ? "text-gray-400" : "text-gray-500"
                        )}>
                          Category
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {CATEGORIES.map((cat) => (
                            <button
                              key={cat.value}
                              onClick={() => setCategory(cat.value)}
                              className={cn(
                                "px-3 py-1 rounded-full text-xs font-medium transition-all",
                                category === cat.value
                                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                  : isDark
                                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              )}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Difficulty */}
                    {showDifficultyFilter && (
                      <div>
                        <label className={cn(
                          "block text-xs font-medium mb-2 uppercase tracking-wider",
                          isDark ? "text-gray-400" : "text-gray-500"
                        )}>
                          Difficulty
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {DIFFICULTIES.map((diff) => (
                            <button
                              key={diff.value}
                              onClick={() => setDifficulty(diff.value)}
                              className={cn(
                                "px-3 py-1 rounded-full text-xs font-medium transition-all",
                                difficulty === diff.value
                                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                  : isDark
                                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              )}
                            >
                              {diff.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Clear Filters */}
                  {(category !== 'all' || difficulty !== 'all' || search) && (
                    <div className="mt-3">
                      <button
                        onClick={() => {
                          setCategory('all')
                          setDifficulty('all')
                          setSearch('')
                        }}
                        className="text-xs text-blue-500 hover:text-blue-400"
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Tests Grid/List */}
        {loading && tests.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className={cn("h-10 w-10 animate-spin", isDark ? "text-blue-500" : "text-blue-600")} />
          </div>
        ) : tests.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <BookOpen className={cn("h-16 w-16 mx-auto mb-4", isDark ? "text-gray-600" : "text-gray-400")} />
            <h3 className={cn("text-xl font-semibold mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
              No tests found
            </h3>
            <p className={cn("text-sm", isDark ? "text-gray-500" : "text-gray-500")}>
              Try adjusting your filters
            </p>
          </motion.div>
        ) : (
          <>
            <div className={cn(
              viewMode === 'grid'
                ? `grid grid-cols-1 ${gridCols} gap-6`
                : "space-y-4"
            )}>
              {tests.map((test, index) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.3) }}
                >
                  <Link href={`/test/${test.id}`}>
                    <Card className={cn(
                      "h-full transition-all duration-300 cursor-pointer group overflow-hidden",
                      "hover:shadow-xl hover:scale-[1.02]",
                      isDark
                        ? "bg-gray-900/70 border-gray-800 hover:border-blue-500/50"
                        : "bg-white/80 border-gray-200 hover:border-blue-500/50",
                      viewMode === 'list' && "flex flex-row",
                      cardStyle === 'compact' && "py-2"
                    )}>
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <CardHeader className={cn(
                        viewMode === 'list' && "flex-1",
                        cardStyle === 'compact' && "py-3"
                      )}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex flex-wrap gap-1.5">
                            <Badge className={cn("text-xs", getCategoryColor(test.category))}>
                              {test.category}
                            </Badge>
                            <Badge className={cn("text-xs", getDifficultyColor(test.difficulty))}>
                              {test.difficulty}
                            </Badge>
                          </div>
                          {test.passingScore && cardStyle !== 'compact' && (
                            <div className={cn("flex items-center text-xs", isDark ? "text-gray-500" : "text-gray-400")}>
                              <Trophy className="h-3 w-3 mr-1" />
                              {test.passingScore}%
                            </div>
                          )}
                        </div>
                        <CardTitle className={cn(
                          "line-clamp-2 group-hover:text-blue-500 transition-colors",
                          cardStyle === 'compact' ? "text-base" : "text-lg",
                          isDark ? "text-white" : "text-gray-900"
                        )}>
                          {test.title}
                        </CardTitle>
                        {test.description && cardStyle !== 'compact' && (
                          <CardDescription className={cn(
                            "line-clamp-2 mt-2",
                            isDark ? "text-gray-400" : "text-gray-600"
                          )}>
                            {test.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      
                      <CardContent className={cn(
                        "pt-0",
                        viewMode === 'list' && "flex items-center",
                        cardStyle === 'compact' && "pb-3"
                      )}>
                        <div className={cn(
                          "flex items-center gap-4 text-sm",
                          isDark ? "text-gray-400" : "text-gray-500"
                        )}>
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-1" />
                            {test.questionsCount}
                          </div>
                          {test.timeLimit && test.timeLimit > 0 && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {test.timeLimit}m
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {loadMode === 'pagination' && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => fetchTests(page - 1)}
                  disabled={page <= 1 || loading}
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center transition-all border",
                    page <= 1 || loading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-200 dark:hover:bg-gray-700",
                    isDark
                      ? "bg-gray-800 text-gray-300 border-gray-700"
                      : "bg-gray-100 text-gray-700 border-gray-200"
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) pageNum = i + 1
                    else if (page <= 3) pageNum = i + 1
                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i
                    else pageNum = page - 2 + i
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => fetchTests(pageNum)}
                        disabled={loading}
                        className={cn(
                          "w-9 h-9 rounded-lg text-sm font-medium transition-all",
                          page === pageNum
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            : isDark
                              ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                
                <button
                  onClick={() => fetchTests(page + 1)}
                  disabled={page >= totalPages || loading}
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center transition-all border",
                    page >= totalPages || loading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-200 dark:hover:bg-gray-700",
                    isDark
                      ? "bg-gray-800 text-gray-300 border-gray-700"
                      : "bg-gray-100 text-gray-700 border-gray-200"
                  )}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Load More Button */}
            {loadMode === 'loadMore' && hasNextPage && (
              <div className="flex justify-center mt-12">
                <Button
                  onClick={() => fetchTests(page + 1, true)}
                  disabled={loadingMore}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {loadingMore ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Load More
                </Button>
              </div>
            )}

            {/* Infinite Scroll Trigger */}
            {loadMode === 'infinite' && (
              <div ref={loadMoreRef} className="py-8 flex justify-center">
                {loadingMore && <Loader2 className={cn("h-8 w-8 animate-spin", isDark ? "text-blue-500" : "text-blue-600")} />}
                {!hasNextPage && tests.length > 0 && (
                  <p className={cn("text-sm", isDark ? "text-gray-500" : "text-gray-400")}>
                    You&apos;ve reached the end
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
