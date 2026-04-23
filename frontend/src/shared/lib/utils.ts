/**
 * Validate email address format
 *
 * @param email - Email to validate
 * @returns Whether email is valid
 *
 * @example
 * ```tsx
 * isValidEmail('test@example.com') // true
 * isValidEmail('invalid') // false
 * ```
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (Polish format)
 *
 * @param phone - Phone number to validate
 * @returns Whether phone number is valid
 *
 * @example
 * ```tsx
 * isValidPhone('123456789') // true
 * isValidPhone('+48 123 456 789') // true
 * isValidPhone('invalid') // false
 * ```
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{3,6}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Validate PESEL (Polish national ID)
 *
 * @param pesel - PESEL number to validate
 * @returns Whether PESEL is valid
 */
export const isValidPesel = (pesel: string): boolean => {
  const peselRegex = /^\d{11}$/

  if (!peselRegex.test(pesel)) {
    return false
  }

  const digits = pesel.split('').map(Number)
  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3]
  const checksum = weights.reduce((sum, weight, index) => sum + weight * digits[index], 0)
  const controlDigit = (10 - (checksum % 10)) % 10

  return controlDigit === digits[10]
}

/**
 * Validate password strength
 *
 * @param password - Password to validate
 * @returns Password strength result
 *
 * @example
 * ```tsx
 * validatePassword('weak') // { isValid: false, errors: ['too_short', ...] }
 * validatePassword('Strong123!') // { isValid: true, errors: [] }
 * ```
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('too_short')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('no_uppercase')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('no_lowercase')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('no_number')
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('no_special_char')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Sanitize HTML string
 *
 * @param html - HTML string to sanitize
 * @returns Sanitized string
 */
export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

/**
 * Truncate text with ellipsis
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 *
 * @example
 * ```tsx
 * truncate('Hello World', 5) // "Hello..."
 * truncate('Hi', 5) // "Hi"
 * ```
 */
export const truncate = (text: string, maxLength: number): string => {
  if (!text) {
    return ''
  }

  if (text.length <= maxLength) {
    return text
  }

  return text.slice(0, maxLength) + '...'
}

/**
 * Capitalize first letter of string
 *
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export const capitalize = (text: string): string => {
  if (!text) {
    return ''
  }

  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Generate unique ID
 *
 * @param prefix - Optional prefix
 * @returns Unique ID string
 */
export const generateId = (prefix: string = ''): string => {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substring(2)}`
}

/**
 * Format file size to human-readable format
 *
 * @param bytes - File size in bytes
 * @param decimals - Number of decimal places
 * @returns Formatted file size
 *
 * @example
 * ```tsx
 * formatFileSize(1024) // "1 KB"
 * formatFileSize(1048576) // "1 MB"
 * ```
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) {
    return '0 B'
  }

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * Debounce function
 *
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * Throttle function
 *
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true

      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

export default {
  isValidEmail,
  isValidPhone,
  isValidPesel,
  validatePassword,
  sanitizeHtml,
  truncate,
  capitalize,
  generateId,
  formatFileSize,
  debounce,
  throttle,
}
