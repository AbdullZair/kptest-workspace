import { type ReactNode, memo } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { UserEntity } from '../model/types'

/**
 * UserAvatar props
 */
interface UserAvatarProps {
  user: UserEntity
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showStatus?: boolean
  className?: string
}

/**
 * Size mapping
 */
const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
}

/**
 * UserAvatar Component
 *
 * Displays user avatar with initials fallback
 *
 * @example
 * ```tsx
 * <UserAvatar user={currentUser} size="md" />
 * <UserAvatar user={user} showStatus />
 * ```
 */
export const UserAvatar = memo(
  ({ user, size = 'md', showStatus = false, className }: UserAvatarProps) => {
    const baseClasses = clsx(
      'inline-flex items-center justify-center',
      'rounded-full',
      'font-medium',
      'bg-primary-100 text-primary-700',
      'ring-2 ring-white',
      sizeClasses[size],
      className
    )

    return (
      <div className={twMerge(baseClasses)} title={user.fullName}>
        {user.avatarUrl ? (
          <img
            alt={user.fullName}
            className="h-full w-full rounded-full object-cover"
            src={user.avatarUrl}
          />
        ) : (
          <span>{user.initials}</span>
        )}

        {showStatus ? (
          <span
            aria-label={user.isActive ? 'Online' : 'Offline'}
            className={clsx(
              'absolute bottom-0 right-0',
              'h-3 w-3 rounded-full border-2 border-white',
              user.isActive ? 'bg-success-500' : 'bg-neutral-400'
            )}
          />
        ) : null}
      </div>
    )
  }
)

/**
 * UserCard props
 */
interface UserCardProps {
  user: UserEntity
  onClick?: () => void
  className?: string
  children?: ReactNode
}

/**
 * UserCard Component
 *
 * Displays user information in a card format
 *
 * @example
 * ```tsx
 * <UserCard user={currentUser} />
 * <UserCard user={user} onClick={handleClick} />
 * ```
 */
export const UserCard = memo(({ user, onClick, className, children }: UserCardProps) => {
  const baseClasses = clsx(
    'flex items-center gap-3',
    'p-3 rounded-lg',
    'hover:bg-neutral-50',
    onClick && 'cursor-pointer transition-colors',
    className
  )

  return (
    <div className={twMerge(baseClasses)} role={onClick ? 'button' : undefined} onClick={onClick}>
      <UserAvatar size="md" user={user} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-neutral-900">{user.fullName}</p>
        <p className="truncate text-xs text-neutral-500">{user.email}</p>
      </div>

      {children}
    </div>
  )
})

/**
 * UserBadge props
 */
interface UserBadgeProps {
  user: UserEntity
  size?: 'sm' | 'md'
  className?: string
}

/**
 * UserBadge Component
 *
 * Displays user as a compact badge
 *
 * @example
 * ```tsx
 * <UserBadge user={assignee} />
 * ```
 */
export const UserBadge = memo(({ user, size = 'sm', className }: UserBadgeProps) => {
  const sizeClasses = {
    sm: 'gap-1.5',
    md: 'gap-2',
  }

  const textClasses = {
    sm: 'text-xs',
    md: 'text-sm',
  }

  const baseClasses = clsx('inline-flex items-center', sizeClasses[size], className)

  return (
    <div className={twMerge(baseClasses)}>
      <UserAvatar size={size} user={user} />
      <span className={clsx('font-medium text-neutral-700', textClasses[size])}>
        {user.firstName}
      </span>
    </div>
  )
})

export default { UserAvatar, UserCard, UserBadge }
