import type { User } from '@shared/types'

/**
 * User entity type
 * Extended user type with computed properties
 */
export interface UserEntity extends User {
  fullName: string
  initials: string
  displayName: string
}

/**
 * Transform User to UserEntity with computed properties
 */
export const toUserEntity = (user: User): UserEntity => ({
  ...user,
  fullName: `${user.firstName} ${user.lastName}`,
  initials: `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`,
  displayName: user.firstName,
})

/**
 * Get user role display name
 */
export const getUserRoleName = (role: User['role']): string => {
  const roleNames: Record<User['role'], string> = {
    ADMIN: 'Administrator',
    DOCTOR: 'Lekarz',
    NURSE: 'Pielęgniarka',
    RECEPTIONIST: 'Recepcjonista',
    PATIENT: 'Pacjent',
  }

  return roleNames[role] || role
}

/**
 * Check if user has specific role
 */
export const hasRole = (user: User | null, role: User['role']): boolean => {
  return user?.role === role
}

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (user: User | null, roles: User['role'][]): boolean => {
  return user ? roles.includes(user.role) : false
}

/**
 * Check if user is medical staff
 */
export const isMedicalStaff = (user: User | null): boolean => {
  return user ? ['DOCTOR', 'NURSE'].includes(user.role) : false
}

/**
 * Check if user is admin
 */
export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'ADMIN'
}

export type { User }
