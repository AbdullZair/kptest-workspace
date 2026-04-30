import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog } from '@headlessui/react'
import { useAnonymizePatientMutation } from '../api/adminApi'
import { anonymizePatientSchema, type AnonymizePatientFormData } from '../lib/schemas'
import { Button } from '@shared/components'
import { Input } from '@shared/components'
import type { ApiError } from '@shared/api'

export interface AnonymizePatientDialogProps {
  isOpen: boolean
  onClose: () => void
  patientId: string
  patientName: string
  onSuccess?: () => void
}

const REASONS: { value: 'treatment' | 'patient_request' | 'other'; label: string }[] = [
  { value: 'treatment', label: 'Koniec leczenia' },
  { value: 'patient_request', label: 'Żądanie pacjenta' },
  { value: 'other', label: 'Inne' },
]

/**
 * AnonymizePatientDialog Component
 *
 * Dialog for anonymizing patient data with confirmation
 * Implements US-A-10 (anonimizacja danych pacjenta)
 */
export const AnonymizePatientDialog: React.FC<AnonymizePatientDialogProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  onSuccess,
}) => {
  const [anonymizePatient, { isLoading, error }] = useAnonymizePatientMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AnonymizePatientFormData>({
    resolver: zodResolver(anonymizePatientSchema),
    defaultValues: {
      reason: 'treatment',
      additional_notes: undefined,
      confirmation: '' as 'ANONYMIZUJ',
    },
  })

  const handleFormSubmit = async (data: AnonymizePatientFormData): Promise<void> => {
    try {
      await anonymizePatient({
        patientId,
        body: {
          reason: data.reason,
          additional_notes: data.additional_notes,
        },
      }).unwrap()

      reset()
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Failed to anonymize patient:', err)
    }
  }

  const handleClose = (): void => {
    reset()
    onClose()
  }

  const errorMessage = error ? (error as ApiError)?.message || String(error) : null

  return (
    <Dialog className="relative z-50" open={isOpen} onClose={handleClose}>
      {/* Backdrop */}
      <div aria-hidden="true" className="fixed inset-0 bg-black/50" />

      {/* Dialog container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg rounded-lg bg-white shadow-xl">
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            {/* Header */}
            <div className="border-b border-neutral-200 px-6 py-4">
              <Dialog.Title className="text-lg font-semibold text-neutral-900">
                Anonimizacja danych pacjenta
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-neutral-500">
                Pacjent: <span className="font-medium text-neutral-700">{patientName}</span>
              </Dialog.Description>
            </div>

            {/* Body */}
            <div className="space-y-4 px-6 py-4">
              {/* Warning */}
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm text-amber-800">
                  <strong>Uwaga:</strong> Ta operacja jest nieodwracalna. Dane osobowe pacjenta
                  zostaną zastąpione danymi anonimizowanymi.
                </p>
              </div>

              {/* Error display */}
              {errorMessage ? (
                <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  Błąd: {errorMessage}
                </div>
              ) : null}

              {/* Reason dropdown */}
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="reason">
                  Powód anonimizacji *
                </label>
                <select
                  id="reason"
                  {...register('reason')}
                  className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {REASONS.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
                {errors.reason ? (
                  <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
                ) : null}
              </div>

              {/* Additional notes */}
              <div>
                <label
                  className="mb-1 block text-sm font-medium text-neutral-700"
                  htmlFor="additional_notes"
                >
                  Notatki dodatkowe
                </label>
                <textarea
                  id="additional_notes"
                  {...register('additional_notes')}
                  className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Opcjonalne notatki..."
                  rows={3}
                />
                {errors.additional_notes ? (
                  <p className="mt-1 text-sm text-red-600">{errors.additional_notes.message}</p>
                ) : null}
              </div>

              {/* Confirmation input */}
              <div>
                <label
                  className="mb-1 block text-sm font-medium text-neutral-700"
                  htmlFor="confirmation"
                >
                  Wpisz "ANONYMIZUJ" aby potwierdzić *
                </label>
                <Input
                  id="confirmation"
                  {...register('confirmation')}
                  fullWidth
                  errorMessage={errors.confirmation?.message ?? ''}
                  placeholder="ANONYMIZUJ"
                  type="text"
                  variant={errors.confirmation ? 'error' : 'default'}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 rounded-b-lg border-t border-neutral-200 bg-neutral-50 px-6 py-4">
              <Button disabled={isLoading} type="button" variant="outline" onClick={handleClose}>
                Anuluj
              </Button>
              <Button loading={isLoading} type="submit" variant="danger">
                Anonimizuj
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

export default AnonymizePatientDialog
