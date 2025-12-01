'use client'

import { ReactNode } from 'react'
import { cn } from '@/utilities/ui'

interface GradientTextProps {
  children: ReactNode
  className?: string
  gradient?: 'blue-purple' | 'green-blue' | 'purple-pink' | 'orange-red'
  animate?: boolean
}

export default function GradientText({
  children,
  className,
  gradient = 'blue-purple',
  animate = true,
}: GradientTextProps) {
  const gradientClasses = {
    'blue-purple':
      'bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-indigo-500 dark:from-blue-400 dark:via-purple-400 dark:via-pink-400 dark:to-indigo-400',
    'green-blue':
      'bg-gradient-to-r from-green-500 via-cyan-500 via-blue-500 to-purple-500 dark:from-green-400 dark:via-cyan-400 dark:via-blue-400 dark:to-purple-400',
    'purple-pink':
      'bg-gradient-to-r from-purple-500 via-pink-500 via-red-500 to-orange-500 dark:from-purple-400 dark:via-pink-400 dark:via-red-400 dark:to-orange-400',
    'orange-red':
      'bg-gradient-to-r from-orange-500 via-red-500 via-pink-500 to-purple-500 dark:from-orange-400 dark:via-red-400 dark:via-pink-400 dark:to-purple-400',
  }

  const animationClass = animate ? 'animate-gradient' : ''

  return (
    <span
      className={cn(
        'bg-gradient-to-r bg-clip-text text-transparent bg-[length:200%_auto]',
        gradientClasses[gradient],
        animationClass,
        className,
      )}
      style={
        animate
          ? {
              backgroundSize: '200% auto',
            }
          : undefined
      }
    >
      {children}
    </span>
  )
}
