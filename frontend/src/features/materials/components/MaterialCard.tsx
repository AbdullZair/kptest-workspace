import { memo } from 'react'
import { Card, Button } from '@shared/components'
import { MaterialTypeIcon } from './MaterialTypeIcon'
import { DifficultyBadge } from './DifficultyBadge'
import type { EducationalMaterial } from '../types/material.types'

/**
 * MaterialCard component props
 */
export interface MaterialCardProps {
  material: EducationalMaterial
  onClick?: (material: EducationalMaterial) => void
  onEdit?: (material: EducationalMaterial) => void
  onDelete?: (material: EducationalMaterial) => void
  onPublish?: (material: EducationalMaterial) => void
  compact?: boolean
  showStats?: boolean
  isStaff?: boolean
}

/**
 * Format date for display
 */
const formatDate = (dateString?: string): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('pl-PL')
}

/**
 * Format view count
 */
const formatViewCount = (count: number): string => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K'
  }
  return count.toString()
}

/**
 * Get difficulty label
 */
const getDifficultyLabel = (difficulty: string): string => {
  const labels: Record<string, string> = {
    BASIC: 'Podstawowy',
    INTERMEDIATE: 'Średniozaawansowany',
    ADVANCED: 'Zaawansowany',
  }
  return labels[difficulty] || difficulty
}

/**
 * MaterialCard Component
 *
 * Displays educational material information in a card format
 *
 * @example
 * ```tsx
 * <MaterialCard
 *   material={material}
 *   onClick={handleClick}
 *   onEdit={handleEdit}
 * />
 * ```
 */
export const MaterialCard = memo(function MaterialCard({
  material,
  onClick,
  onEdit,
  onDelete,
  onPublish,
  compact = false,
  showStats = false,
  isStaff = false,
}: MaterialCardProps) {
  const handleClick = () => {
    onClick?.(material)
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(material)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(material)
  }

  const handlePublishClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onPublish?.(material)
  }

  return (
    <Card
      variant="interactive"
      onClick={handleClick}
      size={compact ? 'sm' : 'md'}
      className="cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Material info */}
        <div className="flex-1 min-w-0">
          {/* Title and type */}
          <div className="flex items-center gap-3 mb-2">
            <MaterialTypeIcon type={material.type} size="sm" showLabel />
            <h3 className="text-lg font-semibold text-neutral-900 truncate">{material.title}</h3>
          </div>

          {/* Category and difficulty */}
          <div className="flex items-center gap-3 mb-3">
            {material.category && (
              <span className="text-sm text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                {material.category}
              </span>
            )}
            <DifficultyBadge level={material.difficulty} size="sm" />
            {!material.published && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-medium">
                Nieopublikowany
              </span>
            )}
          </div>

          {/* Content preview (for articles) */}
          {!compact && material.type === 'ARTICLE' && material.content && (
            <div
              className="text-sm text-neutral-600 line-clamp-2 mb-3"
              dangerouslySetInnerHTML={{ __html: stripHtml(material.content) }}
            />
          )}

          {/* Stats */}
          {showStats && (
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-neutral-500">Wyświetlenia:</span>
                <span className="ml-2 text-neutral-900 font-medium">{formatViewCount(material.view_count)}</span>
              </div>
              <div>
                <span className="text-neutral-500">Ukończenia:</span>
                <span className="ml-2 text-neutral-900 font-medium">{formatViewCount(material.completion_count)}</span>
              </div>
              <div>
                <span className="text-neutral-500">Opublikowano:</span>
                <span className="ml-2 text-neutral-900">{formatDate(material.published_at)}</span>
              </div>
            </div>
          )}

          {/* Metadata */}
          {!showStats && !compact && (
            <div className="text-xs text-neutral-500">
              <span>Dodano: {formatDate(material.created_at)}</span>
              {material.published_at && (
                <span className="ml-3">• Opublikowano: {formatDate(material.published_at)}</span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {isStaff && (
          <div className="flex flex-col gap-2 flex-shrink-0">
            {!material.published && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePublishClick}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                aria-label="Opublikuj materiał"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              aria-label="Edytuj materiał"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              aria-label="Usuń materiał"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
})

/**
 * Strip HTML tags from string
 */
const stripHtml = (html: string): string => {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export default MaterialCard
