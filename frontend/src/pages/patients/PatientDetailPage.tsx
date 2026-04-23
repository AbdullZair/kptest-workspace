import { useParams } from 'react-router-dom'
import { Card, Button } from '@shared/components'

/**
 * PatientDetailPage Component
 *
 * Single patient detail page
 */
export const PatientDetailPage = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Szczegóły pacjenta</h1>
          <p className="text-neutral-600 mt-1">ID: {id}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Edytuj</Button>
          <Button variant="primary">Nowa wizyta</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient info */}
        <Card variant="elevated" className="lg:col-span-2">
          <Card.Header>
            <h2 className="text-lg font-semibold text-neutral-900">Informacje o pacjencie</h2>
          </Card.Header>
          <Card.Body>
            <div className="text-center py-12 text-neutral-500">
              <p>Brak danych pacjenta</p>
            </div>
          </Card.Body>
        </Card>

        {/* Quick actions */}
        <Card variant="elevated">
          <Card.Header>
            <h2 className="text-lg font-semibold text-neutral-900">Szybkie akcje</h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-3">
              <Button variant="outline" fullWidth>Historia wizyt</Button>
              <Button variant="outline" fullWidth>Wyniki badań</Button>
              <Button variant="outline" fullWidth>Recepty</Button>
              <Button variant="outline" fullWidth>Dokumenty</Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}

export default PatientDetailPage
