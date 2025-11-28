'use client'

import { useEffect, useState } from 'react'

import canUseDOM from '@/utilities/canUseDOM'

/**
 * Хук для определения соответствия медиа-запросу
 * @param query - CSS медиа-запрос (например, '(max-width: 768px)')
 * @returns boolean - соответствует ли текущее состояние экрана запросу
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (!canUseDOM) {
      return
    }

    const mediaQuery = window.matchMedia(query)
    
    // Устанавливаем начальное значение
    setMatches(mediaQuery.matches)

    // Создаем обработчик изменений
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Подписываемся на изменения
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler)
    } else {
      // Fallback для старых браузеров
      mediaQuery.addListener(handler)
    }

    // Очистка подписки
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

