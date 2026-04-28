import { memo } from 'react'
import type { PatientStats } from '../types'
import { clsx } from 'clsx'

export interface PatientStatsCardProps {
  /**
   * Patient statistics data
   */
  stats?: PatientStats
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Click handler
   */
  onClick?: () => void
}

/**
 * PatientStatsCard Component
 *
 * Displays patient statistics in a card format
 */
export const PatientStatsCard = memo(({ stats, className, onClick }: PatientStatsCardProps) => {
  if (!stats) {
    return (
      <div className={clsx('rounded-lg bg-white p-6 shadow', className)}>
        <p className="text-neutral-500">Brak danych pacjenta</p>
      </div>
    )
  }

  return (
    <div
      className={clsx(
        'cursor-pointer rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg',
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold text-neutral-900">{stats.patient_name}</h3>
          <p className="mt-1 text-sm text-neutral-500">PESEL: {stats.pesel}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-neutral-500">Compliance</p>
          <p
            className={clsx(
              'text-2xl font-bold',
              stats.overall_compliance >= 80
                ? 'text-emerald-600'
                : stats.overall_compliance >= 50
                  ? 'text-amber-600'
                  : 'text-red-600'
            )}
          >
            {stats.overall_compliance.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-primary-50 p-4">
          <p className="text-2xl font-bold text-primary-600">{stats.active_projects}</p>
          <p className="mt-1 text-sm text-neutral-600">Aktywne projekty</p>
        </div>
        <div className="rounded-lg bg-secondary-50 p-4">
          <p className="text-2xl font-bold text-secondary-600">{stats.total_sessions}</p>
          <p className="mt-1 text-sm text-neutral-600">Wszystkie sesje</p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-4">
          <p className="text-2xl font-bold text-emerald-600">{stats.attended_sessions}</p>
          <p className="mt-1 text-sm text-neutral-600">Odbyte sesje</p>
        </div>
        <div className="rounded-lg bg-amber-50 p-4">
          <p className="text-2xl font-bold text-amber-600">{stats.materials_in_progress}</p>
          <p className="mt-1 text-sm text-neutral-600">Materiały w toku</p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 p-3">
          <p className="text-sm text-neutral-500">Frekwencja</p>
          <p className="text-lg font-semibold text-neutral-900">
            {stats.session_attendance_rate.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-3">
          <p className="text-sm text-neutral-500">Ukończone materiały</p>
          <p className="text-lg font-semibold text-neutral-900">{stats.materials_completed}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-3">
          <p className="text-sm text-neutral-500">Wiadomości</p>
          <p className="text-lg font-semibold text-neutral-900">
            {stats.messages_sent} wysłane / {stats.messages_received} otrzymane
          </p>
        </div>
      </div>
    </div>
  )
})

export default PatientStatsCard
