import { memo } from 'react'
import { twMerge } from 'tailwind-merge'
import type { MaterialType } from '../types/material.types'

/**
 * MaterialTypeIcon component props
 */
export interface MaterialTypeIconProps {
  type: MaterialType
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showLabel?: boolean
}

/**
 * Get icon SVG for material type
 */
const getTypeIcon = (type: MaterialType): JSX.Element => {
  switch (type) {
    case 'ARTICLE':
      return (
        <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      )
    case 'PDF':
      return (
        <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      )
    case 'IMAGE':
      return (
        <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      )
    case 'VIDEO':
      return (
        <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
          <path
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      )
    case 'LINK':
      return (
        <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      )
    case 'AUDIO':
      return (
        <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      )
    default:
      return (
        <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      )
  }
}

/**
 * Get color for material type
 */
const getTypeColor = (type: MaterialType): string => {
  switch (type) {
    case 'ARTICLE':
      return 'text-blue-600 bg-blue-50'
    case 'PDF':
      return 'text-red-600 bg-red-50'
    case 'IMAGE':
      return 'text-purple-600 bg-purple-50'
    case 'VIDEO':
      return 'text-rose-600 bg-rose-50'
    case 'LINK':
      return 'text-green-600 bg-green-50'
    case 'AUDIO':
      return 'text-orange-600 bg-orange-50'
    default:
      return 'text-neutral-600 bg-neutral-50'
  }
}

/**
 * Get label for material type
 */
const getTypeLabel = (type: MaterialType): string => {
  const labels: Record<MaterialType, string> = {
    ARTICLE: 'Artykuł',
    PDF: 'PDF',
    IMAGE: 'Obraz',
    VIDEO: 'Wideo',
    LINK: 'Link',
    AUDIO: 'Audio',
  }
  return labels[type] || type
}

/**
 * Get size classes
 */
const getSizeClasses = (size: 'sm' | 'md' | 'lg'): { icon: string; label: string } => {
  switch (size) {
    case 'sm':
      return { icon: 'w-4 h-4', label: 'text-xs' }
    case 'md':
      return { icon: 'w-5 h-5', label: 'text-sm' }
    case 'lg':
      return { icon: 'w-6 h-6', label: 'text-base' }
  }
}

/**
 * MaterialTypeIcon Component
 *
 * Displays an icon representing the material type
 *
 * @example
 * ```tsx
 * <MaterialTypeIcon type="VIDEO" size="md" />
 * <MaterialTypeIcon type="PDF" size="sm" showLabel />
 * ```
 */
export const MaterialTypeIcon = memo(
  ({ type, size = 'md', className, showLabel = false }: MaterialTypeIconProps) => {
    const sizeClasses = getSizeClasses(size)
    const colorClasses = getTypeColor(type)

    return (
      <div
        className={twMerge(
          'inline-flex items-center gap-1.5 rounded-md px-2 py-1',
          colorClasses,
          className
        )}
      >
        <div className={sizeClasses.icon}>{getTypeIcon(type)}</div>
        {showLabel ? (
          <span className={twMerge('font-medium', sizeClasses.label)}>{getTypeLabel(type)}</span>
        ) : null}
      </div>
    )
  }
)

export default MaterialTypeIcon
