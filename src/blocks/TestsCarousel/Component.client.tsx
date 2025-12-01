'use client'

import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ArrowLeft, ArrowRight, BookOpen, Clock, Zap, Trophy } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import GradientText from '@/components/GradientText'
import type { Test } from '@/payload-types'

interface TestsCarouselClientProps {
  tests: Test[]
  title: string
  subtitle: string
  slidesToShow: number
  autoplay: boolean
  autoplaySpeed: number
}

export const TestsCarouselClient: React.FC<TestsCarouselClientProps> = ({
  tests,
  title,
  subtitle,
  slidesToShow,
  autoplay,
  autoplaySpeed,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: 'start',
      slidesToScroll: 1,
      breakpoints: {
        '(min-width: 1024px)': {
          slidesToScroll: Math.min(2, slidesToShow),
        },
      },
    },
    autoplay ? [Autoplay({ delay: autoplaySpeed, stopOnInteraction: false })] : [],
  )

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true)
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setPrevBtnDisabled(!emblaApi.canScrollPrev())
    setNextBtnDisabled(!emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30'
      case 'hard':
        return 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30'
      default:
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30'
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
        return 'Общие вопросы'
      default:
        return 'Смешанный'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'react':
      case 'nextjs':
      case 'javascript':
      case 'typescript':
        return <Zap className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  if (!tests || tests.length === 0) {
    return (
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            <GradientText gradient="blue-purple" animate={true}>
              {title}
            </GradientText>
          </h2>
          <p className="text-xl text-muted-foreground dark:text-muted-foreground/90 mb-8 transition-colors duration-300 font-medium">
            {subtitle}
          </p>
          <p className="text-muted-foreground">Нет доступных тестов</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <GradientText gradient="blue-purple" animate={true}>
              {title}
            </GradientText>
          </h2>
          <p className="text-xl text-muted-foreground dark:text-muted-foreground/90 max-w-2xl mx-auto leading-relaxed transition-colors duration-300 font-medium">
            {subtitle}
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Carousel Viewport */}
          <div ref={emblaRef}>
            <div className="flex gap-6">
              {tests.map((test, index) => {
                const questionsCount = Array.isArray(test.questions) ? test.questions.length : 0
                const testId = typeof test.id === 'number' ? test.id : parseInt(String(test.id))

                return (
                  <div
                    key={test.id}
                    className="flex-[0_0_100%] md:flex-[0_0_calc(50%-12px)] min-w-0 lg:flex-[0_0_calc((100%-48px)/var(--slides-to-show))]"
                    style={
                      {
                        '--slides-to-show': Math.min(slidesToShow, 5),
                      } as React.CSSProperties
                    }
                  >
                    <Card
                      className="group h-full bg-card/80 backdrop-blur-sm border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/10 group-hover:to-primary/5 transition-all duration-500 pointer-events-none" />

                      {/* Shine effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

                      <CardHeader className="relative z-10">
                        <div className="flex items-start justify-between mb-3 gap-2">
                          <Badge
                            className={`${getDifficultyColor(test.difficulty)} border font-semibold`}
                          >
                            {getDifficultyLabel(test.difficulty)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1.5 border-primary/30"
                          >
                            {getCategoryIcon(test.category)}
                            {getCategoryLabel(test.category)}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl md:text-2xl group-hover:text-primary transition-colors duration-300 line-clamp-2">
                          {test.title}
                        </CardTitle>
                        {test.description && (
                          <CardDescription className="text-muted-foreground line-clamp-2 mt-2">
                            {test.description}
                          </CardDescription>
                        )}
                      </CardHeader>

                      <CardContent className="relative z-10">
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4" />
                            <span className="font-medium">{questionsCount} вопросов</span>
                          </span>
                          {test.timeLimit && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              <span className="font-medium">{test.timeLimit} мин</span>
                            </span>
                          )}
                        </div>

                        <Button
                          asChild
                          className="w-full group/btn bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                          <Link href={`/test/${testId}`}>
                            <span className="flex items-center justify-center gap-2">
                              Начать тест
                              <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                            </span>
                          </Link>
                        </Button>
                      </CardContent>

                      {/* Decorative corner element */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Card>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Carousel Controls - Bottom */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left: Stats text */}
            <div className="flex items-center gap-2 text-muted-foreground order-1 sm:order-none">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">{tests.length} тестов доступно</span>
            </div>

            {/* Center: Navigation buttons */}
            <div className="flex items-center gap-2 order-2 sm:order-none">
              <Button
                variant="outline"
                size="icon"
                onClick={scrollPrev}
                disabled={prevBtnDisabled}
                className="rounded-full h-10 w-10 bg-background/80 backdrop-blur-sm border-2 shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous slide"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollNext}
                disabled={nextBtnDisabled}
                className="rounded-full h-10 w-10 bg-background/80 backdrop-blur-sm border-2 shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next slide"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Right: Dots indicator */}
            {tests.length > slidesToShow && (
              <div className="flex items-center gap-2 order-3 sm:order-none">
                {Array.from({ length: Math.ceil(tests.length / slidesToShow) }).map((_, index) => {
                  const slideIndex = index * slidesToShow
                  return (
                    <button
                      key={index}
                      onClick={() => emblaApi?.scrollTo(slideIndex)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        Math.floor(selectedIndex / slidesToShow) === index
                          ? 'w-8 bg-primary'
                          : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
