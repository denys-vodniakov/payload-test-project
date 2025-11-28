'use client'

import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import type { Media } from '@/payload-types'

interface LogoData {
  light?: number | Media | null
  dark?: number | Media | null
  mobile?: number | Media | null
}

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
  logo?: LogoData | null
  theme?: 'light' | 'dark' | null
}

/**
 * Get URL of media file - uses relative path to avoid hydration issues
 */
const getLogoUrl = (logo: number | Media | null | undefined): string => {
  if (!logo) return ''

  if (typeof logo === 'number') {
    // If this is an ID, return empty string (in production we need to load media)
    return ''
  }

  const url = logo.url || null
  if (!url) return ''

  // If URL already has protocol, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  // Use relative path to avoid hydration mismatches
  // The browser will resolve it relative to the current origin
  return url
}

/**
 * Get alt text for logo
 */
const getLogoAlt = (logo: number | Media | null | undefined, fallback: string = 'Logo'): string => {
  if (!logo) return fallback

  if (typeof logo === 'number') {
    return fallback
  }

  return logo.alt || fallback
}

export const Logo = (props: Props) => {
  const {
    loading: loadingFromProps,
    priority: priorityFromProps,
    className,
    logo,
    theme: themeFromProps,
  } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  // Track if component is mounted to avoid hydration mismatches
  const [mounted, setMounted] = useState(false)

  // Define mobile device (only after mount to avoid SSR mismatch)
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Define current theme
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Check theme from data-theme attribute or prefers-color-scheme
    const checkTheme = () => {
      const dataTheme = document.documentElement.getAttribute('data-theme')
      if (dataTheme === 'dark') {
        setCurrentTheme('dark')
      } else if (dataTheme === 'light') {
        setCurrentTheme('light')
      } else {
        // Use system theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setCurrentTheme(prefersDark ? 'dark' : 'light')
      }
    }

    checkTheme()

    // Listen for changes in theme
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    // Listen for changes in system theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => checkTheme()
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [mounted])

  // Use passed theme or determine automatically (only after mount)
  const theme = themeFromProps || (mounted ? currentTheme : 'light')

  // Select logo in the following order:
  // 1. Mobile logo (if mobile device and it is set)
  // 2. Logo for current theme (dark/light)
  // 3. Light theme logo as fallback
  // Note: We use light theme as default during SSR to avoid hydration mismatch
  let selectedLogo: number | Media | null | undefined = null
  let logoAlt = 'Logo'

  if (logo) {
    // During SSR or before mount, always use light theme logo to ensure consistency
    if (!mounted) {
      if (logo.light) {
        selectedLogo = logo.light
        logoAlt = getLogoAlt(logo.light, 'Logo')
      } else if (logo.dark) {
        selectedLogo = logo.dark
        logoAlt = getLogoAlt(logo.dark, 'Logo')
      }
    } else {
      // After mount, use responsive logic
      if (isMobile && logo.mobile) {
        selectedLogo = logo.mobile
        logoAlt = getLogoAlt(logo.mobile, 'Logo')
      } else if (theme === 'dark' && logo.dark) {
        selectedLogo = logo.dark
        logoAlt = getLogoAlt(logo.dark, 'Logo')
      } else if (logo.light) {
        selectedLogo = logo.light
        logoAlt = getLogoAlt(logo.light, 'Logo')
      } else if (logo.dark) {
        // Fallback to dark if light is not set
        selectedLogo = logo.dark
        logoAlt = getLogoAlt(logo.dark, 'Logo')
      }
    }
  }

  const logoUrl = getLogoUrl(selectedLogo)

  // If logo is not set, use default
  const finalUrl =
    logoUrl ||
    'https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-logo-light.svg'
  const finalAlt = logoUrl ? logoAlt : 'Payload Logo'

  return (
    /* eslint-disable @next/next/no-img-element */
    <img
      alt={finalAlt}
      width={193}
      height={34}
      loading={loading}
      fetchPriority={priority}
      decoding="async"
      className={clsx('max-w-[9.375rem] w-full h-[34px]', className)}
      src={finalUrl}
      suppressHydrationWarning
    />
  )
}
