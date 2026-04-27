import React, { useState, useCallback } from 'react'
import { Card, Button, Alert } from '@shared/components'
import type { TherapyStage } from '../../types/stage.types'

/**
 * StageList component props
 */
export interface StageListProps {
  stages: TherapyStage[]
  projectId: string
  onReorder?: (stageIds: string[]) => void
  onEdit?: (stage: TherapyStage) => void
  onDelete?: (stage: TherapyStage) => void
  isStaff?: boolean
}

/**
 * StageList component with drag & drop reordering
 */
export const StageList: React.FC<StageListProps> = ({
  stages,
  projectId,
  onReorder,
  onEdit,
  onDelete,
  isStaff = false,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault()
      if (draggedIndex === null || draggedIndex === dropIndex) {
        setDraggedIndex(null)
        setDragOverIndex(null)
        return
      }

      const newStages = [...stages]
      const [draggedStage] = newStages.splice(draggedIndex, 1)
      newStages.splice(dropIndex, 0, draggedStage)

      const stageIds = newStages.map((s) => s.id)
      onReorder?.(stageIds)

      setDraggedIndex(null)
      setDragOverIndex(null)
    },
    [draggedIndex, stages, onReorder]
  )

  const getUnlockModeLabel = (mode: string): string => {
    const labels: Record<string, string> = {
      MANUAL: 'Ręczne odblokowanie',
      AUTO_QUIZ: 'Automatyczne po quizie',
    }
    return labels[mode] || mode
  }

  if (stages.length === 0) {
    return (
      <Alert variant="info" title="Brak etapów">
        Nie ma jeszcze żadnych etapów terapii dla tego projektu.
      </Alert>
    )
  }

  return (
    <div className="space-y-3">
      {stages.map((stage, index) => {
        const isDragging = draggedIndex === index
        const isDragOver = dragOverIndex === index
        const canDrag = isStaff && onReorder

        return (
          <div
            key={stage.id}
            draggable={canDrag}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            className={`
              relative transition-all duration-200
              ${isDragging ? 'opacity-50 scale-95' : ''}
              ${isDragOver ? 'border-2 border-blue-500' : ''}
              ${canDrag ? 'cursor-grab active:cursor-grabbing' : ''}
            `}
          >
            <Card className="p-4">
              <div className="flex items-center gap-4">
                {/* Drag Handle */}
                {canDrag && (
                  <div className="flex-shrink-0 text-gray-400 cursor-grab">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8h16M4 16h16"
                      />
                    </svg>
                  </div>
                )}

                {/* Order Index */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-semibold">
                  {index + 1}
                </div>

                {/* Stage Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {stage.name}
                    </h3>
                    {!stage.is_active && (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        Nieaktywny
                      </span>
                    )}
                  </div>
                  {stage.description && (
                    <p className="text-sm text-gray-600 truncate">
                      {stage.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{getUnlockModeLabel(stage.unlock_mode)}</span>
                    {stage.unlock_mode === 'AUTO_QUIZ' && stage.required_quiz_title && (
                      <span className="text-blue-600">
                        Quiz: {stage.required_quiz_title}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {isStaff && (
                  <div className="flex-shrink-0 flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onEdit?.(stage)}
                    >
                      Edytuj
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDelete?.(stage)}
                    >
                      Usuń
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )
      })}
    </div>
  )
}
