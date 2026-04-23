import { Card, Button } from '@shared/components'

/**
 * PatientsPage Component
 *
 * List of patients page
 */
export const PatientsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Pacjenci</h1>
          <p className="text-neutral-600 mt-1">Zarządzaj bazą pacjentów</p>
        </div>
        <Button variant="primary" leftIcon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }>
          Dodaj pacjenta
        </Button>
      </div>

      <Card variant="elevated">
        <Card.Body noPadding>
          <div className="text-center py-12 text-neutral-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-lg font-medium mb-1">Brak pacjentów</p>
            <p className="text-sm">Dodaj pierwszego pacjenta, aby rozpocząć</p>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default PatientsPage
