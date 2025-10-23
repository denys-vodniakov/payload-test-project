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
    'blue-purple': 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600',
    'green-blue': 'bg-gradient-to-r from-green-600 via-blue-600 to-purple-600',
    'purple-pink': 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600',
    'orange-red': 'bg-gradient-to-r from-orange-600 via-red-600 to-pink-600',
  }

  const animationClass = animate ? 'animate-gradient' : ''

  return (
    <span
      className={cn(
        'bg-gradient-to-r bg-clip-text text-transparent',
        gradientClasses[gradient],
        animationClass,
        className,
      )}
    >
      {children}
    </span>
  )
}
