import { memo } from 'react'
import type { PatientStats } from '../../types'
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
export const PatientStatsCard = memo(function PatientStatsCard({
  stats,
  className,
  onClick,
}: PatientStatsCardProps) {
  if (!stats) {
    return (
      <div className={clsx('bg-white rounded-lg shadow p-6', className)}>
        <p className="text-neutral-500">Brak danych pacjenta</p>
      </div>
    )
  }

  return (
    <div
      className={clsx('bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow', className)}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-neutral-900">{stats.patient_name}</h3>
          <p className="text-sm text-neutral-500 mt-1">PESEL: {stats.pesel}</p>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-primary-50 rounded-lg p-4">
          <p className="text-2xl font-bold text-primary-600">{stats.active_projects}</p>
          <p className="text-sm text-neutral-600 mt-1">Aktywne projekty</p>
        </div>
        <div className="bg-secondary-50 rounded-lg p-4">
          <p className="text-2xl font-bold text-secondary-600">{stats.total_sessions}</p>
          <p className="text-sm text-neutral-600 mt-1">Wszystkie sesje</p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-4">
          <p className="text-2xl font-bold text-emerald-600">{stats.attended_sessions}</p>
          <p className="text-sm text-neutral-600 mt-1">Odbyte sesje</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-4">
          <p className="text-2xl font-bold text-amber-600">{stats.materials_in_progress}</p>
          <p className="text-sm text-neutral-600 mt-1">Materiały w toku</p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="border border-neutral-200 rounded-lg p-3">
          <p className="text-sm text-neutral-500">Frekwencja</p>
          <p className="text-lg font-semibold text-neutral-900">{stats.session_attendance_rate.toFixed(1)}%</p>
        </div>
        <div className="border border-neutral-200 rounded-lg p-3">
          <p className="text-sm text-neutral-500">Ukończone materiały</p>
          <p className="text-lg font-semibold text-neutral-900">{stats.materials_completed}</p>
        </div>
        <div className="border border-neutral-200 rounded-lg p-3">
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
