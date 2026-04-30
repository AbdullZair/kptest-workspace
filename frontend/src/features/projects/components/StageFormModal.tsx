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
      size="lg"
      title={stage ? 'Edytuj etap terapii' : 'Dodaj etap terapii'}
      onClose={onClose}
    >
      <form className="p-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Name */}
          <Input
            required
            label="Nazwa etapu"
            placeholder="np. Etap 1: Adaptacja"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          {/* Description */}
          <Textarea
            label="Opis"
            placeholder="Krótki opis celu tego etapu..."
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          {/* Unlock Mode */}
          <Select
            required
            label="Tryb odblokowywania"
            options={unlockModeOptions}
            value={formData.unlock_mode}
            onChange={(e) =>
              setFormData({
                ...formData,
                unlock_mode: e.target.value as UnlockMode,
                required_quiz_id: undefined,
              })
            }
          />

          {/* Required Quiz (if AUTO_QUIZ) */}
          {formData.unlock_mode === 'AUTO_QUIZ' && (
            <Select
              required
              label="Wymagany quiz"
              options={quizOptions}
              placeholder="Wybierz quiz..."
              value={formData.required_quiz_id || ''}
              onChange={(e) =>
                setFormData({ ...formData, required_quiz_id: e.target.value || undefined })
              }
            />
          )}

          {/* Active */}
          <Checkbox
            checked={formData.is_active}
            label="Etap aktywny"
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          />
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Anuluj
          </Button>
          <Button disabled={isLoading} type="submit" variant="primary">
            {isLoading ? 'Zapisywanie...' : 'Zapisz'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
