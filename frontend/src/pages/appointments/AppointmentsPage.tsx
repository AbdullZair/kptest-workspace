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
          <p className="mt-1 text-neutral-600">Zarządzaj terminarzem wizyt</p>
        </div>
        <Button
          leftIcon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 4v16m8-8H4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          }
          variant="primary"
        >
          Dodaj wizytę
        </Button>
      </div>

      <Card variant="elevated">
        <Card.Body noPadding>
          <div className="py-12 text-center text-neutral-500">
            <svg
              className="mx-auto mb-4 h-16 w-16 text-neutral-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
              />
            </svg>
            <p className="mb-1 text-lg font-medium">Brak wizyt</p>
            <p className="text-sm">Dodaj pierwszą wizytę, aby rozpocząć</p>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default AppointmentsPage
