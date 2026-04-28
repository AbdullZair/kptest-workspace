import { Button } from '@shared/components'

interface ExportPatientDataButtonProps {
  patientId: string
  patientName: string
  onSuccess: () => void
}

// Stub: RODO Art. 20 export flow (JSON / PDF dropdown, blob download) per
// US-A-11 is not yet implemented. Placeholder renders a disabled button.
export const ExportPatientDataButton = ({ patientName }: ExportPatientDataButtonProps) => (
  <Button disabled title={`Eksport danych ${patientName} — w przygotowaniu`}>
    Eksportuj dane (RODO)
  </Button>
)
