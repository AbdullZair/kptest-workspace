import React, { useState } from 'react'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

interface ChangeRequest {
  id: string
  eventId: string
  eventTitle: string
  patientName: string
  currentDateTime: string
  proposedDateTime: string
  reason: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
  attemptNumber: number
  createdAt: string
}

interface EventChangeRequestsPageProps {
  requests: ChangeRequest[]
  onAccept: (requestId: string, comment: string) => Promise<void>
  onReject: (requestId: string, reason: string) => Promise<void>
  isLoading?: boolean
}

/**
 * Page for staff to review and respond to event change requests
 */
export function EventChangeRequestsPage({
  requests,
  onAccept,
  onReject,
  isLoading = false,
}: EventChangeRequestsPageProps) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [acceptComment, setAcceptComment] = useState<Record<string, string>>({})
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({})
  const [showAcceptModal, setShowAcceptModal] = useState<string | null>(null)
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null)

  const handleAccept = async (requestId: string) => {
    setProcessingId(requestId)
    try {
      await onAccept(requestId, acceptComment[requestId] || 'Zaakceptowano')
      setShowAcceptModal(null)
      setAcceptComment({})
    } catch (error: any) {
      alert(`Błąd: ${error.message || 'Nie udało się zaakceptować'}`)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId)
    try {
      await onReject(requestId, rejectReason[requestId] || 'Odrzucono')
      setShowRejectModal(null)
      setRejectReason({})
    } catch (error: any) {
      alert(`Błąd: ${error.message || 'Nie udało się odrzucić'}`)
    } finally {
      setProcessingId(null)
    }
  }

  const pendingRequests = requests.filter((r) => r.status === 'PENDING')
  const resolvedRequests = requests.filter((r) => r.status !== 'PENDING')

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Prośby o zmianę terminu</h1>

      {/* Pending Requests */}
      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-800">
          <span className="h-3 w-3 rounded-full bg-amber-500" />
          Oczekujące ({pendingRequests.length})
        </h2>

        {pendingRequests.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-center">
            <p className="text-neutral-500">Brak oczekujących próśb</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-neutral-900">{request.eventTitle}</h3>
                    <p className="text-sm text-neutral-600">Pacjent: {request.patientName}</p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                    Próba {request.attemptNumber}/3
                  </span>
                </div>

                <div className="mb-3 grid grid-cols-2 gap-4">
                  <div className="rounded bg-neutral-50 p-3">
                    <p className="mb-1 text-xs text-neutral-500">Obecny termin</p>
                    <p className="text-sm font-medium text-neutral-900">
                      {format(new Date(request.currentDateTime), 'dd MMM yyyy, HH:mm', {
                        locale: pl,
                      })}
                    </p>
                  </div>
                  <div className="rounded bg-blue-50 p-3">
                    <p className="mb-1 text-xs text-blue-600">Proponowany termin</p>
                    <p className="text-sm font-medium text-blue-900">
                      {format(new Date(request.proposedDateTime), 'dd MMM yyyy, HH:mm', {
                        locale: pl,
                      })}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="mb-1 text-xs text-neutral-500">Powód prośby:</p>
                  <p className="rounded bg-neutral-50 p-2 text-sm text-neutral-700">
                    {request.reason}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAcceptModal(request.id)}
                    disabled={processingId === request.id}
                    className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    ✓ Zaakceptuj
                  </button>
                  <button
                    onClick={() => setShowRejectModal(request.id)}
                    disabled={processingId === request.id}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    ✗ Odrzuć
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Resolved Requests */}
      {resolvedRequests.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-800">
            <span className="h-3 w-3 rounded-full bg-neutral-400" />
            Rozstrzygnięte ({resolvedRequests.length})
          </h2>

          <div className="space-y-4">
            {resolvedRequests.map((request) => (
              <div
                key={request.id}
                className={`rounded-lg border bg-white p-4 ${
                  request.status === 'ACCEPTED'
                    ? 'border-green-200 bg-green-50'
                    : request.status === 'REJECTED'
                      ? 'border-red-200 bg-red-50'
                      : 'border-neutral-200 bg-neutral-50'
                }`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-neutral-900">{request.eventTitle}</h3>
                    <p className="text-sm text-neutral-600">Pacjent: {request.patientName}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      request.status === 'ACCEPTED'
                        ? 'bg-green-100 text-green-800'
                        : request.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-neutral-100 text-neutral-800'
                    }`}
                  >
                    {request.status === 'ACCEPTED' && '✓ Zaakceptowano'}
                    {request.status === 'REJECTED' && '✗ Odrzucono'}
                    {request.status === 'CANCELLED' && 'Anulowano'}
                  </span>
                </div>

                <div className="text-sm text-neutral-600">
                  <p>
                    Zmiana: {format(new Date(request.currentDateTime), 'dd MMM', { locale: pl })} →{' '}
                    {format(new Date(request.proposedDateTime), 'dd MMM yyyy, HH:mm', {
                      locale: pl,
                    })}
                  </p>
                  {request.status === 'ACCEPTED' && request.attemptNumber ? (
                    <p className="mt-1 text-xs text-green-600">
                      Komentarz: {request.attemptNumber}
                    </p>
                  ) : null}
                  {request.status === 'REJECTED' && (
                    <p className="mt-1 text-xs text-red-600">Powód: {request.reason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Accept Modal */}
      {showAcceptModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-bold">Zaakceptuj zmianę terminu</h3>
            <textarea
              value={acceptComment[showAcceptModal] || ''}
              onChange={(e) =>
                setAcceptComment({ ...acceptComment, [showAcceptModal]: e.target.value })
              }
              placeholder="Dodatkowy komentarz (opcjonalny)"
              rows={3}
              className="mb-4 w-full rounded-lg border border-neutral-300 px-3 py-2"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAcceptModal(null)
                  setAcceptComment({})
                }}
                className="flex-1 rounded-lg border border-neutral-300 px-4 py-2"
              >
                Anuluj
              </button>
              <button
                onClick={() => handleAccept(showAcceptModal)}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-white"
              >
                Zaakceptuj
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Reject Modal */}
      {showRejectModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-bold">Odrzuć zmianę terminu</h3>
            <textarea
              value={rejectReason[showRejectModal] || ''}
              onChange={(e) =>
                setRejectReason({ ...rejectReason, [showRejectModal]: e.target.value })
              }
              placeholder="Powód odrzucenia *"
              rows={3}
              className="mb-4 w-full rounded-lg border border-neutral-300 px-3 py-2"
              required
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(null)
                  setRejectReason({})
                }}
                className="flex-1 rounded-lg border border-neutral-300 px-4 py-2"
              >
                Anuluj
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white"
              >
                Odrzuć
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default EventChangeRequestsPage
