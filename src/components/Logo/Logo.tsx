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

  // Define current theme - initialize immediately on client
  // InitTheme script runs beforeInteractive, so data-theme should be set by the time component mounts
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(() => {
    // Try to get theme immediately if we're on client
    if (typeof window !== 'undefined') {
      // InitTheme script should have already set data-theme
      const dataTheme = document.documentElement.getAttribute('data-theme')
      if (dataTheme === 'dark' || dataTheme === 'light') {
        return dataTheme as 'light' | 'dark'
      }
      // Use system theme as fallback
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })

  useEffect(() => {
    setMounted(true)

    // Check theme immediately after mount
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

    // Check immediately - InitTheme should have run by now
    checkTheme()

    // Also check after a microtask to ensure InitTheme script has completed
    Promise.resolve().then(checkTheme)

    // Also check after a short delay to catch any late theme initialization
    const timeoutId = setTimeout(checkTheme, 10)

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
      clearTimeout(timeoutId)
      observer.disconnect()
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  // Use passed theme or determine automatically
  const theme = themeFromProps || currentTheme

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

      // Select logo based on device and theme
      // Priority: mobile > theme-specific > light > dark
      if (mounted && isMobile && logo.mobile) {
        selected = logo.mobile
        alt = getLogoAlt(logo.mobile, 'Logo')
      } else if (theme === 'dark' && logo.dark) {
        selected = logo.dark
        alt = getLogoAlt(logo.dark, 'Logo')
      } else if (theme === 'light' && logo.light) {
        selected = logo.light
        alt = getLogoAlt(logo.light, 'Logo')
      } else if (logo.light) {
        // Fallback to light if theme is not determined yet or theme is light
        selected = logo.light
        alt = getLogoAlt(logo.light, 'Logo')
      } else if (logo.dark) {
        // Fallback to dark if light is not set
        selected = logo.dark
        alt = getLogoAlt(logo.dark, 'Logo')
      }
    }

    return { selectedLogo: selected, logoAlt: alt, allLogos: logos }
  }, [logo, theme, isMobile, mounted])

  const logoUrl = getLogoUrl(selectedLogo)

  // Preload all logo variants immediately to avoid broken image
  useEffect(() => {
    if (allLogos.length > 0) {
      allLogos.forEach(({ url }) => {
        if (url) {
          // Check if link already exists
          const existingLink = document.querySelector(`link[href="${url}"]`)
          if (!existingLink) {
            const link = document.createElement('link')
            link.rel = 'preload'
            link.as = 'image'
            link.href = url
            document.head.appendChild(link)
          }
        }
      })
    }
  }, [allLogos])

  // Force re-render when theme changes to ensure correct logo is selected
  const [logoKey, setLogoKey] = useState(0)
  useEffect(() => {
    if (mounted) {
      setLogoKey((prev) => prev + 1)
    }
  }, [theme, mounted])

  // If logo is not set, use default
  const finalUrl =
    logoUrl ||
    'https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-logo-light.svg'
  const finalAlt = logoUrl ? logoAlt : 'Payload Logo'

  // Debug logging (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Logo] Selected logo:', {
        theme,
        mounted,
        isMobile,
        logoUrl: finalUrl,
        hasLight: !!logo?.light,
        hasDark: !!logo?.dark,
        hasMobile: !!logo?.mobile,
      })
    }
  }, [theme, mounted, isMobile, finalUrl, logo])

  return (
    <>
      {/* Preload logo images for faster theme switching */}
      {allLogos.length > 0 && (
        <>
          {allLogos.map(({ url }, index) => {
            // Preload all logo variants
            return <link key={`logo-preload-${index}`} rel="preload" as="image" href={url} />
          })}
        </>
      )}
      {/* eslint-disable @next/next/no-img-element */}
      <img
        alt={finalAlt}
        loading={loading}
        fetchPriority={priority}
        decoding="async"
        className={clsx('max-w-[9.375rem] w-full h-[34px]', className)}
        src={finalUrl}
        suppressHydrationWarning
        key={`logo-${theme}-${logoKey}-${logoUrl || 'default'}`}
        onError={(e) => {
          // Fallback to default logo if image fails to load
          const target = e.currentTarget
          const defaultLogo =
            'https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-logo-light.svg'
          if (target.src !== defaultLogo && !target.dataset.fallback) {
            console.error('[Logo] Failed to load image:', finalUrl, 'Falling back to default')
            target.dataset.fallback = 'true'
            target.src = defaultLogo
          }
        }}
        onLoad={() => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[Logo] Image loaded successfully:', finalUrl)
          }
        }}
      />
    </>
  )
}
