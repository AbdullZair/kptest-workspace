import React, { useMemo, useState } from 'react'
import { useErasePatientMutation } from '../api/adminApi'
import type { ApiError } from '@shared/api'

interface ErasePatientDialogProps {
  isOpen: boolean
  onClose: () => void
  patientId: string
  patientName: string
  deletedAt: string | null | undefined
  onSuccess: () => void
}

const COOLING_OFF_DAYS = 30

interface CoolingOffStatus {
  /** Patient is currently within the protected 30-day window. */
  blocked: boolean
  /** Days remaining in the cooling-off window (>= 0). */
  daysRemaining: number
}

/**
 * Compute the 30-day RODO cooling-off window for a soft-deleted patient.
 * Returns blocked = true while the window is still active.
 */
const evaluateCoolingOff = (deletedAt: string | null | undefined): CoolingOffStatus => {
  if (!deletedAt) {
    return { blocked: false, daysRemaining: 0 }
  }
  const deletedAtMs = new Date(deletedAt).getTime()
  if (Number.isNaN(deletedAtMs)) {
    return { blocked: false, daysRemaining: 0 }
  }
  const diffMs = Date.now() - deletedAtMs
  const dayMs = 24 * 60 * 60 * 1000
  const elapsedDays = Math.floor(diffMs / dayMs)
  if (elapsedDays >= COOLING_OFF_DAYS) {
    return { blocked: false, daysRemaining: 0 }
  }
  return { blocked: true, daysRemaining: COOLING_OFF_DAYS - elapsedDays }
}

/**
 * ErasePatientDialog (US-A-12, RODO Art. 17 — right to erasure)
 *
 * Two-step flow with mandatory reason. Disabled while the 30-day
 * cooling-off period from soft-deletion is still active.
 */
export const ErasePatientDialog: React.FC<ErasePatientDialogProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  deletedAt,
  onSuccess,
}) => {
  const [reason, setReason] = useState('')
  const [step, setStep] = useState<1 | 2>(1)
  const [erasePatient, { isLoading, error, reset: resetMutation }] = useErasePatientMutation()

  const cooling = useMemo(() => evaluateCoolingOff(deletedAt), [deletedAt])
  const reasonValid = reason.trim().length >= 10
  const errorMessage = error ? (error as ApiError)?.message ?? String(error) : null

  const handleClose = (): void => {
    setReason('')
    setStep(1)
    resetMutation()
    onClose()
  }

  const handleConfirm = async (): Promise<void> => {
    try {
      await erasePatient({
        patientId,
        body: {
          reason: reason.trim(),
          confirm: true,
        },
      }).unwrap()
      onSuccess()
      handleClose()
    } catch (err) {
      console.error('[ErasePatientDialog] erase failed', err)
    }
  }

  if (!isOpen) return null

  const formattedDeletedAt = deletedAt
    ? new Date(deletedAt).toLocaleDateString('pl-PL')
    : null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="erase-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="mx-4 w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="border-b border-neutral-200 px-6 py-4">
          <h3 id="erase-dialog-title" className="text-lg font-semibold text-neutral-900">
            {step === 1
              ? 'Trwałe usunięcie danych pacjenta (RODO Art. 17)'
              : 'Potwierdź trwałe usunięcie'}
          </h3>
          <p className="mt-1 text-sm text-neutral-500">{patientName}</p>
        </div>

        <div className="space-y-4 px-6 py-4">
          {cooling.blocked ? (
            <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <p className="font-medium">Okres karencji 30 dni</p>
              <p className="mt-1">
                Pacjent został oznaczony jako usunięty
                {formattedDeletedAt ? ` ${formattedDeletedAt}` : ''}. Trwałe
                usunięcie będzie możliwe za {cooling.daysRemaining}{' '}
                {cooling.daysRemaining === 1 ? 'dzień' : 'dni'}.
              </p>
            </div>
          ) : null}

          {!deletedAt ? (
            <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Pacjent nie został wcześniej miękko usunięty. Operacja trwałego
              usunięcia jest zablokowana.
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Błąd: {errorMessage}
            </div>
          ) : null}

          {step === 1 ? (
            <>
              <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                <p>
                  <strong>Operacja nieodwracalna.</strong> Wszystkie dane osobowe
                  pacjenta zostaną trwale usunięte z systemu.
                </p>
              </div>

              <div>
                <label
                  htmlFor="erase-reason"
                  className="mb-1 block text-sm font-medium text-neutral-700"
                >
                  Powód usunięcia *
                </label>
                <textarea
                  id="erase-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Podaj uzasadnienie (min. 10 znaków). Treść trafi do dziennika audytu."
                  disabled={cooling.blocked || !deletedAt}
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Minimum 10 znaków. Wymagane do audytu RODO.
                </p>
              </div>

              <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                >
                  Anuluj
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={
                    cooling.blocked || !deletedAt || !reasonValid || isLoading
                  }
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Dalej
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                <p className="font-medium">Co zostanie trwale usunięte:</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-red-700">
                  <li>Dane osobowe (PESEL, imię, nazwisko, kontakt, adres)</li>
                  <li>Wiadomości, materiały, postępy, badge'y, kalendarz</li>
                  <li>Powiązania z projektami</li>
                </ul>
              </div>

              <div className="rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                <p className="font-medium">Co zostanie zachowane (wymóg prawny):</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-blue-700">
                  <li>Audit log operacji RODO</li>
                  <li>Dokumentacja finansowa — retencja 10 lat</li>
                  <li>Identyfikator wewnętrzny zanonimizowany w rekordach</li>
                </ul>
              </div>

              <div className="rounded border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
                <p className="font-medium">Powód usunięcia:</p>
                <p className="mt-1 whitespace-pre-wrap">{reason.trim()}</p>
              </div>

              <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                  className="rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                >
                  Wstecz
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? 'Usuwam...' : 'Usuń trwale'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ErasePatientDialog
