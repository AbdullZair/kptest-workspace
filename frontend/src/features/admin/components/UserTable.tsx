import { memo } from 'react'
import type { UserAdmin } from '../types'
import { UserRoleBadge } from './UserRoleBadge'
import { UserStatusToggle } from './UserStatusToggle'
import { clsx } from 'clsx'

/**
 * UserTable column definition
 */
export type SortField = 'email' | 'role' | 'status' | 'created_at' | 'last_login'

/**
 * Sort order
 */
export type SortOrder = 'asc' | 'desc'

/**
 * UserTable component props
 */
export interface UserTableProps {
  users: UserAdmin[]
  onUserClick?: (user: UserAdmin) => void
  onEdit?: (user: UserAdmin) => void
  onDelete?: (user: UserAdmin) => void
  onStatusChange?: (userId: string, newStatus: UserAdmin['status']) => void
  sortField?: SortField
  sortOrder?: SortOrder
  onSortChange?: (field: SortField, order: SortOrder) => void
  isLoading?: boolean
  className?: string
}

/**
 * Format date for display
 */
const formatDate = (dateString?: string): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Sort icon component
 */
const SortIcon = ({ order, active }: { order: SortOrder; active: boolean }) => (
  <span className={clsx('ml-1 inline-flex flex-col', active ? 'opacity-100' : 'opacity-30')}>
    <svg
      className={clsx('h-3 w-3', order === 'asc' && 'text-primary-600')}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
        clipRule="evenodd"
      />
    </svg>
    <svg
      className={clsx('-mt-1 h-3 w-3', order === 'desc' && 'text-primary-600')}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  </span>
)

/**
 * Sortable header cell
 */
const SortableHeader = ({
  children,
  field,
  currentField,
  order,
  onSort,
}: {
  children: React.ReactNode
  field: SortField
  currentField?: SortField
  order?: SortOrder
  onSort?: (field: SortField, order: SortOrder) => void
}) => {
  const isActive = currentField === field
  const nextOrder: SortOrder = isActive && order === 'asc' ? 'desc' : 'asc'

  const handleClick = () => {
    onSort?.(field, nextOrder)
  }

  return (
    <th
      className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600 transition-colors hover:bg-neutral-50"
      onClick={handleClick}
      role="columnheader"
      aria-sort={isActive ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <span className="flex items-center">
        {children}
        <SortIcon order={isActive && order ? order : 'asc'} active={isActive} />
      </span>
    </th>
  )
}

/**
 * UserTable Component
 *
 * Displays users in a sortable table format with role badges and status toggles
 *
 * @example
 * ```tsx
 * <UserTable
 *   users={users}
 *   sortField="email"
 *   sortOrder="asc"
 *   onSortChange={handleSort}
 *   onUserClick={handleClick}
 * />
 * ```
 */
export const UserTable = memo(
  ({
    users,
    onUserClick,
    onEdit,
    onDelete,
    onStatusChange,
    sortField,
    sortOrder,
    onSortChange,
    isLoading = false,
    className,
  }: UserTableProps) => {
    const handleSort = (field: SortField, order: SortOrder) => {
      onSortChange?.(field, order)
    }

    const baseStyles = clsx('overflow-hidden rounded-lg border border-neutral-200', className)

    if (isLoading) {
      return (
        <div className={baseStyles}>
          <div className="animate-pulse">
            <div className="h-12 border-b border-neutral-200 bg-neutral-50" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 border-b border-neutral-100" />
            ))}
          </div>
        </div>
      )
    }

    if (users.length === 0) {
      return (
        <div className={baseStyles}>
          <div className="py-12 text-center">
            <svg
              className="mx-auto mb-4 h-16 w-16 text-neutral-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <p className="text-neutral-500">Brak użytkowników do wyświetlenia</p>
          </div>
        </div>
      )
    }

    return (
      <div className={baseStyles}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <SortableHeader
                  field="email"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={handleSort}
                >
                  Email
                </SortableHeader>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  Telefon
                </th>
                <SortableHeader
                  field="role"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={handleSort}
                >
                  Rola
                </SortableHeader>
                <SortableHeader
                  field="status"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={handleSort}
                >
                  Status
                </SortableHeader>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  2FA
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  Nieudane logowania
                </th>
                <SortableHeader
                  field="last_login"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={handleSort}
                >
                  Ostatnie logowanie
                </SortableHeader>
                <SortableHeader
                  field="created_at"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={handleSort}
                >
                  Dodano
                </SortableHeader>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {users.map((user) => (
                <tr
                  key={user.user_id}
                  className="cursor-pointer transition-colors hover:bg-neutral-50"
                  onClick={() => onUserClick?.(user)}
                >
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="text-sm font-medium text-neutral-900">{user.email}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="text-sm text-neutral-600">{user.phone || '-'}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <UserRoleBadge role={user.role} size="sm" />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <UserStatusToggle
                      status={user.status}
                      userId={user.user_id}
                      onStatusChange={onStatusChange}
                      disabled={user.role === 'ADMIN'}
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={clsx(
                        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                        user.two_factor_enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      )}
                    >
                      {user.two_factor_enabled ? 'Włączono' : 'Wyłączono'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={clsx(
                        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                        user.failed_login_attempts > 0
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      )}
                    >
                      {user.failed_login_attempts}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-600">
                    {formatDate(user.last_login_at)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-600">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit?.(user)
                        }}
                        className="rounded p-1 text-primary-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
                        aria-label="Edytuj"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete?.(user)
                        }}
                        className="rounded p-1 text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700"
                        aria-label="Usuń"
                        disabled={user.role === 'ADMIN'}
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
)

export default UserTable
