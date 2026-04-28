import { memo } from 'react'
import type { ProjectStats } from '../types'
import { clsx } from 'clsx'

export interface ProjectStatsCardProps {
  /**
   * Project statistics data
   */
  stats?: ProjectStats
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
 * ProjectStatsCard Component
 *
 * Displays project statistics in a card format
 */
export const ProjectStatsCard = memo(({ stats, className, onClick }: ProjectStatsCardProps) => {
  if (!stats) {
    return (
      <div className={clsx('rounded-lg bg-white p-6 shadow', className)}>
        <p className="text-neutral-500">Brak danych projektu</p>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    PLANNED: 'bg-blue-100 text-blue-800',
    ACTIVE: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    ARCHIVED: 'bg-neutral-100 text-neutral-800',
    CANCELLED: 'bg-red-100 text-red-800',
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
          <h3 className="text-xl font-semibold text-neutral-900">{stats.project_name}</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Start: {new Date(stats.start_date).toLocaleDateString('pl-PL')}
          </p>
        </div>
        <span
          className={clsx(
            'rounded-full px-3 py-1 text-sm font-medium',
            statusColors[stats.status] || 'bg-gray-100 text-gray-800'
          )}
        >
          {stats.status}
        </span>
      </div>

      {/* Main Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-primary-50 p-4">
          <p className="text-2xl font-bold text-primary-600">{stats.active_patients}</p>
          <p className="mt-1 text-sm text-neutral-600">Aktywni pacjenci</p>
        </div>
        <div className="rounded-lg bg-secondary-50 p-4">
          <p className="text-2xl font-bold text-secondary-600">{stats.team_size}</p>
          <p className="mt-1 text-sm text-neutral-600">Zespół</p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-4">
          <p className="text-2xl font-bold text-emerald-600">
            {stats.average_compliance.toFixed(1)}%
          </p>
          <p className="mt-1 text-sm text-neutral-600">Średni compliance</p>
        </div>
        <div className="rounded-lg bg-amber-50 p-4">
          <p className="text-2xl font-bold text-amber-600">{stats.completed_patients}</p>
          <p className="mt-1 text-sm text-neutral-600">Ukończone</p>
        </div>
      </div>

      {/* Compliance Indicator */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-neutral-600">Compliance</span>
          <span
            className={clsx(
              'text-sm font-semibold',
              stats.is_compliant ? 'text-emerald-600' : 'text-red-600'
            )}
          >
            {stats.is_compliant ? 'Zgodny' : 'Niezgodny'} ({stats.average_compliance.toFixed(1)}% /{' '}
            {stats.compliance_threshold}%)
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-neutral-200">
          <div
            className={clsx(
              'h-2 rounded-full transition-all',
              stats.is_compliant ? 'bg-emerald-500' : 'bg-red-500'
            )}
            style={{ width: `${Math.min(stats.average_compliance, 100)}%` }}
          />
        </div>
      </div>

      {/* Stage Distribution */}
      {stats.stage_distribution && Object.keys(stats.stage_distribution).length > 0 ? (
        <div>
          <h4 className="mb-2 text-sm font-medium text-neutral-700">Etapy terapii</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.stage_distribution).map(([stage, count]) => (
              <span
                key={stage}
                className="rounded bg-neutral-100 px-2 py-1 text-sm text-neutral-700"
              >
                {stage}: {count}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
})

export default ProjectStatsCard
