import { useState, useEffect, useCallback } from 'react'

/**
 * useMediaQuery Hook
 *
 * Tracks the state of a CSS media query
 *
 * @param query - Media query string
 * @param defaultValue - Default value for SSR
 * @returns Whether the media query matches
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 768px)')
 * const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
 * const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
 * ```
 */
export const useMediaQuery = (query: string, defaultValue: boolean = false): boolean => {
  const getMatches = useCallback((mediaQuery: string): boolean => {
    if (typeof window === 'undefined') {
      return defaultValue
    }
    return window.matchMedia(mediaQuery).matches
  }, [defaultValue])

  const [matches, setMatches] = useState<boolean>(getMatches(query))

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQueryList = window.matchMedia(query)

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add listener
    mediaQueryList.addEventListener('change', handleChange)

    // Initial check
    setMatches(mediaQueryList.matches)

    // Cleanup
    return () => {
      mediaQueryList.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}

/**
 * useIsMobile Hook
 *
 * Convenience hook for checking mobile viewport
 *
 * @param breakpoint - Breakpoint in pixels (default: 768)
 * @returns Whether viewport is mobile
 */
export const useIsMobile = (breakpoint: number = 768): boolean => {
  return useMediaQuery(`(max-width: ${breakpoint}px)`)
}

/**
 * useIsDarkMode Hook
 *
 * Convenience hook for checking system dark mode preference
 *
 * @returns Whether system prefers dark mode
 */
export const useIsDarkMode = (): boolean => {
  return useMediaQuery('(prefers-color-scheme: dark)')
}

/**
 * useIsReducedMotion Hook
 *
 * Convenience hook for checking reduced motion preference
 *
 * @returns Whether user prefers reduced motion
 */
export const useIsReducedMotion = (): boolean => {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

export default useMediaQuery
