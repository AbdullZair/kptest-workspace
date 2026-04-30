import { useState } from 'react'
import {
  useGetPendingVerificationsQuery,
  useApproveVerificationMutation,
  useRejectVerificationMutation,
} from '../api/adminApi'
import type { PendingVerification } from '../types'
import type { ApiError } from '@shared/api'

type ModalKind = 'his' | 'manual' | 'reject' | null

interface ActiveModal {
  kind: ModalKind
  patient: PendingVerification | null
}

const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

/**
 * PendingVerificationsPage (US-NH-01) — staff view for verifying patients
 * registered through the public form.
 *
 * Mounted at /admin/pending-verifications. Visible to ADMIN, COORDINATOR,
 * and DOCTOR roles.
 */
export const PendingVerificationsPage = () => {
  const [page, setPage] = useState(0)
  const [size] = useState(20)

  const { data, isLoading, error, refetch } = useGetPendingVerificationsQuery({ page, size })
  const [approveVerification, { isLoading: isApproving }] = useApproveVerificationMutation()
  const [rejectVerification, { isLoading: isRejecting }] = useRejectVerificationMutation()

  const [modal, setModal] = useState<ActiveModal>({ kind: null, patient: null })
  const [hisCart, setHisCart] = useState('')
  const [manualReason, setManualReason] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  const closeModal = () => {
    setModal({ kind: null, patient: null })
    setHisCart('')
    setManualReason('')
    setRejectReason('')
  }

  const openHis = (p: PendingVerification) => setModal({ kind: 'his', patient: p })
  const openManual = (p: PendingVerification) => setModal({ kind: 'manual', patient: p })
  const openReject = (p: PendingVerification) => setModal({ kind: 'reject', patient: p })

  const handleHisApprove = async () => {
    if (!modal.patient || hisCart.trim().length === 0) return
    setFeedback(null)
    try {
      await approveVerification({
        patientId: modal.patient.patient_id,
        body: { method: 'HIS', his_cart_number: hisCart.trim() },
      }).unwrap()
      setFeedback({ kind: 'ok', text: `Pacjent zweryfikowany przez HIS.` })
      closeModal()
      refetch()
    } catch (err) {
      const apiErr = err as ApiError
      setFeedback({
        kind: 'err',
        text: `Weryfikacja HIS nie powiodła się: ${apiErr?.message ?? 'nieznany błąd'}`,
      })
    }
  }

  const handleManualApprove = async () => {
    if (!modal.patient || manualReason.trim().length < 10) return
    setFeedback(null)
    try {
      await approveVerification({
        patientId: modal.patient.patient_id,
        body: { method: 'MANUAL', reason: manualReason.trim() },
      }).unwrap()
      setFeedback({ kind: 'ok', text: 'Pacjent zatwierdzony ręcznie.' })
      closeModal()
      refetch()
    } catch (err) {
      const apiErr = err as ApiError
      setFeedback({
        kind: 'err',
        text: `Zatwierdzenie ręczne nie powiodło się: ${apiErr?.message ?? 'nieznany błąd'}`,
      })
    }
  }

  const handleReject = async () => {
    if (!modal.patient || rejectReason.trim().length < 10) return
    setFeedback(null)
    try {
      await rejectVerification({
        patientId: modal.patient.patient_id,
        body: { reason: rejectReason.trim() },
      }).unwrap()
      setFeedback({ kind: 'ok', text: 'Pacjent odrzucony.' })
      closeModal()
      refetch()
    } catch (err) {
      const apiErr = err as ApiError
      setFeedback({
        kind: 'err',
        text: `Odrzucenie nie powiodło się: ${apiErr?.message ?? 'nieznany błąd'}`,
      })
    }
  }

  const items = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="space-y-6" data-testid="pending-verifications-page">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Weryfikacja pacjentów</h1>
        <p className="mt-1 text-sm text-neutral-500">
          US-NH-01 — Pacjenci oczekujący na weryfikację personelu (HIS lub ręcznie z uzasadnieniem).
        </p>
      </div>

      {feedback ? (
        <div
          className={
            feedback.kind === 'ok'
              ? 'rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800'
              : 'rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800'
          }
          data-testid={`feedback-${feedback.kind}`}
          role="status"
        >
          {feedback.text}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
        <table
          className="min-w-full divide-y divide-neutral-200"
          data-testid="pending-verifications-table"
        >
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Imię i nazwisko
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                PESEL
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Data rejestracji
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 bg-white">
            {isLoading ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-neutral-500" colSpan={5}>
                  Ładowanie…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  className="px-4 py-8 text-center text-sm text-red-600"
                  colSpan={5}
                  data-testid="pending-verifications-error"
                >
                  Nie udało się pobrać listy oczekujących weryfikacji.
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-8 text-center text-sm text-neutral-500"
                  colSpan={5}
                  data-testid="pending-verifications-empty"
                >
                  Brak pacjentów oczekujących na weryfikację.
                </td>
              </tr>
            ) : (
              items.map((p) => (
                <tr key={p.patient_id} data-testid={`pending-row-${p.patient_id}`}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-neutral-900">
                    {p.first_name} {p.last_name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-neutral-700">
                    {p.pesel_masked}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-700">
                    {p.email ?? '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-500">
                    {formatDate(p.created_at)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                    <div className="inline-flex gap-2">
                      <button
                        className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        data-testid={`verify-his-${p.patient_id}`}
                        type="button"
                        onClick={() => openHis(p)}
                      >
                        Zweryfikuj przez HIS
                      </button>
                      <button
                        className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        data-testid={`manual-approve-${p.patient_id}`}
                        type="button"
                        onClick={() => openManual(p)}
                      >
                        Zatwierdź ręcznie
                      </button>
                      <button
                        className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                        data-testid={`reject-${p.patient_id}`}
                        type="button"
                        onClick={() => openReject(p)}
                      >
                        Odrzuć
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-4 py-3 text-sm">
            <button
              className="rounded-md border border-neutral-300 bg-white px-3 py-1 disabled:opacity-50"
              data-testid="page-prev"
              disabled={data?.isFirst ?? true}
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Poprzednia
            </button>
            <span className="text-neutral-600">
              Strona {(data?.pageNumber ?? 0) + 1} z {totalPages}
            </span>
            <button
              className="rounded-md border border-neutral-300 bg-white px-3 py-1 disabled:opacity-50"
              data-testid="page-next"
              disabled={data?.isLast ?? true}
              type="button"
              onClick={() => setPage((p) => p + 1)}
            >
              Następna
            </button>
          </div>
        ) : null}
      </div>

      {/* HIS verification modal */}
      {modal.kind === 'his' && modal.patient ? (
        <ModalShell
          subtitle={`Pacjent: ${modal.patient.first_name} ${modal.patient.last_name} (${modal.patient.pesel_masked})`}
          testId="his-modal"
          title="Weryfikacja przez HIS"
          onClose={closeModal}
        >
          <label className="block text-sm font-medium text-neutral-700" htmlFor="his-cart-input">
            Numer kartoteki HIS
          </label>
          <input
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            data-testid="his-cart-input"
            id="his-cart-input"
            placeholder="np. CART-001"
            value={hisCart}
            onChange={(e) => setHisCart(e.target.value)}
          />
          <p className="mt-2 text-xs text-neutral-500">
            System wykona dopasowanie po PESEL i numerze kartoteki w HIS.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700"
              type="button"
              onClick={closeModal}
            >
              Anuluj
            </button>
            <button
              className="rounded-md bg-primary-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
              data-testid="confirm-his"
              disabled={hisCart.trim().length === 0 || isApproving}
              type="button"
              onClick={handleHisApprove}
            >
              {isApproving ? 'Weryfikacja…' : 'Zatwierdź przez HIS'}
            </button>
          </div>
        </ModalShell>
      ) : null}

      {/* Manual approve modal */}
      {modal.kind === 'manual' && modal.patient ? (
        <ModalShell
          subtitle={`Pacjent: ${modal.patient.first_name} ${modal.patient.last_name} (${modal.patient.pesel_masked})`}
          testId="manual-modal"
          title="Zatwierdzenie ręczne"
          onClose={closeModal}
        >
          <label
            className="block text-sm font-medium text-neutral-700"
            htmlFor="manual-reason-input"
          >
            Uzasadnienie (min. 10 znaków)
          </label>
          <textarea
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            data-testid="manual-reason-input"
            id="manual-reason-input"
            placeholder="Opisz dlaczego zatwierdzasz ręcznie z pominięciem HIS"
            rows={4}
            value={manualReason}
            onChange={(e) => setManualReason(e.target.value)}
          />
          <p className="mt-2 text-xs text-neutral-500">
            Uzasadnienie zostanie zapisane w logu audytowym.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700"
              type="button"
              onClick={closeModal}
            >
              Anuluj
            </button>
            <button
              className="rounded-md bg-primary-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
              data-testid="confirm-manual"
              disabled={manualReason.trim().length < 10 || isApproving}
              type="button"
              onClick={handleManualApprove}
            >
              {isApproving ? 'Zatwierdzanie…' : 'Zatwierdź ręcznie'}
            </button>
          </div>
        </ModalShell>
      ) : null}

      {/* Reject modal */}
      {modal.kind === 'reject' && modal.patient ? (
        <ModalShell
          subtitle={`Pacjent: ${modal.patient.first_name} ${modal.patient.last_name} (${modal.patient.pesel_masked})`}
          testId="reject-modal"
          title="Odrzucenie weryfikacji"
          onClose={closeModal}
        >
          <label
            className="block text-sm font-medium text-neutral-700"
            htmlFor="reject-reason-input"
          >
            Powód odrzucenia (min. 10 znaków)
          </label>
          <textarea
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
            data-testid="reject-reason-input"
            id="reject-reason-input"
            placeholder="Opisz powód odrzucenia"
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <p className="mt-2 text-xs text-red-600">Odrzucenie jest nieodwracalne.</p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700"
              type="button"
              onClick={closeModal}
            >
              Anuluj
            </button>
            <button
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
              data-testid="confirm-reject"
              disabled={rejectReason.trim().length < 10 || isRejecting}
              type="button"
              onClick={handleReject}
            >
              {isRejecting ? 'Odrzucanie…' : 'Odrzuć'}
            </button>
          </div>
        </ModalShell>
      ) : null}
    </div>
  )
}

interface ModalShellProps {
  title: string
  subtitle: string
  testId: string
  onClose: () => void
  children: React.ReactNode
}

const ModalShell: React.FC<ModalShellProps> = ({ title, subtitle, testId, onClose, children }) => (
  <div
    aria-labelledby={`${testId}-title`}
    aria-modal="true"
    className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4"
    data-testid={testId}
    role="dialog"
  >
    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900" id={`${testId}-title`}>
            {title}
          </h2>
          <p className="mt-1 text-xs text-neutral-500">{subtitle}</p>
        </div>
        <button
          aria-label="Zamknij"
          className="text-neutral-400 hover:text-neutral-600"
          type="button"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      {children}
    </div>
  </div>
)

export default PendingVerificationsPage
