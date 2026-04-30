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
  const isSomeSelected =
    localSelectedRows.length > 0 && localSelectedRows.length < sortedData.length

  if (isLoading) {
    return (
      <div className={clsx('flex items-center justify-center py-12', className)}>
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div
      className={clsx('overflow-hidden rounded-lg border border-neutral-200 bg-white', className)}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              {selectable ? (
                <th className="px-6 py-3 text-left">
                  <input
                    ref={(input) => {
                      if (input) input.indeterminate = isSomeSelected
                    }}
                    checked={isAllSelected}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    type="checkbox"
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
              ) : null}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={clsx(
                    'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500',
                    column.sortable && sortable && 'cursor-pointer hover:bg-neutral-100',
                    column.className
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && sortable && sortKey === column.key ? (
                      <svg
                        className={clsx(
                          'h-4 w-4 text-neutral-400',
                          sortOrder === 'desc' && 'rotate-180 transform'
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M5 15l7-7 7 7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    ) : null}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 bg-white">
            {sortedData.length === 0 ? (
              <tr>
                <td
                  className="px-6 py-12 text-center text-neutral-500"
                  colSpan={columns.length + (selectable ? 1 : 0)}
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
                  {selectable ? (
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        checked={localSelectedRows.includes(item)}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        type="checkbox"
                        onChange={(e) => handleSelectRow(item, e.target.checked)}
                      />
                    </td>
                  ) : null}
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={clsx(
                        'whitespace-nowrap px-6 py-4 text-sm text-neutral-900',
                        column.className
                      )}
                    >
                      {column.render ? column.render(item, index) : String(item[column.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination ? (
        <div className="flex items-center justify-between border-t border-neutral-200 bg-white px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="text-sm text-neutral-700">
              Strona {pagination.page + 1} z {Math.ceil(pagination.total / pagination.size)} (
              {pagination.total} rekordów)
            </div>
            {pagination.onSizeChange ? (
              <select
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={pagination.size}
                onChange={(e) => pagination.onSizeChange?.(Number(e.target.value))}
              >
                {(pagination.sizeOptions || [10, 20, 50, 100]).map((size) => (
                  <option key={size} value={size}>
                    {size} na stronę
                  </option>
                ))}
              </select>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={pagination.page === 0}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              Poprzednia
            </button>
            <button
              className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.size) - 1}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              Następna
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default DataTable
