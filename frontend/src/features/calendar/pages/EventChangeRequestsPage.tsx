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
      alert('Błąd: ' + (error.message || 'Nie udało się zaakceptować'))
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
      alert('Błąd: ' + (error.message || 'Nie udało się odrzucić'))
    } finally {
      setProcessingId(null)
    }
  }

  const pendingRequests = requests.filter((r) => r.status === 'PENDING')
  const resolvedRequests = requests.filter((r) => r.status !== 'PENDING')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Prośby o zmianę terminu</h1>

      {/* Pending Requests */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
          <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
          Oczekujące ({pendingRequests.length})
        </h2>

        {pendingRequests.length === 0 ? (
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 text-center">
            <p className="text-neutral-500">Brak oczekujących próśb</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-neutral-900">{request.eventTitle}</h3>
                    <p className="text-sm text-neutral-600">Pacjent: {request.patientName}</p>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                    Próba {request.attemptNumber}/3
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="bg-neutral-50 p-3 rounded">
                    <p className="text-xs text-neutral-500 mb-1">Obecny termin</p>
                    <p className="text-sm font-medium text-neutral-900">
                      {format(new Date(request.currentDateTime), 'dd MMM yyyy, HH:mm', { locale: pl })}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-xs text-blue-600 mb-1">Proponowany termin</p>
                    <p className="text-sm font-medium text-blue-900">
                      {format(new Date(request.proposedDateTime), 'dd MMM yyyy, HH:mm', { locale: pl })}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-neutral-500 mb-1">Powód prośby:</p>
                  <p className="text-sm text-neutral-700 bg-neutral-50 p-2 rounded">{request.reason}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAcceptModal(request.id)}
                    disabled={processingId === request.id}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    ✓ Zaakceptuj
                  </button>
                  <button
                    onClick={() => setShowRejectModal(request.id)}
                    disabled={processingId === request.id}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
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
          <h2 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-neutral-400 rounded-full"></span>
            Rozstrzygnięte ({resolvedRequests.length})
          </h2>

          <div className="space-y-4">
            {resolvedRequests.map((request) => (
              <div
                key={request.id}
                className={`bg-white border rounded-lg p-4 ${
                  request.status === 'ACCEPTED'
                    ? 'border-green-200 bg-green-50'
                    : request.status === 'REJECTED'
                    ? 'border-red-200 bg-red-50'
                    : 'border-neutral-200 bg-neutral-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-neutral-900">{request.eventTitle}</h3>
                    <p className="text-sm text-neutral-600">Pacjent: {request.patientName}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
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
                    {format(new Date(request.proposedDateTime), 'dd MMM yyyy, HH:mm', { locale: pl })}
                  </p>
                  {request.status === 'ACCEPTED' && request.attemptNumber && (
                    <p className="text-xs text-green-600 mt-1">Komentarz: {request.attemptNumber}</p>
                  )}
                  {request.status === 'REJECTED' && (
                    <p className="text-xs text-red-600 mt-1">Powód: {request.reason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Accept Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold mb-4">Zaakceptuj zmianę terminu</h3>
            <textarea
              value={acceptComment[showAcceptModal] || ''}
              onChange={(e) => setAcceptComment({ ...acceptComment, [showAcceptModal]: e.target.value })}
              placeholder="Dodatkowy komentarz (opcjonalny)"
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAcceptModal(null)
                  setAcceptComment({})
                }}
                className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg"
              >
                Anuluj
              </button>
              <button
                onClick={() => handleAccept(showAcceptModal)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Zaakceptuj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold mb-4">Odrzuć zmianę terminu</h3>
            <textarea
              value={rejectReason[showRejectModal] || ''}
              onChange={(e) => setRejectReason({ ...rejectReason, [showRejectModal]: e.target.value })}
              placeholder="Powód odrzucenia *"
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg mb-4"
              required
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(null)
                  setRejectReason({})
                }}
                className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg"
              >
                Anuluj
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Odrzuć
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventChangeRequestsPage
