import { memo } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Verification status types
 */
export type VerificationStatusType = 'PENDING' | 'APPROVED' | 'REJECTED'

/**
 * VerificationStatus badge props
 */
export interface VerificationStatusProps {
  status: VerificationStatusType
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

/**
 * Status styles mapping
 */
const statusStyles: Record<
  VerificationStatusType,
  { bg: string; text: string; border: string; dot: string }
> = {
  PENDING: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  APPROVED: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  REJECTED: {
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
}

/**
 * Size styles mapping
 */
const sizeStyles: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
}

/**
 * Get status label
 */
const getStatusLabel = (status: VerificationStatusType): string => {
  const labels: Record<VerificationStatusType, string> = {
    PENDING: 'Oczekujący',
    APPROVED: 'Zweryfikowany',
    REJECTED: 'Odrzucony',
  }
  return labels[status]
}

/**
 * VerificationStatus Badge Component
 *
 * Displays patient verification status with color-coded badge
 *
 * @example
 * ```tsx
 * <VerificationStatus status="APPROVED" />
 * <VerificationStatus status="PENDING" showLabel />
 * <VerificationStatus status="REJECTED" size="lg" />
 * ```
 */
export const VerificationStatus = memo(
  ({ status, size = 'md', showLabel = true, className }: VerificationStatusProps) => {
    const styles = statusStyles[status]
    const sizeStyle = sizeStyles[size]

    const baseStyles = clsx(
      'inline-flex items-center gap-1.5',
      'rounded-full border',
      styles.bg,
      styles.text,
      styles.border,
      sizeStyle,
      className
    )

    return (
      <span className={twMerge(baseStyles)}>
        <span className={clsx('h-2 w-2 rounded-full', styles.dot)} aria-hidden="true" />
        {showLabel ? <span className="font-medium">{getStatusLabel(status)}</span> : null}
      </span>
    )
  }
)

export default VerificationStatus
