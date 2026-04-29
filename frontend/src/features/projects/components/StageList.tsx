import React, { useState, useCallback } from 'react'
import { Card, Button, Alert } from '@shared/components'
import type { TherapyStage } from '../types/stage.types'

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
  projectId: _projectId,
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
      if (!draggedStage) return
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
        const canDrag = Boolean(isStaff && onReorder)

        return (
          <div
            key={stage.id}
            draggable={canDrag}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            className={`relative transition-all duration-200 ${isDragging ? 'scale-95 opacity-50' : ''} ${isDragOver ? 'border-2 border-blue-500' : ''} ${canDrag ? 'cursor-grab active:cursor-grabbing' : ''} `}
          >
            <Card className="p-4">
              <div className="flex items-center gap-4">
                {/* Drag Handle */}
                {canDrag ? (
                  <div className="flex-shrink-0 cursor-grab text-gray-400">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8h16M4 16h16"
                      />
                    </svg>
                  </div>
                ) : null}

                {/* Order Index */}
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-800">
                  {index + 1}
                </div>

                {/* Stage Info */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="truncate text-lg font-semibold text-gray-900">{stage.name}</h3>
                    {!stage.is_active && (
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                        Nieaktywny
                      </span>
                    )}
                  </div>
                  {stage.description ? (
                    <p className="truncate text-sm text-gray-600">{stage.description}</p>
                  ) : null}
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                    <span>{getUnlockModeLabel(stage.unlock_mode)}</span>
                    {stage.unlock_mode === 'AUTO_QUIZ' && stage.required_quiz_title ? (
                      <span className="text-blue-600">Quiz: {stage.required_quiz_title}</span>
                    ) : null}
                  </div>
                </div>

                {/* Actions */}
                {isStaff ? (
                  <div className="flex flex-shrink-0 gap-2">
                    <Button variant="secondary" size="sm" onClick={() => onEdit?.(stage)}>
                      Edytuj
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => onDelete?.(stage)}>
                      Usuń
                    </Button>
                  </div>
                ) : null}
              </div>
            </Card>
          </div>
        )
      })}
    </div>
  )
}
