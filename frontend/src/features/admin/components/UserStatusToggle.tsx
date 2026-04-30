import { memo, useState } from 'react'
import type { AccountStatus } from '../types'

/**
 * UserStatusToggle component props
 */
export interface UserStatusToggleProps {
  status: AccountStatus
  userId: string
  onStatusChange?: (userId: string, newStatus: AccountStatus) => void
  disabled?: boolean
  className?: string
}

/**
 * Get status color
 */
const getStatusColor = (status: AccountStatus): string => {
  const colors: Record<AccountStatus, string> = {
    PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    ACTIVE: 'bg-green-100 text-green-800 border-green-200',
    BLOCKED: 'bg-red-100 text-red-800 border-red-200',
    REJECTED: 'bg-gray-100 text-gray-800 border-gray-200',
    DEACTIVATED: 'bg-gray-100 text-gray-800 border-gray-200',
  }
  return colors[status] || colors.ACTIVE
}

/**
 * Get status label in Polish
 */
const getStatusLabel = (status: AccountStatus): string => {
  const labels: Record<AccountStatus, string> = {
    PENDING_VERIFICATION: 'Oczekujący',
    ACTIVE: 'Aktywny',
    BLOCKED: 'Zablokowany',
    REJECTED: 'Odrzucony',
    DEACTIVATED: 'Dezaktywowany',
  }
  return labels[status] || status
}

/**
 * UserStatusToggle Component
 *
 * Displays a toggle for changing user status
 *
 * @example
 * ```tsx
 * <UserStatusToggle status="ACTIVE" userId="123" onStatusChange={handleStatusChange} />
 * ```
 */
export const UserStatusToggle = memo(
  ({ status, userId, onStatusChange, disabled = false, className = '' }: UserStatusToggleProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState<AccountStatus>(status)

    const statusOptions: AccountStatus[] = ['ACTIVE', 'BLOCKED', 'DEACTIVATED']

    const handleStatusSelect = (newStatus: AccountStatus) => {
      setSelectedStatus(newStatus)
      setIsOpen(false)
      onStatusChange?.(userId, newStatus)
    }

    const colorClass = getStatusColor(selectedStatus)

    return (
      <div className={`relative inline-block text-left ${className}`}>
        <button
          className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium ${colorClass} transition-opacity hover:opacity-80 disabled:opacity-50`}
          disabled={disabled}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          {getStatusLabel(selectedStatus)}
          <svg
            className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
        </button>

        {isOpen ? (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 z-20 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="py-1" role="menu">
                {statusOptions.map((option) => (
                  <button
                    key={option}
                    className={`block w-full px-4 py-2 text-left text-sm ${
                      selectedStatus === option
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    role="menuitem"
                    onClick={() => handleStatusSelect(option)}
                  >
                    {getStatusLabel(option)}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    )
  }
)

export default UserStatusToggle
