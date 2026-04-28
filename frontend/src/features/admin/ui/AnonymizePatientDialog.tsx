import { Button } from '@shared/components'

interface AnonymizePatientDialogProps {
  isOpen: boolean
  onClose: () => void
  patientId: string
  patientName: string
  onSuccess: () => void
}

// Stub: full RODO anonymization flow (input "ANONYMIZUJ" + reason dropdown)
// per US-A-10 is not yet implemented. Placeholder lets the admin page render.
export const AnonymizePatientDialog = ({
  isOpen,
  onClose,
  patientName,
}: AnonymizePatientDialogProps) => {
  if (!isOpen) return null
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow max-w-md">
        <h2 className="font-semibold mb-2">Anonimizacja pacjenta</h2>
        <p className="mb-4">Anonimizacja danych pacjenta {patientName} — funkcja w przygotowaniu.</p>
        <Button onClick={onClose}>Zamknij</Button>
      </div>
    </div>
  )
}
