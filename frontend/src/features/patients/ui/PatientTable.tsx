import { memo } from 'react'
import { VerificationStatus } from './VerificationStatus'
import type { Patient } from '../types'
import { clsx } from 'clsx'

/**
 * PatientTable column definition
 */
export type SortField = 'name' | 'pesel' | 'created_at' | 'verification_status'

/**
 * Sort order
 */
export type SortOrder = 'asc' | 'desc'

/**
 * PatientTable component props
 */
export interface PatientTableProps {
  patients: Patient[]
  onPatientClick?: (patient: Patient) => void
  onEdit?: (patient: Patient) => void
  onDelete?: (patient: Patient) => void
  sortField?: SortField
  sortOrder?: SortOrder
  onSortChange?: (field: SortField, order: SortOrder) => void
  isLoading?: boolean
  className?: string
  /** Selected patient IDs for bulk operations (US-K-05). */
  selectedIds?: string[]
  /** Toggle a single row selection. */
  onToggleSelect?: (patientId: string) => void
  /** Toggle select-all on the current page. */
  onToggleSelectAll?: () => void
  /** Whether selection UI should be rendered. */
  selectable?: boolean
}

/**
 * Format date for display
 */
const formatDate = (dateString?: string): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('pl-PL')
}

/**
 * Get gender label
 */
const getGenderLabel = (gender?: string): string => {
  if (!gender) return '-'
  const labels: Record<string, string> = {
    MALE: 'M',
    FEMALE: 'K',
    OTHER: 'I',
    UNKNOWN: 'N',
  }
  return labels[gender] || '-'
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
        clipRule="evenodd"
        d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
        fillRule="evenodd"
      />
    </svg>
    <svg
      className={clsx('-mt-1 h-3 w-3', order === 'desc' && 'text-primary-600')}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        clipRule="evenodd"
        d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
        fillRule="evenodd"
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
      aria-sort={isActive ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}
      className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600 transition-colors hover:bg-neutral-50"
      role="columnheader"
      onClick={handleClick}
    >
      <span className="flex items-center">
        {children}
        <SortIcon active={isActive} order={isActive && order ? order : 'asc'} />
      </span>
    </th>
  )
}

/**
 * PatientTable Component
 *
 * Displays patients in a sortable table format
 *
 * @example
 * ```tsx
 * <PatientTable
 *   patients={patients}
 *   sortField="name"
 *   sortOrder="asc"
 *   onSortChange={handleSort}
 *   onPatientClick={handleClick}
 * />
 * ```
 */
export const PatientTable = memo(
  ({
    patients,
    onPatientClick,
    onEdit,
    onDelete,
    sortField,
    sortOrder,
    onSortChange,
    isLoading = false,
    className,
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    selectable = false,
  }: PatientTableProps) => {
    const handleSort = (field: SortField, order: SortOrder) => {
      onSortChange?.(field, order)
    }
    const selectedSet = new Set(selectedIds ?? [])
    const allSelected =
      selectable && patients.length > 0 && patients.every((p) => selectedSet.has(p.id))
    const someSelected = selectable && !allSelected && patients.some((p) => selectedSet.has(p.id))

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

    if (patients.length === 0) {
      return (
        <div className={baseStyles}>
          <div className="py-12 text-center">
            <svg
              className="mx-auto mb-4 h-16 w-16 text-neutral-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
              />
            </svg>
            <p className="text-neutral-500">Brak pacjentów do wyświetlenia</p>
          </div>
        </div>
      )
    }

    return (
      <div className={baseStyles}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200" data-testid="patients-table">
            <thead className="bg-neutral-50">
              <tr>
                {selectable ? (
                  <th className="w-10 px-4 py-3 text-left" scope="col">
                    <input
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected
                      }}
                      aria-label="Zaznacz wszystkich"
                      checked={allSelected}
                      className="h-4 w-4 cursor-pointer rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      data-testid="patients-bulk-select-all"
                      type="checkbox"
                      onChange={() => onToggleSelectAll?.()}
                    />
                  </th>
                ) : null}
                <SortableHeader
                  currentField={sortField}
                  field="name"
                  order={sortOrder}
                  onSort={handleSort}
                >
                  Imię i nazwisko
                </SortableHeader>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  PESEL
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600 sm:table-cell">
                  Data ur.
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600 md:table-cell">
                  Płeć
                </th>
                <SortableHeader
                  currentField={sortField}
                  field="verification_status"
                  order={sortOrder}
                  onSort={handleSort}
                >
                  Status
                </SortableHeader>
                <SortableHeader
                  currentField={sortField}
                  field="created_at"
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
              {patients.map((patient) => (
                <tr
                  key={patient.id}
                  className="cursor-pointer transition-colors hover:bg-neutral-50"
                  onClick={() => onPatientClick?.(patient)}
                >
                  {selectable ? (
                    <td
                      className="w-10 whitespace-nowrap px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        aria-label={`Zaznacz pacjenta ${patient.first_name} ${patient.last_name}`}
                        checked={selectedSet.has(patient.id)}
                        className="h-4 w-4 cursor-pointer rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        data-testid={`patients-bulk-select-${patient.id}`}
                        type="checkbox"
                        onChange={() => onToggleSelect?.(patient.id)}
                      />
                    </td>
                  ) : null}
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="text-sm font-medium text-neutral-900">
                      {patient.first_name} {patient.last_name}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <code className="rounded bg-neutral-100 px-2 py-0.5 text-sm text-neutral-600">
                      {patient.pesel}
                    </code>
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-neutral-600 sm:table-cell">
                    {formatDate(patient.date_of_birth)}
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-neutral-600 md:table-cell">
                    {getGenderLabel(patient.gender)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <VerificationStatus
                      showLabel={false}
                      size="sm"
                      status={patient.verification_status}
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-600">
                    {formatDate(patient.created_at)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        aria-label="Edytuj"
                        className="rounded p-1 text-primary-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit?.(patient)
                        }}
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                      </button>
                      <button
                        aria-label="Usuń"
                        className="rounded p-1 text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete?.(patient)
                        }}
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
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

export default PatientTable
