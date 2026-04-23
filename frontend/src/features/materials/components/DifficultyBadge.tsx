import { memo } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { DifficultyLevel } from '../types/material.types'

/**
 * DifficultyBadge component props
 */
export interface DifficultyBadgeProps {
  level: DifficultyLevel
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Get color for difficulty level
 */
const getDifficultyColor = (level: DifficultyLevel): string => {
  switch (level) {
    case 'BASIC':
      return 'text-green-700 bg-green-50 border-green-200'
    case 'INTERMEDIATE':
      return 'text-yellow-700 bg-yellow-50 border-yellow-200'
    case 'ADVANCED':
      return 'text-red-700 bg-red-50 border-red-200'
    default:
      return 'text-neutral-700 bg-neutral-50 border-neutral-200'
  }
}

/**
 * Get label for difficulty level
 */
const getDifficultyLabel = (level: DifficultyLevel): string => {
  const labels: Record<DifficultyLevel, string> = {
    BASIC: 'Podstawowy',
    INTERMEDIATE: 'Średniozaawansowany',
    ADVANCED: 'Zaawansowany',
  }
  return labels[level] || level
}

/**
 * Get icon for difficulty level
 */
const getDifficultyIcon = (level: DifficultyLevel): JSX.Element => {
  switch (level) {
    case 'BASIC':
      return (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )
    case 'INTERMEDIATE':
      return (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )
    case 'ADVANCED':
      return (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )
  }
}

/**
 * Get size classes
 */
const getSizeClasses = (size: 'sm' | 'md' | 'lg'): string => {
  switch (size) {
    case 'sm':
      return 'text-xs px-2 py-0.5'
    case 'md':
      return 'text-sm px-2.5 py-1'
    case 'lg':
      return 'text-base px-3 py-1.5'
  }
}

/**
 * DifficultyBadge Component
 *
 * Displays a badge representing the difficulty level
 *
 * @example
 * ```tsx
 * <DifficultyBadge level="BASIC" size="md" />
 * ```
 */
export const DifficultyBadge = memo(function DifficultyBadge({
  level,
  size = 'md',
  className,
}: DifficultyBadgeProps) {
  const sizeClasses = getSizeClasses(size)
  const colorClasses = getDifficultyColor(level)

  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        colorClasses,
        sizeClasses,
        className
      )}
    >
      <span className="w-3 h-3">{getDifficultyIcon(level)}</span>
      {getDifficultyLabel(level)}
    </span>
  )
})

export default DifficultyBadge
