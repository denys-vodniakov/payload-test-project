'use client'

import { useEffect, useState } from 'react'

import canUseDOM from '@/utilities/canUseDOM'

/**
 * Hook to determine if a media query matches
 * @param query - CSS media query (e.g., '(max-width: 768px)')
 * @returns boolean - whether the current screen state matches the query
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (!canUseDOM) {
      return
    }

    const mediaQuery = window.matchMedia(query)

    // Set initial value
    setMatches(mediaQuery.matches)

    // Create change handler
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Subscribe to changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler)
    }

    // Cleanup subscription
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler)
      } else {
        mediaQuery.removeListener(handler)
      }
    }
  }, [query])

  return matches
}

