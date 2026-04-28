import { useEffect, useState, useCallback } from 'react'

/**
 * useDebounce Hook
 *
 * Delays updating a value until after a specified delay
 * Useful for search inputs, API calls, etc.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Debounced value
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('')
 * const debouncedSearchTerm = useDebounce(searchTerm, 300)
 *
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     searchPatients(debouncedSearchTerm)
 *   }
 * }, [debouncedSearchTerm])
 * ```
 */
export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce
