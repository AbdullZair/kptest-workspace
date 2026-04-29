import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'
import { pl } from 'date-fns/locale'

/**
 * Date format patterns
 */
export const DATE_FORMATS = {
  /** Full date with time: "23 paź 2024, 14:30" */
  FULL: 'dd MMM yyyy, HH:mm',
  /** Date only: "23 paź 2024" */
  DATE: 'dd MMM yyyy',
  /** Time only: "14:30" */
  TIME: 'HH:mm',
  /** ISO date: "2024-10-23" */
  ISO_DATE: 'yyyy-MM-dd',
  /** Display date: "23 października 2024" */
  DISPLAY: 'dd MMMM yyyy',
  /** Display with time: "23 października 2024, 14:30" */
  DISPLAY_WITH_TIME: 'dd MMMM yyyy, HH:mm',
  /** Short date: "23.10.2024" */
  SHORT: 'dd.MM.yyyy',
  /** Year-month: "2024-10" */
  YEAR_MONTH: 'yyyy-MM',
} as const

/**
 * Format a date to a specified format
 *
 * @param date - Date to format (Date object, ISO string, or timestamp)
 * @param formatStr - Format pattern (default: DATE_FORMATS.FULL)
 * @param locale - Locale for formatting (default: Polish)
 * @returns Formatted date string
 *
 * @example
 * ```tsx
 * formatDate(new Date()) // "23 paź 2024, 14:30"
 * formatDate('2024-10-23', DATE_FORMATS.DATE) // "23 paź 2024"
 * formatDate('2024-10-23T14:30:00', DATE_FORMATS.TIME) // "14:30"
 * ```
 */
export const formatDate = (
  date: Date | string | number | null | undefined,
  formatStr: string = DATE_FORMATS.FULL,
  localeCode: 'pl' | 'en' = 'pl'
): string => {
  if (!date) {
    return ''
  }

  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date)

    if (!isValid(parsedDate)) {
      console.warn('[formatDate] Invalid date:', date)
      return ''
    }

    const selectedLocale = localeCode === 'pl' ? pl : undefined

    return format(parsedDate, formatStr, { locale: selectedLocale })
  } catch (error) {
    console.error('[formatDate] Error formatting date:', error)
    return ''
  }
}

/**
 * Format date as relative time (e.g., "2 godziny temu")
 *
 * @param date - Date to format
 * @param options - Formatting options
 * @returns Relative time string
 *
 * @example
 * ```tsx
 * formatRelativeTime(new Date(Date.now() - 3600000)) // "około 1 godziny temu"
 * formatRelativeTime(new Date(), { addSuffix: false }) // "około 1 godziny"
 * ```
 */
export const formatRelativeTime = (
  date: Date | string | number | null | undefined,
  options?: { addSuffix?: boolean }
): string => {
  if (!date) {
    return ''
  }

  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date)

    if (!isValid(parsedDate)) {
      console.warn('[formatRelativeTime] Invalid date:', date)
      return ''
    }

    return formatDistanceToNow(parsedDate, {
      addSuffix: options?.addSuffix ?? true,
      locale: pl,
    })
  } catch (error) {
    console.error('[formatRelativeTime] Error formatting date:', error)
    return ''
  }
}

/**
 * Format date for input element (YYYY-MM-DD)
 *
 * @param date - Date to format
 * @returns ISO date string (YYYY-MM-DD)
 *
 * @example
 * ```tsx
 * formatDateForInput(new Date()) // "2024-10-23"
 * ```
 */
export const formatDateForInput = (date: Date | string | number | null | undefined): string => {
  if (!date) {
    return ''
  }

  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date)

    if (!isValid(parsedDate)) {
      console.warn('[formatDateForInput] Invalid date:', date)
      return ''
    }

    return format(parsedDate, DATE_FORMATS.ISO_DATE)
  } catch (error) {
    console.error('[formatDateForInput] Error formatting date:', error)
    return ''
  }
}

/**
 * Check if a date is today
 *
 * @param date - Date to check
 * @returns Whether the date is today
 */
export const isToday = (date: Date | string | number): boolean => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date)
    const today = new Date()

    return (
      parsedDate.getDate() === today.getDate() &&
      parsedDate.getMonth() === today.getMonth() &&
      parsedDate.getFullYear() === today.getFullYear()
    )
  } catch (error) {
    console.error('[isToday] Error checking date:', error)
    return false
  }
}

/**
 * Check if a date is in the past
 *
 * @param date - Date to check
 * @returns Whether the date is in the past
 */
export const isPast = (date: Date | string | number): boolean => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date)
    return parsedDate < new Date()
  } catch (error) {
    console.error('[isPast] Error checking date:', error)
    return false
  }
}

/**
 * Check if a date is in the future
 *
 * @param date - Date to check
 * @returns Whether the date is in the future
 */
export const isFuture = (date: Date | string | number): boolean => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date)
    return parsedDate > new Date()
  } catch (error) {
    console.error('[isFuture] Error checking date:', error)
    return false
  }
}

/**
 * Get age from birth date
 *
 * @param birthDate - Birth date
 * @returns Age in years
 *
 * @example
 * ```tsx
 * getAge('1990-05-15') // 34
 * ```
 */
export const getAge = (birthDate: Date | string | number): number => {
  try {
    const parsedDate = typeof birthDate === 'string' ? parseISO(birthDate) : new Date(birthDate)
    const today = new Date()

    let age = today.getFullYear() - parsedDate.getFullYear()
    const monthDiff = today.getMonth() - parsedDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsedDate.getDate())) {
      age--
    }

    return age
  } catch (error) {
    console.error('[getAge] Error calculating age:', error)
    return 0
  }
}

/**
 * Check if a date is within the last 30 days
 *
 * @param date - Date to check (ISO string or Date object)
 * @returns Whether the date is within the last 30 days
 *
 * @example
 * ```tsx
 * isWithin30Days('2024-04-01') // true if within 30 days
 * ```
 */
export const isWithin30Days = (date: Date | string | number): boolean => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    return parsedDate >= thirtyDaysAgo
  } catch (error) {
    console.error('[isWithin30Days] Error checking date:', error)
    return false
  }
}

export default {
  formatDate,
  formatRelativeTime,
  formatDateForInput,
  isToday,
  isPast,
  isFuture,
  getAge,
  isWithin30Days,
  DATE_FORMATS,
}
