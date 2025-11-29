'use client'

import React, { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useTheme } from '..'
import { Moon, Sun } from 'lucide-react'

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="text-muted-foreground hover:text-foreground bg-background/80 backdrop-blur-sm border border-border/50"
      suppressHydrationWarning
      aria-label="Toggle theme"
    >
      {!mounted || theme !== 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  )
}
