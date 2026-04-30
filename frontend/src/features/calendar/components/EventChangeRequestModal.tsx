import React, { useState } from 'react'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

interface EventChangeRequestModalProps {
  eventId: string
  eventTitle: string
  eventDate: string
  isOpen: boolean
  onClose: () => void
  onSubmit: (request: { proposedDate: string; reason: string }) => Promise<void>
}

/**
 * Modal for proposing an event date change
 */
export function EventChangeRequestModal({
  eventId: _eventId,
  eventTitle,
  eventDate,
  isOpen,
  onClose,
  onSubmit,
}: EventChangeRequestModalProps) {
  const [proposedDate, setProposedDate] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await onSubmit({ proposedDate, reason })
      // Reset form
      setProposedDate('')
      setReason('')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Nie udało się wysłać prośby')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setProposedDate('')
    setReason('')
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
    >
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-neutral-900">Zmień termin wydarzenia</h2>
          <p className="mt-1 text-sm text-neutral-500">Zaproponuj nowy termin dla wydarzenia</p>
        </div>

        {/* Event Info */}
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="font-medium text-neutral-900">{eventTitle}</p>
          <p className="mt-1 text-sm text-neutral-600">
            Obecny termin: {format(new Date(eventDate), 'dd MMMM yyyy, HH:mm', { locale: pl })}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Proposed Date */}
          <div className="mb-4">
            <label
              className="mb-1 block text-sm font-medium text-neutral-700"
              htmlFor="proposedDate"
            >
              Proponowany nowy termin *
            </label>
            <input
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
              id="proposedDate"
              min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
              type="datetime-local"
              value={proposedDate}
              onChange={(e) => setProposedDate(e.target.value)}
            />
            <p className="mt-1 text-xs text-neutral-500">
              Minimalnie 24 godziny przed obecnym terminem
            </p>
          </div>

          {/* Reason */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="reason">
              Powód zmiany *
            </label>
            <textarea
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
              id="reason"
              placeholder="Opisz powód prośby o zmianę terminu..."
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {/* Info */}
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm text-amber-800">
              ℹ️ Masz maksymalnie 3 próby zmiany terminu dla tego wydarzenia.
            </p>
          </div>

          {/* Error */}
          {error ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-800" role="alert">
                ❌ {error}
              </p>
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isSubmitting}
              type="button"
              onClick={handleClose}
            >
              Anuluj
            </button>
            <button
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Wysyłanie...' : 'Wyślij prośbę'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EventChangeRequestModal
