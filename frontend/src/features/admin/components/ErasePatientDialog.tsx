import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog } from '@headlessui/react'
import { useErasePatientMutation } from '../api/adminApi'
import { erasePatientSchema, type ErasePatientFormData } from '../lib/schemas'
import { Button } from '@shared/components'
import { isWithin30Days } from '@shared/lib/date'
import type { ApiError } from '@shared/api'

export interface ErasePatientDialogProps {
  isOpen: boolean
  onClose: () => void
  patientId: string
  patientName: string
  deletedAt?: string
  onSuccess?: () => void
}

/**
 * ErasePatientDialog Component
 *
 * Two-step confirmation dialog for permanently erasing patient data
 * Implements US-A-12 (prawo do bycia zapomnianym - RODO Art. 17)
 *
 * Features:
 * - 30-day cooling period check (disabled if deletedAt < 30 days ago)
 * - Two-step confirmation
 * - Reason requirement
 */
export const ErasePatientDialog: React.FC<ErasePatientDialogProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  deletedAt,
  onSuccess,
}) => {
  const [erasePatient, { isLoading, error }] = useErasePatientMutation()
  const [step, setStep] = useState<1 | 2>(1)

  // Check if patient is within 30-day cooling period
  const isWithinCoolingPeriod = deletedAt ? !isWithin30Days(deletedAt) : false
  const canErase = !isWithinCoolingPeriod

  const errorMessage = error ? (error as ApiError)?.message || String(error) : null

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ErasePatientFormData>({
    resolver: zodResolver(erasePatientSchema),
    defaultValues: {
      reason: '',
      confirm: undefined as unknown as true,
      force: undefined,
    },
  })

  const confirmValue = watch('confirm')

  const handleFirstStep = (): void => {
    setStep(2)
  }

  const handleFormSubmit = async (data: ErasePatientFormData): Promise<void> => {
    try {
      await erasePatient({
        patientId,
        body: {
          reason: data.reason,
          confirm: data.confirm,
          force: data.force,
        },
      }).unwrap()

      reset()
      setStep(1)
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Failed to erase patient:', err)
    }
  }

  const handleClose = (): void => {
    reset()
    setStep(1)
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      {/* Dialog container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg rounded-lg bg-white shadow-xl">
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            {/* Header */}
            <div className="border-b border-neutral-200 px-6 py-4">
              <Dialog.Title className="text-lg font-semibold text-neutral-900">
                Trwałe usunięcie danych pacjenta
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-neutral-500">
                Pacjent: <span className="font-medium text-neutral-700">{patientName}</span>
              </Dialog.Description>
            </div>

            {/* Body */}
            <div className="space-y-4 px-6 py-4">
              {/* Warning */}
              <div className="rounded-md border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-800">
                  <strong>Ostrzeżenie:</strong> Ta operacja jest nieodwracalna. Wszystkie dane
                  pacjenta zostaną trwale usunięte z systemu.
                </p>
              </div>

              {/* Cooling period warning */}
              {!canErase && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Okres karencji:</strong> Od usunięcia pacjenta nie minęło 30 dni.
                    Operacja trwałego usunięcia jest zablokowana.
                  </p>
                  {deletedAt ? (
                    <p className="mt-1 text-xs text-amber-600">
                      Data usunięcia: {new Date(deletedAt).toLocaleDateString('pl-PL')}
                    </p>
                  ) : null}
                </div>
              )}

              {/* Error display */}
              {errorMessage ? (
                <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  Błąd: {errorMessage}
                </div>
              ) : null}

              {step === 1 ? (
                /* Step 1: Initial warning and confirm button */
                <div className="space-y-4">
                  <div className="text-sm text-neutral-600">
                    <p className="mb-2 font-medium">Czy na pewno chcesz kontynuować?</p>
                    <ul className="list-inside list-disc space-y-1">
                      <li>Wszystkie dane osobowe zostaną usunięte</li>
                      <li>Historia wiadomości zostanie anonimizowana</li>
                      <li>Rekordy audit logs zostaną zachowane (wymóg prawny)</li>
                    </ul>
                  </div>
                </div>
              ) : (
                /* Step 2: Reason and final confirmation */
                <div className="space-y-4">
                  {/* Reason input */}
                  <div>
                    <label
                      htmlFor="reason"
                      className="mb-1 block text-sm font-medium text-neutral-700"
                    >
                      Powód usunięcia *
                    </label>
                    <textarea
                      id="reason"
                      {...register('reason')}
                      rows={3}
                      className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Podaj powód trwałego usunięcia danych..."
                    />
                    {errors.reason ? (
                      <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
                    ) : null}
                  </div>

                  {/* Final confirmation checkbox */}
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="confirm"
                      {...register('confirm')}
                      className="mt-1 h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
                    />
                    <label htmlFor="confirm" className="text-sm text-neutral-700">
                      Rozumiem, że ta operacja jest nieodwracalna i wszystkie dane pacjenta zostaną
                      trwale usunięte
                    </label>
                  </div>
                  {errors.confirm ? (
                    <p className="text-sm text-red-600">{errors.confirm.message}</p>
                  ) : null}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 rounded-b-lg border-t border-neutral-200 bg-neutral-50 px-6 py-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Anuluj
              </Button>
              {step === 1 ? (
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleFirstStep}
                  disabled={!canErase || isLoading}
                >
                  Kontynuuj
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                  >
                    Wstecz
                  </Button>
                  <Button
                    type="submit"
                    variant="danger"
                    loading={isLoading}
                    disabled={!confirmValue || isLoading}
                  >
                    Usuń trwale
                  </Button>
                </>
              )}
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

export default ErasePatientDialog
