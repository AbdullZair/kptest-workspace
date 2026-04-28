import React, { useState } from 'react'
import { useAnonymizePatientMutation } from '../api/adminApi'
import type { AnonymizationReason } from '../types'
import type { ApiError } from '@shared/api'

interface AnonymizePatientDialogProps {
  isOpen: boolean
  onClose: () => void
  patientId: string
  patientName: string
  onSuccess: () => void
}

type ReasonCode = 'RODO_REQUEST' | 'PATIENT_REQUEST' | 'STATISTICAL_REPORT' | 'OTHER'

const REASON_OPTIONS: { value: ReasonCode; label: string }[] = [
  { value: 'RODO_REQUEST', label: 'Wniosek RODO (Art. 17)' },
  { value: 'PATIENT_REQUEST', label: 'Żądanie pacjenta' },
  { value: 'STATISTICAL_REPORT', label: 'Raport statystyczny' },
  { value: 'OTHER', label: 'Inne (uzasadnienie wymagane)' },
]

const CONFIRMATION_PHRASE = 'ANONYMIZUJ'

/**
 * AnonymizePatientDialog (US-A-10)
 *
 * Two-step RODO anonymization flow:
 *  1. Form step — user selects reason, optionally adds notes, types
 *     the literal phrase "ANONYMIZUJ" to enable the primary action.
 *  2. Confirm step — modal lists what will be anonymized vs. preserved.
 */
export const AnonymizePatientDialog: React.FC<AnonymizePatientDialogProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  onSuccess,
}) => {
  const [reason, setReason] = useState<ReasonCode>('RODO_REQUEST')
  const [notes, setNotes] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [step, setStep] = useState<1 | 2>(1)
  const [anonymizePatient, { isLoading, error, reset: resetMutation }] =
    useAnonymizePatientMutation()

  const isPhraseValid = confirmation.trim() === CONFIRMATION_PHRASE
  const requiresNotes = reason === 'OTHER'
  const hasValidNotes = !requiresNotes || notes.trim().length >= 3
  const canProceed = isPhraseValid && hasValidNotes && !isLoading

  const errorMessage = error ? (error as ApiError)?.message ?? String(error) : null

  const handleClose = (): void => {
    setReason('RODO_REQUEST')
    setNotes('')
    setConfirmation('')
    setStep(1)
    resetMutation()
    onClose()
  }

  const handleConfirm = async (): Promise<void> => {
    try {
      await anonymizePatient({
        patientId,
        body: {
          reason: reason as AnonymizationReason,
          additional_notes: notes.trim() ? notes.trim() : undefined,
        },
      }).unwrap()
      onSuccess()
      handleClose()
    } catch (err) {
      // Surface error inline; keep dialog open so user can retry.
      console.error('[AnonymizePatientDialog] anonymize failed', err)
    }
  }

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="anonymize-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="mx-4 w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="border-b border-neutral-200 px-6 py-4">
          <h3
            id="anonymize-dialog-title"
            className="text-lg font-semibold text-neutral-900"
          >
            {step === 1 ? 'Anonimizacja danych pacjenta' : 'Potwierdź anonimizację'}
          </h3>
          <p className="mt-1 text-sm text-neutral-500">{patientName}</p>
        </div>

        {step === 1 ? (
          <div className="space-y-4 px-6 py-4">
            <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <p>
                <strong>Uwaga:</strong> Anonimizacja jest nieodwracalna. Dane
                osobowe zostaną zastąpione wartościami pseudonimowymi zgodnie z
                RODO (Art. 17).
              </p>
            </div>

            {errorMessage ? (
              <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                Błąd: {errorMessage}
              </div>
            ) : null}

            <div>
              <label
                htmlFor="anonymize-reason"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Powód anonimizacji *
              </label>
              <select
                id="anonymize-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value as ReasonCode)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {REASON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {requiresNotes ? (
              <div>
                <label
                  htmlFor="anonymize-notes"
                  className="mb-1 block text-sm font-medium text-neutral-700"
                >
                  Uzasadnienie *
                </label>
                <textarea
                  id="anonymize-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder='Opisz powód wybrania kategorii „Inne"...'
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Minimum 3 znaki. Treść trafi do dziennika audytu.
                </p>
              </div>
            ) : null}

            <div>
              <label
                htmlFor="anonymize-confirmation"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Wpisz „{CONFIRMATION_PHRASE}", aby aktywować przycisk *
              </label>
              <input
                id="anonymize-confirmation"
                type="text"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 font-mono text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={CONFIRMATION_PHRASE}
              />
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
                disabled={!canProceed}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Dalej
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 px-6 py-4">
            <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <p className="font-medium">Co zostanie zanonimizowane:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-red-700">
                <li>PESEL → hash kryptograficzny</li>
                <li>Imię i nazwisko → „***"</li>
                <li>E-mail, telefon, adres → null</li>
                <li>Data urodzenia → null</li>
              </ul>
            </div>

            <div className="rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
              <p className="font-medium">Co pozostanie zachowane:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-blue-700">
                <li>Powiązania z projektami (członkostwo)</li>
                <li>Pełen audit trail (RODO Art. 30)</li>
                <li>Identyfikator wewnętrzny pacjenta</li>
              </ul>
            </div>

            <div className="rounded border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
              <p>
                <span className="font-medium">Powód:</span>{' '}
                {REASON_OPTIONS.find((r) => r.value === reason)?.label}
              </p>
              {notes.trim() ? (
                <p className="mt-1">
                  <span className="font-medium">Uzasadnienie:</span> {notes.trim()}
                </p>
              ) : null}
            </div>

            {errorMessage ? (
              <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                Błąd: {errorMessage}
              </div>
            ) : null}

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
                {isLoading ? 'Anonimizuję...' : 'Anonimizuj nieodwracalnie'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnonymizePatientDialog
