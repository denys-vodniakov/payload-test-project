'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { useTheme } from '@/providers/Theme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const { theme: globalTheme } = useTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Track changes to global theme via data-theme attribute
  useEffect(() => {
    const checkTheme = () => {
      const dataTheme = document.documentElement.getAttribute('data-theme')
      if (dataTheme && dataTheme !== theme) {
        setTheme(dataTheme)
      }
    }

    checkTheme()

    // Listen for changes in theme
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    return () => {
      observer.disconnect()
    }
  }, [theme])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) {
      setTheme(headerTheme)
    } else if (!headerTheme && globalTheme && globalTheme !== theme) {
      // Use global theme if headerTheme is not set
      setTheme(globalTheme)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme, globalTheme])

  // Get logo theme - use headerTheme if set, otherwise use globalTheme or current theme
  const logoTheme: 'dark' | 'light' | null =
    headerTheme || globalTheme || (theme === 'dark' || theme === 'light' ? theme : null) || null

  // Get logo data
  const logoData = data.logo || null

  return (
    <header className="container relative z-20   " {...(theme ? { 'data-theme': theme } : {})}>
      <div className="py-8 flex justify-between">
        <Link href="/">
          <Logo
            loading="eager"
            priority="high"
            className="max-w-[9.375rem] w-full"
            logo={logoData}
            theme={logoTheme}
          />
        </Link>
        <HeaderNav data={data} />
      </div>
    </header>
  )
}
