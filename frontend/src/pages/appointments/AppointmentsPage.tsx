import { Card, Button } from '@shared/components'

/**
 * AppointmentsPage Component
 *
 * Appointments list page
 */
export const AppointmentsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Wizyty</h1>
          <p className="text-neutral-600 mt-1">Zarządzaj terminarzem wizyt</p>
        </div>
        <Button variant="primary" leftIcon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }>
          Dodaj wizytę
        </Button>
      </div>

      <Card variant="elevated">
        <Card.Body noPadding>
          <div className="text-center py-12 text-neutral-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium mb-1">Brak wizyt</p>
            <p className="text-sm">Dodaj pierwszą wizytę, aby rozpocząć</p>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default AppointmentsPage
