import { Button } from '@shared/components'

interface ErasePatientDialogProps {
  isOpen: boolean
  onClose: () => void
  patientId: string
  patientName: string
  deletedAt: string | null | undefined
  onSuccess: () => void
}

// Stub: RODO Art. 17 erasure flow (30-day cooling check, two-step confirmation
// with reason) per US-A-12 is not yet implemented. Placeholder lets the
// admin page render.
export const ErasePatientDialog = ({ isOpen, onClose, patientName }: ErasePatientDialogProps) => {
  if (!isOpen) return null
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 flex items-center justify-center bg-black/40"
    >
      <div className="max-w-md rounded bg-white p-6 shadow">
        <h2 className="mb-2 font-semibold">Usunięcie pacjenta</h2>
        <p className="mb-4">Usunięcie danych pacjenta {patientName} — funkcja w przygotowaniu.</p>
        <Button onClick={onClose}>Zamknij</Button>
      </div>
    </div>
  )
}
