import { useState, useMemo } from 'react'
import { clsx } from 'clsx'

/**
 * Column definition for DataTable
 */
export interface Column<T> {
  key: keyof T | string
  header: string
  sortable?: boolean
  render?: (item: T, index: number) => React.ReactNode
  className?: string
  width?: string | number
}

/**
 * DataTable Props
 */
export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  isLoading?: boolean
  onRowClick?: (item: T) => void
  emptyMessage?: string
  className?: string
  sortable?: boolean
  defaultSortKey?: keyof T | string
  defaultSortOrder?: 'asc' | 'desc'
  onSortChange?: (key: string, order: 'asc' | 'desc') => void
  rowClassName?: (item: T) => string
  selectedRows?: T[]
  onSelectionChange?: (selectedRows: T[]) => void
  selectable?: boolean
  pagination?: {
    page: number
    size: number
    total: number
    onPageChange: (page: number) => void
    onSizeChange?: (size: number) => void
    sizeOptions?: number[]
  }
}

/**
 * DataTable Component
 *
 * A flexible data table with sorting, selection, and pagination
 *
 * @example
 * ```tsx
 * <DataTable
 *   data={users}
 *   columns={[
 *     { key: 'name', header: 'Name', sortable: true },
 *     { key: 'email', header: 'Email' },
 *     { key: 'role', header: 'Role', render: (item) => <Badge>{item.role}</Badge> }
 *   ]}
 *   onRowClick={(user) => navigate(`/users/${user.id}`)}
 *   pagination={{ page, size, total, onPageChange: setPage }}
 * />
 * ```
 */
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  onRowClick,
  emptyMessage = 'Brak danych',
  className,
  sortable = true,
  defaultSortKey,
  defaultSortOrder = 'asc',
  onSortChange,
  rowClassName,
  selectedRows = [],
  onSelectionChange,
  selectable = false,
  pagination,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | undefined>(defaultSortKey as string)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder)
  const [localSelectedRows, setLocalSelectedRows] = useState<T[]>([])

  const handleSort = (key: string) => {
    const newOrder = sortKey === key && sortOrder === 'asc' ? 'desc' : 'asc'
    setSortKey(key)
    setSortOrder(newOrder)
    onSortChange?.(key, newOrder)
  }

  const sortedData = useMemo(() => {
    if (!sortKey || !sortable) return data

    return [...data].sort((a, b) => {
      const aValue = a[sortKey]
      const bValue = b[sortKey]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [data, sortKey, sortOrder, sortable])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setLocalSelectedRows(sortedData)
      onSelectionChange?.(sortedData)
    } else {
      setLocalSelectedRows([])
      onSelectionChange?.([])
    }
  }

  const handleSelectRow = (item: T, checked: boolean) => {
    const newSelection = checked
      ? [...localSelectedRows, item]
      : localSelectedRows.filter((row) => row !== item)

    setLocalSelectedRows(newSelection)
    onSelectionChange?.(newSelection)
  }

  const isAllSelected = sortedData.length > 0 && localSelectedRows.length === sortedData.length
  const isSomeSelected = localSelectedRows.length > 0 && localSelectedRows.length < sortedData.length

  if (isLoading) {
    return (
      <div className={clsx('flex items-center justify-center py-12', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className={clsx('bg-white rounded-lg border border-neutral-200 overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isSomeSelected
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={clsx(
                    'px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider',
                    column.sortable && sortable && 'cursor-pointer hover:bg-neutral-100',
                    column.className
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && sortable && sortKey === column.key && (
                      <svg
                        className={clsx(
                          'w-4 h-4 text-neutral-400',
                          sortOrder === 'desc' && 'transform rotate-180'
                        )}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-6 py-12 text-center text-neutral-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((item, index) => (
                <tr
                  key={index}
                  className={clsx(
                    onRowClick && 'cursor-pointer hover:bg-neutral-50',
                    rowClassName?.(item),
                    selectedRows.includes(item) && 'bg-primary-50'
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {selectable && (
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={localSelectedRows.includes(item)}
                        onChange={(e) => handleSelectRow(item, e.target.checked)}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={clsx('px-6 py-4 whitespace-nowrap text-sm text-neutral-900', column.className)}
                    >
                      {column.render ? column.render(item, index) : String(item[column.key as keyof T] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-200 bg-white">
          <div className="flex items-center gap-4">
            <div className="text-sm text-neutral-700">
              Strona {pagination.page + 1} z {Math.ceil(pagination.total / pagination.size)} (
              {pagination.total} rekordów)
            </div>
            {pagination.onSizeChange && (
              <select
                value={pagination.size}
                onChange={(e) => pagination.onSizeChange?.(Number(e.target.value))}
                className="px-3 py-1.5 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {(pagination.sizeOptions || [10, 20, 50, 100]).map((size) => (
                  <option key={size} value={size}>
                    {size} na stronę
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 0}
              className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Poprzednia
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.size) - 1}
              className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Następna
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
