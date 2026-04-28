import React, { useState, useEffect } from 'react'
import { Modal, Button, Input, Select, Textarea, Checkbox } from '@shared/components'
import type { TherapyStage, TherapyStageFormData, UnlockMode } from '../types/stage.types'
import type { Quiz } from '@features/quizzes/types/quiz.types'

/**
 * StageFormModal component props
 */
export interface StageFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TherapyStageFormData) => void
  stage?: TherapyStage | null
  projectId: string
  quizzes?: Quiz[]
  isLoading?: boolean
}

/**
 * StageFormModal component for creating and editing therapy stages
 */
export const StageFormModal: React.FC<StageFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  stage,
  projectId,
  quizzes = [],
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<TherapyStageFormData>({
    name: '',
    description: '',
    project_id: projectId,
    unlock_mode: 'MANUAL',
    required_quiz_id: undefined,
    is_active: true,
  })

  // Populate form when editing
  useEffect(() => {
    if (stage) {
      setFormData({
        name: stage.name,
        description: stage.description || '',
        project_id: stage.project_id,
        unlock_mode: stage.unlock_mode,
        required_quiz_id: stage.required_quiz_id,
        is_active: stage.is_active,
      })
    } else {
      setFormData({
        name: '',
        description: '',
        project_id: projectId,
        unlock_mode: 'MANUAL',
        required_quiz_id: undefined,
        is_active: true,
      })
    }
  }, [stage, projectId, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const unlockModeOptions = [
    { value: 'MANUAL', label: 'Ręczne odblokowanie przez personel' },
    { value: 'AUTO_QUIZ', label: 'Automatyczne po zaliczeniu quizu' },
  ]

  const quizOptions = quizzes.map((q) => ({
    value: q.id,
    label: q.title,
  }))

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={stage ? 'Edytuj etap terapii' : 'Dodaj etap terapii'}
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-4">
          {/* Name */}
          <Input
            label="Nazwa etapu"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="np. Etap 1: Adaptacja"
            required
          />

          {/* Description */}
          <Textarea
            label="Opis"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Krótki opis celu tego etapu..."
            rows={3}
          />

          {/* Unlock Mode */}
          <Select
            label="Tryb odblokowywania"
            value={formData.unlock_mode}
            onChange={(e) =>
              setFormData({
                ...formData,
                unlock_mode: e.target.value as UnlockMode,
                required_quiz_id: undefined,
              })
            }
            options={unlockModeOptions}
            required
          />

          {/* Required Quiz (if AUTO_QUIZ) */}
          {formData.unlock_mode === 'AUTO_QUIZ' && (
            <Select
              label="Wymagany quiz"
              value={formData.required_quiz_id || ''}
              onChange={(e) =>
                setFormData({ ...formData, required_quiz_id: e.target.value || undefined })
              }
              options={quizOptions}
              placeholder="Wybierz quiz..."
              required
            />
          )}

          {/* Active */}
          <Checkbox
            label="Etap aktywny"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          />
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Anuluj
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Zapisywanie...' : 'Zapisz'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
