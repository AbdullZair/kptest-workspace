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
    const [newStatus, setNewStatus] = useState<'ACTIVE' | 'BLOCKED' | 'DEACTIVATED'>('ACTIVE')

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
        <Card data-testid="patients-bulk-actionbar" variant="elevated">
          <Card.Body>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-medium text-neutral-700">
                Zaznaczono <span className="font-semibold">{selectedCount}</span>{' '}
                {selectedCount === 1 ? 'pacjenta' : 'pacjentów'}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  data-testid="patients-bulk-assign-button"
                  disabled={isLoading}
                  size="sm"
                  variant="primary"
                  onClick={() => setMode('assign')}
                >
                  Przypisz do projektu
                </Button>
                <Button
                  data-testid="patients-bulk-status-button"
                  disabled={isLoading}
                  size="sm"
                  variant="outline"
                  onClick={() => setMode('status')}
                >
                  Zmień status
                </Button>
                <Button
                  data-testid="patients-bulk-anonymize-button"
                  disabled={isLoading}
                  size="sm"
                  variant="danger"
                  onClick={() => setMode('anonymize')}
                >
                  Anonimizuj
                </Button>
                <Button
                  data-testid="patients-bulk-clear-button"
                  disabled={isLoading}
                  size="sm"
                  variant="ghost"
                  onClick={onClear}
                >
                  Wyczyść
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        {mode !== null ? (
          <div
            aria-labelledby="bulk-modal-title"
            aria-modal="true"
            className="fixed inset-0 z-50 overflow-y-auto"
            role="dialog"
          >
            <div aria-hidden="true" className="fixed inset-0 bg-black/50" onClick={closeModal} />
            <div className="flex min-h-full items-center justify-center p-4">
              <Card className="relative z-10 w-full max-w-md" size="md" variant="elevated">
                <Card.Body>
                  <h2 className="mb-4 text-lg font-semibold text-neutral-900" id="bulk-modal-title">
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
                          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          data-testid="patients-bulk-project-select"
                          value={projectId}
                          onChange={(e) => setProjectId(e.target.value)}
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
                          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          data-testid="patients-bulk-status-select"
                          value={newStatus}
                          onChange={(e) =>
                            setNewStatus(e.target.value as 'ACTIVE' | 'BLOCKED' | 'DEACTIVATED')
                          }
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
                        {selectedCount === 1 ? 'pacjenta' : 'pacjentów'}? Operacja nieodwracalna.
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-6 flex justify-end gap-2">
                    <Button disabled={isLoading} size="sm" variant="outline" onClick={closeModal}>
                      Anuluj
                    </Button>
                    <Button
                      data-testid="patients-bulk-confirm-button"
                      disabled={isLoading || (mode === 'assign' && !projectId)}
                      size="sm"
                      variant={mode === 'anonymize' ? 'danger' : 'primary'}
                      onClick={handleConfirm}
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
