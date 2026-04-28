import { memo } from 'react'
import type { AuditLog } from '../types'
import { clsx } from 'clsx'

/**
 * AuditLogTable column definition
 */
export type SortField = 'action' | 'entity_type' | 'user_id' | 'created_at'

/**
 * Sort order
 */
export type SortOrder = 'asc' | 'desc'

/**
 * AuditLogTable component props
 */
export interface AuditLogTableProps {
  logs: AuditLog[]
  onLogClick?: (log: AuditLog) => void
  onViewDetails?: (log: AuditLog) => void
  sortField?: SortField
  sortOrder?: SortOrder
  onSortChange?: (field: SortField, order: SortOrder) => void
  isLoading?: boolean
  className?: string
}

/**
 * Format date for display
 */
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/**
 * Get action color
 */
const getActionColor = (action: AuditLog['action']): string => {
  const colors: Record<AuditLog['action'], string> = {
    CREATE: 'bg-green-100 text-green-800',
    UPDATE: 'bg-blue-100 text-blue-800',
    DELETE: 'bg-red-100 text-red-800',
    VIEW: 'bg-gray-100 text-gray-800',
    LOGIN: 'bg-purple-100 text-purple-800',
    LOGOUT: 'bg-yellow-100 text-yellow-800',
  }
  return colors[action] || colors.VIEW
}

/**
 * Get action label in Polish
 */
const getActionLabel = (action: AuditLog['action']): string => {
  const labels: Record<AuditLog['action'], string> = {
    CREATE: 'Utworzono',
    UPDATE: 'Zaktualizowano',
    DELETE: 'Usunięto',
    VIEW: 'Wyświetlono',
    LOGIN: 'Logowanie',
    LOGOUT: 'Wylogowanie',
  }
  return labels[action] || action
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
        <SortIcon order={isActive ? order : 'asc'} active={isActive} />
      </span>
    </th>
  )
}

/**
 * AuditLogTable Component
 *
 * Displays audit logs in a sortable table format
 *
 * @example
 * ```tsx
 * <AuditLogTable
 *   logs={logs}
 *   sortField="created_at"
 *   sortOrder="desc"
 *   onLogClick={handleClick}
 * />
 * ```
 */
export const AuditLogTable = memo(
  ({
    logs,
    onLogClick,
    onViewDetails,
    sortField,
    sortOrder,
    onSortChange,
    isLoading = false,
    className,
  }: AuditLogTableProps) => {
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

    if (logs.length === 0) {
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-neutral-500">Brak logów audytu do wyświetlenia</p>
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
                  field="action"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={handleSort}
                >
                  Akcja
                </SortableHeader>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  Typ encji
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  ID encji
                </th>
                <SortableHeader
                  field="user_id"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={handleSort}
                >
                  ID użytkownika
                </SortableHeader>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  IP
                </th>
                <SortableHeader
                  field="created_at"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={handleSort}
                >
                  Data i czas
                </SortableHeader>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {logs.map((log) => (
                <tr
                  key={log.log_id}
                  className="cursor-pointer transition-colors hover:bg-neutral-50"
                  onClick={() => onLogClick?.(log)}
                >
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={clsx(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        getActionColor(log.action)
                      )}
                    >
                      {getActionLabel(log.action)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <code className="rounded bg-neutral-100 px-2 py-0.5 text-sm text-neutral-600">
                      {log.entity_type}
                    </code>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <code className="rounded bg-neutral-100 px-2 py-0.5 text-sm text-neutral-600">
                      {log.entity_id ? `${log.entity_id.substring(0, 8)}...` : '-'}
                    </code>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <code className="rounded bg-neutral-100 px-2 py-0.5 text-sm text-neutral-600">
                      {`${log.user_id.substring(0, 8)}...`}
                    </code>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-600">
                    {log.ip_address || '-'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-600">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onViewDetails?.(log)
                      }}
                      className="text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                      Szczegóły
                    </button>
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

export default AuditLogTable
