import { memo } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { MaterialStatus } from '../types/material.types'

/**
 * ProgressTracker component props
 */
export interface ProgressTrackerProps {
  status: MaterialStatus
  completedAt?: string
  timeSpentSeconds?: number
  quizScore?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showLabel?: boolean
}

/**
 * Get status label
 */
const getStatusLabel = (status: MaterialStatus): string => {
  const labels: Record<MaterialStatus, string> = {
    PENDING: 'Do przeczytania',
    IN_PROGRESS: 'W trakcie',
    COMPLETED: 'Ukończone',
  }
  return labels[status] || status
}

/**
 * Get status color
 */
const getStatusColor = (status: MaterialStatus): string => {
  switch (status) {
    case 'PENDING':
      return 'text-neutral-600 bg-neutral-100'
    case 'IN_PROGRESS':
      return 'text-blue-600 bg-blue-100'
    case 'COMPLETED':
      return 'text-green-600 bg-green-100'
  }
}

/**
 * Get status icon
 */
const getStatusIcon = (status: MaterialStatus): JSX.Element => {
  switch (status) {
    case 'PENDING':
      return (
        <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )
    case 'IN_PROGRESS':
      return (
        <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )
    case 'COMPLETED':
      return (
        <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )
  }
}

/**
 * Format time spent
 */
const formatTimeSpent = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}min`
}

/**
 * Get size classes
 */
const getSizeClasses = (size: 'sm' | 'md' | 'lg'): { container: string; icon: string; text: string } => {
  switch (size) {
    case 'sm':
      return { container: 'px-2 py-1', icon: 'w-3.5 h-3.5', text: 'text-xs' }
    case 'md':
      return { container: 'px-3 py-1.5', icon: 'w-4 h-4', text: 'text-sm' }
    case 'lg':
      return { container: 'px-4 py-2', icon: 'w-5 h-5', text: 'text-base' }
  }
}

/**
 * ProgressTracker Component
 *
 * Displays material progress status with optional details
 *
 * @example
 * ```tsx
 * <ProgressTracker status="COMPLETED" timeSpentSeconds={300} />
 * <ProgressTracker status="IN_PROGRESS" size="lg" showLabel />
 * ```
 */
export const ProgressTracker = memo(function ProgressTracker({
  status,
  completedAt,
  timeSpentSeconds,
  quizScore,
  size = 'md',
  className,
  showLabel = true,
}: ProgressTrackerProps) {
  const sizeClasses = getSizeClasses(size)
  const colorClasses = getStatusColor(status)

  return (
    <div
      className={twMerge(
        'inline-flex items-center gap-2 rounded-full font-medium',
        colorClasses,
        sizeClasses.container,
        className
      )}
    >
      <div className={sizeClasses.icon}>{getStatusIcon(status)}</div>
      {showLabel && <span className={sizeClasses.text}>{getStatusLabel(status)}</span>}

      {/* Additional info */}
      {status === 'COMPLETED' && (
        <div className="flex items-center gap-2 ml-2">
          {timeSpentSeconds !== undefined && timeSpentSeconds > 0 && (
            <span className={twMerge('text-neutral-500', sizeClasses.text)}>
              Czas: {formatTimeSpent(timeSpentSeconds)}
            </span>
          )}
          {quizScore !== undefined && quizScore !== null && (
            <span
              className={twMerge(
                'px-2 py-0.5 rounded text-xs font-semibold',
                quizScore >= 80
                  ? 'bg-green-200 text-green-800'
                  : quizScore >= 50
                  ? 'bg-yellow-200 text-yellow-800'
                  : 'bg-red-200 text-red-800'
              )}
            >
              Wynik: {quizScore}%
            </span>
          )}
        </div>
      )}
    </div>
  )
})

/**
 * ProgressList Component
 *
 * Displays a list of progress items with summary
 */
export interface ProgressListProps {
  total: number
  completed: number
  inProgress: number
  pending: number
  className?: string
}

export const ProgressList = memo(function ProgressList({
  total,
  completed,
  inProgress,
  pending,
  className,
}: ProgressListProps) {
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className={twMerge('space-y-3', className)}>
      {/* Progress bar */}
      <div className="w-full bg-neutral-200 rounded-full h-2.5">
        <div
          className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{completed}</div>
          <div className="text-neutral-500">Ukończone</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{inProgress}</div>
          <div className="text-neutral-500">W trakcie</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-neutral-600">{pending}</div>
          <div className="text-neutral-500">Do przeczytania</div>
        </div>
      </div>

      {/* Percentage */}
      <div className="text-center text-sm text-neutral-600">
        Postęp: {completionPercentage}% ({completed} z {total})
      </div>
    </div>
  )
})

export default ProgressTracker
