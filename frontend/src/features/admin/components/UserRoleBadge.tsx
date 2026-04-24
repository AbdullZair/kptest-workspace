import { memo } from 'react'
import type { UserRole } from '../types'

/**
 * UserRoleBadge component props
 */
export interface UserRoleBadgeProps {
  role: UserRole
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Get role color based on role type
 */
const getRoleColor = (role: UserRole): string => {
  const colors: Record<UserRole, string> = {
    ADMIN: 'bg-red-100 text-red-800 border-red-200',
    COORDINATOR: 'bg-purple-100 text-purple-800 border-purple-200',
    DOCTOR: 'bg-blue-100 text-blue-800 border-blue-200',
    THERAPIST: 'bg-green-100 text-green-800 border-green-200',
    NURSE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    PATIENT: 'bg-gray-100 text-gray-800 border-gray-200',
  }
  return colors[role] || colors.PATIENT
}

/**
 * Get role label in Polish
 */
const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    ADMIN: 'Administrator',
    COORDINATOR: 'Koordynator',
    DOCTOR: 'Lekarz',
    THERAPIST: 'Terapeuta',
    NURSE: 'Pielęgniarz',
    PATIENT: 'Pacjent',
  }
  return labels[role] || role
}

/**
 * Get size classes
 */
const getSizeClasses = (size: 'sm' | 'md' | 'lg'): string => {
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }
  return sizes[size]
}

/**
 * UserRoleBadge Component
 *
 * Displays a badge indicating the user's role
 *
 * @example
 * ```tsx
 * <UserRoleBadge role="ADMIN" size="md" />
 * ```
 */
export const UserRoleBadge = memo(function UserRoleBadge({
  role,
  size = 'md',
  className = '',
}: UserRoleBadgeProps) {
  const colorClass = getRoleColor(role)
  const sizeClass = getSizeClasses(size)

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${colorClass} ${sizeClass} ${className}`}
    >
      {getRoleLabel(role)}
    </span>
  )
})

export default UserRoleBadge
