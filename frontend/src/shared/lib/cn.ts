import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with clsx
 *
 * Combines clsx for conditional classes with tailwind-merge
 * for proper class deduplication
 *
 * @param inputs - Class values to merge
 * @returns Merged class string
 *
 * @example
 * ```tsx
 * const className = cn(
 *   'base-class',
 *   isActive && 'active-class',
 *   variant === 'primary' ? 'bg-blue-500' : 'bg-gray-500'
 * )
 * ```
 */
export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs))
}

export default cn
