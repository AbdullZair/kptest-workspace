import { memo } from 'react'
import { clsx } from 'clsx'
import type { ProjectStatus as ProjectStatusType } from '../types'

/**
 * ProjectStatus badge component props
 */
export interface ProjectStatusProps {
  status: ProjectStatusType
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

/**
 * Status configuration
 */
const statusConfig: Record<ProjectStatusType, { label: string; color: string; icon: string }> = {
  PLANNED: {
    label: 'Planowany',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  ACTIVE: {
    label: 'Aktywny',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  COMPLETED: {
    label: 'Zakończony',
    color: 'bg-violet-100 text-violet-800 border-violet-300',
    icon: 'M5 13l4 4L19 7',
  },
  ARCHIVED: {
    label: 'Zarchiwizowany',
    color: 'bg-neutral-100 text-neutral-700 border-neutral-300',
    icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
  },
  CANCELLED: {
    label: 'Anulowany',
    color: 'bg-rose-100 text-rose-800 border-rose-300',
    icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
}

/**
 * Size configuration
 */
const sizeConfig = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
}

/**
 * ProjectStatus Badge Component
 *
 * Displays a colored badge indicating project status
 *
 * @example
 * ```tsx
 * <ProjectStatus status="ACTIVE" size="md" showLabel={true} />
 * ```
 */
export const ProjectStatus = memo(
  ({ status, size = 'md', showLabel = true, className }: ProjectStatusProps) => {
    const config = statusConfig[status] || statusConfig.PLANNED
    const sizeClasses = sizeConfig[size]

    return (
      <span
        aria-label={`Status: ${config.label}`}
        className={clsx(
          'inline-flex items-center gap-1.5 rounded-full border font-medium',
          sizeClasses,
          config.color,
          className
        )}
        role="status"
      >
        <svg
          className={clsx(
            'flex-shrink-0',
            size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path d={config.icon} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        </svg>
        {showLabel ? <span>{config.label}</span> : null}
      </span>
    )
  }
)

export default ProjectStatus
