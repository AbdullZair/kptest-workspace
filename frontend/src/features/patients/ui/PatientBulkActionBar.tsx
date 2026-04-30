import { memo, useState } from 'react'
import { Button, Card } from '@shared/components'
import { useGetProjectsQuery } from '@features/projects'
import type { BulkOperationKey, BulkPatientRequest } from '../types'

/**
 * PatientBulkActionBar component props (US-K-05)
 */
export interface PatientBulkActionBarProps {
  selectedCount: number
  onSubmit: (operation: BulkOperationKey, body: BulkPatientRequest) => void | Promise<void>
  onClear: () => void
  selectedIds: string[]
  isLoading?: boolean
}

type ModalMode = 'assign' | 'status' | 'anonymize' | null

/**
 * Action bar that appears when patients are selected.
 * Exposes three bulk operations: assign-to-project, update-status, anonymize.
 */
export const PatientBulkActionBar = memo(
  ({
    selectedCount,
    onSubmit,
    onClear,
    selectedIds,
    isLoading = false,
  }: PatientBulkActionBarProps) => {
    const [mode, setMode] = useState<ModalMode>(null)
    const [projectId, setProjectId] = useState<string>('')
    const [newStatus, setNewStatus] =
      useState<'ACTIVE' | 'BLOCKED' | 'DEACTIVATED'>('ACTIVE')

    const { data: projects } = useGetProjectsQuery({}, { skip: mode !== 'assign' })

    const closeModal = () => {
      setMode(null)
      setProjectId('')
    }

    const handleConfirm = async () => {
      if (mode === 'assign') {
        if (!projectId) return
        await onSubmit('assign-to-project', {
          patient_ids: selectedIds,
          target_project_id: projectId,
        })
      } else if (mode === 'status') {
        await onSubmit('update-status', {
          patient_ids: selectedIds,
          new_status: newStatus,
        })
      } else if (mode === 'anonymize') {
        await onSubmit('anonymize', {
          patient_ids: selectedIds,
        })
      }
      closeModal()
    }

    if (selectedCount === 0) return null

    return (
      <>
        <Card variant="elevated" data-testid="patients-bulk-actionbar">
          <Card.Body>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-medium text-neutral-700">
                Zaznaczono <span className="font-semibold">{selectedCount}</span>{' '}
                {selectedCount === 1 ? 'pacjenta' : 'pacjentów'}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setMode('assign')}
                  disabled={isLoading}
                  data-testid="patients-bulk-assign-button"
                >
                  Przypisz do projektu
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMode('status')}
                  disabled={isLoading}
                  data-testid="patients-bulk-status-button"
                >
                  Zmień status
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setMode('anonymize')}
                  disabled={isLoading}
                  data-testid="patients-bulk-anonymize-button"
                >
                  Anonimizuj
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClear}
                  disabled={isLoading}
                  data-testid="patients-bulk-clear-button"
                >
                  Wyczyść
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        {mode !== null ? (
          <div
            className="fixed inset-0 z-50 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bulk-modal-title"
          >
            <div
              className="fixed inset-0 bg-black/50"
              onClick={closeModal}
              aria-hidden="true"
            />
            <div className="flex min-h-full items-center justify-center p-4">
              <Card
                variant="elevated"
                size="md"
                className="relative z-10 w-full max-w-md"
              >
                <Card.Body>
                  <h2
                    id="bulk-modal-title"
                    className="mb-4 text-lg font-semibold text-neutral-900"
                  >
                    {mode === 'assign' && 'Przypisz do projektu'}
                    {mode === 'status' && 'Zmień status'}
                    {mode === 'anonymize' && 'Anonimizuj pacjentów'}
                  </h2>

                  {mode === 'assign' ? (
                    <div className="space-y-3">
                      <p className="text-sm text-neutral-600">
                        Wybierz projekt docelowy dla {selectedCount} pacjentów.
                      </p>
                      <label className="block text-sm font-medium text-neutral-700">
                        Projekt
                        <select
                          value={projectId}
                          onChange={(e) => setProjectId(e.target.value)}
                          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          data-testid="patients-bulk-project-select"
                        >
                          <option value="">— wybierz —</option>
                          {(projects ?? []).map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  ) : null}

                  {mode === 'status' ? (
                    <div className="space-y-3">
                      <p className="text-sm text-neutral-600">
                        Ustaw nowy status dla {selectedCount} pacjentów.
                      </p>
                      <label className="block text-sm font-medium text-neutral-700">
                        Nowy status
                        <select
                          value={newStatus}
                          onChange={(e) =>
                            setNewStatus(
                              e.target.value as 'ACTIVE' | 'BLOCKED' | 'DEACTIVATED'
                            )
                          }
                          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          data-testid="patients-bulk-status-select"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="BLOCKED">BLOCKED</option>
                          <option value="DEACTIVATED">DEACTIVATED</option>
                        </select>
                      </label>
                    </div>
                  ) : null}

                  {mode === 'anonymize' ? (
                    <div className="space-y-3">
                      <p className="text-sm text-rose-700">
                        Czy na pewno chcesz zanonimizować {selectedCount}{' '}
                        {selectedCount === 1 ? 'pacjenta' : 'pacjentów'}? Operacja
                        nieodwracalna.
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-6 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={closeModal}
                      disabled={isLoading}
                    >
                      Anuluj
                    </Button>
                    <Button
                      variant={mode === 'anonymize' ? 'danger' : 'primary'}
                      size="sm"
                      onClick={handleConfirm}
                      disabled={
                        isLoading || (mode === 'assign' && !projectId)
                      }
                      data-testid="patients-bulk-confirm-button"
                    >
                      Potwierdź
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        ) : null}
      </>
    )
  }
)

export default PatientBulkActionBar
