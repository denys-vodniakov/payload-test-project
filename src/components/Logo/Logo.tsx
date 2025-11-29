'use client'

import clsx from 'clsx'
import React, { useEffect, useState, useMemo } from 'react'
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
 * Get URL of media file - works with both local storage and Vercel Blob Storage
 */
const getLogoUrl = (logo: number | Media | null | undefined): string => {
  if (!logo) return ''

  if (typeof logo === 'number') {
    // If this is an ID, return empty string (in production we need to load media)
    return ''
  }

  const url = logo.url || null
  if (!url) return ''

  // If URL already has protocol (Vercel Blob Storage or external), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  // For relative URLs, use getMediaUrl to ensure proper base URL
  // This handles both local development and Vercel production
  return getMediaUrl(url, logo.updatedAt)
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
  // Use useMemo to recalculate when theme, logo, isMobile, or mounted changes
  const { selectedLogo, logoAlt, allLogos } = useMemo(() => {
    let selected: number | Media | null | undefined = null
    let alt = 'Logo'
    const logos: Array<{ url: string; alt: string }> = []

    if (logo) {
      // Collect all available logos for preloading
      if (logo.light && typeof logo.light !== 'number') {
        const url = getLogoUrl(logo.light)
        if (url) {
          logos.push({ url, alt: getLogoAlt(logo.light, 'Logo') })
        }
      }
      if (logo.dark && typeof logo.dark !== 'number') {
        const url = getLogoUrl(logo.dark)
        if (url) {
          logos.push({ url, alt: getLogoAlt(logo.dark, 'Logo') })
        }
      }
      if (logo.mobile && typeof logo.mobile !== 'number') {
        const url = getLogoUrl(logo.mobile)
        if (url) {
          logos.push({ url, alt: getLogoAlt(logo.mobile, 'Logo') })
        }
      }

      // During SSR or before mount, always use light theme logo to ensure consistency
      if (!mounted) {
        if (logo.light) {
          selected = logo.light
          alt = getLogoAlt(logo.light, 'Logo')
        } else if (logo.dark) {
          selected = logo.dark
          alt = getLogoAlt(logo.dark, 'Logo')
        }
      } else {
        // After mount, use responsive logic
        if (isMobile && logo.mobile) {
          selected = logo.mobile
          alt = getLogoAlt(logo.mobile, 'Logo')
        } else if (theme === 'dark' && logo.dark) {
          selected = logo.dark
          alt = getLogoAlt(logo.dark, 'Logo')
        } else if (logo.light) {
          selected = logo.light
          alt = getLogoAlt(logo.light, 'Logo')
        } else if (logo.dark) {
          // Fallback to dark if light is not set
          selected = logo.dark
          alt = getLogoAlt(logo.dark, 'Logo')
        }
      }
    }

    return { selectedLogo: selected, logoAlt: alt, allLogos: logos }
  }, [logo, theme, isMobile, mounted])

  const logoUrl = getLogoUrl(selectedLogo)

  // Preload all logo variants to avoid broken image on theme switch
  useEffect(() => {
    if (mounted && allLogos.length > 0) {
      allLogos.forEach(({ url }) => {
        if (url && url !== logoUrl) {
          const link = document.createElement('link')
          link.rel = 'preload'
          link.as = 'image'
          link.href = url
          document.head.appendChild(link)
        }
      })
    }
  }, [mounted, allLogos, logoUrl])

  // If logo is not set, use default
  const finalUrl =
    logoUrl ||
    'https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-logo-light.svg'
  const finalAlt = logoUrl ? logoAlt : 'Payload Logo'

  return (
    <>
      {/* Preload logo images for faster theme switching */}
      {allLogos.map(({ url }, index) => (
        <link key={`logo-preload-${index}`} rel="preload" as="image" href={url} />
      ))}
      {/* eslint-disable @next/next/no-img-element */}
      <img
        alt={finalAlt}
        loading={loading}
        fetchPriority={priority}
        decoding="async"
        className={clsx('max-w-[9.375rem] w-full h-[34px]', className)}
        src={finalUrl}
        suppressHydrationWarning
        onError={(e) => {
          // Fallback to default logo if image fails to load
          const target = e.currentTarget
          if (target.src !== finalUrl) {
            target.src =
              'https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-logo-light.svg'
          }
        }}
      />
    </>
  )
}
