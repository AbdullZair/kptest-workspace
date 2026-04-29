import { memo } from 'react'
import { Card, Button } from '@shared/components'
import { ProjectStatus } from './ProjectStatus'
import type { ProjectCardProps } from '../types'
import { clsx } from 'clsx'

/**
 * Format date for display
 */
const formatDate = (dateString?: string): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('pl-PL')
}

/**
 * ProjectCard Component
 *
 * Displays project information in a card format
 *
 * @example
 * ```tsx
 * <ProjectCard
 *   project={project}
 *   onProjectClick={handleClick}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 * ```
 */
export const ProjectCard = memo(
  ({ project, onProjectClick, onEdit, onDelete, className }: ProjectCardProps) => {
    const handleClick = () => {
      onProjectClick?.(project)
    }

    const handleEditClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      onEdit?.(project)
    }

    const handleDeleteClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      onDelete?.(project)
    }

    return (
      <Card
        variant="elevated"
        className={clsx('cursor-pointer transition-shadow hover:shadow-lg', className)}
        onClick={handleClick}
      >
        <Card.Body>
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-semibold text-neutral-900">{project.name}</h3>
              {project.description ? (
                <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{project.description}</p>
              ) : null}
            </div>
            <div className="ml-4 flex-shrink-0">
              <ProjectStatus status={project.status} size="sm" showLabel={true} />
            </div>
          </div>

          {/* Stats */}
          <div className="mb-4 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">
                {project.active_patient_count ?? 0}
              </p>
              <p className="mt-1 text-xs text-neutral-600">Pacjenci</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary-600">
                {project.team_member_count ?? 0}
              </p>
              <p className="mt-1 text-xs text-neutral-600">Zespół</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {project.average_compliance_score != null
                  ? `${Math.round(project.average_compliance_score)}%`
                  : '-'}
              </p>
              <p className="mt-1 text-xs text-neutral-600">Compliance</p>
            </div>
          </div>

          {/* Dates */}
          <div className="mb-4 flex items-center justify-between text-xs text-neutral-500">
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Start: {formatDate(project.start_date)}</span>
            </div>
            {project.end_date ? (
              <div className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>Koniec: {formatDate(project.end_date)}</span>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between border-t border-neutral-100 pt-4"
            data-testid={`project-card-${project.id}`}
          >
            <div className="text-xs text-neutral-500">
              {project.created_by_name ? <span>Utworzył: {project.created_by_name}</span> : null}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditClick}
                className="border-primary-200 text-primary-600 hover:bg-primary-50"
                data-testid="project-edit-button"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteClick}
                className="border-rose-200 text-rose-600 hover:bg-rose-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    )
  }
)

export default ProjectCard
