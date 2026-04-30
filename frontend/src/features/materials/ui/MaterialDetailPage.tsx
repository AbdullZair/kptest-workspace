import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, PageLoader } from '@shared/components'
import { MaterialViewer, MaterialTypeIcon, ProgressTracker } from '../components'
import { useGetMaterialByIdQuery, useMarkAsCompleteMutation } from '../api/materialApi'
import { useMemo } from 'react'

/**
 * MaterialDetailPage Component
 *
 * Page for viewing material details and content
 */
export const MaterialDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Mock patient ID - in real app, get from auth context
  const patientId = '00000000-0000-0000-0000-000000000000'

  // RTK Query hooks
  const {
    data: material,
    isLoading,
    error,
  } = useGetMaterialByIdQuery(id!, {
    skip: !id,
  })
  const [markAsComplete] = useMarkAsCompleteMutation()

  // Material progress (mock - would come from progress API)
  const materialProgress = useMemo<{ status?: string } | null>(() => {
    // In real app, fetch from progress API
    return null
  }, [])

  const isCompleted = materialProgress?.status === 'COMPLETED'

  // Handlers
  const handleBack = () => {
    navigate('/materials')
  }

  const handleComplete = async () => {
    if (!id) return

    try {
      await markAsComplete({ id, patientId }).unwrap()
    } catch (err) {
      console.error('Failed to mark as complete:', err)
    }
  }

  const handleEdit = () => {
    navigate(`/materials/admin?id=${id}`)
  }

  if (!id) {
    return (
      <div className="py-12 text-center">
        <p className="text-neutral-600">Brak ID materiału</p>
        <Button className="mt-4" variant="primary" onClick={handleBack}>
          Powrót do materiałów
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return <PageLoader size="lg" text="Ładowanie materiału..." />
  }

  if (error || !material) {
    return (
      <div className="py-12 text-center">
        <svg
          className="mx-auto mb-4 h-16 w-16 text-error-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
          />
        </svg>
        <h3 className="text-lg font-semibold text-error-900">Błąd ładowania materiału</h3>
        <p className="mt-2 text-error-600">Materiał nie został znaleziony lub wystąpił błąd</p>
        <Button className="mt-4" variant="primary" onClick={handleBack}>
          Powrót do materiałów
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button size="sm" variant="ghost" onClick={handleBack}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M15 19l-7-7 7-7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </Button>
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-3">
            <MaterialTypeIcon showLabel size="sm" type={material.type} />
            {material.category ? (
              <span className="rounded bg-neutral-100 px-2 py-0.5 text-sm text-neutral-500">
                {material.category}
              </span>
            ) : null}
            {isCompleted ? (
              <ProgressTracker showLabel={false} size="sm" status="COMPLETED" />
            ) : null}
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">{material.title}</h1>
        </div>
        <Button size="sm" variant="outline" onClick={handleEdit}>
          <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          Edytuj
        </Button>
      </div>

      {/* Material Viewer */}
      <Card variant="elevated">
        <Card.Body>
          <MaterialViewer
            isCompleted={isCompleted}
            material={material}
            onClose={handleBack}
            onComplete={handleComplete}
          />
        </Card.Body>
      </Card>

      {/* Material Info */}
      <Card variant="outlined">
        <Card.Body>
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div>
              <span className="text-neutral-500">Poziom trudności:</span>
              <div className="mt-1">
                <span className="font-medium text-neutral-900">
                  {material.difficulty === 'BASIC' && 'Podstawowy'}
                  {material.difficulty === 'INTERMEDIATE' && 'Średniozaawansowany'}
                  {material.difficulty === 'ADVANCED' && 'Zaawansowany'}
                </span>
              </div>
            </div>
            <div>
              <span className="text-neutral-500">Wyświetlenia:</span>
              <div className="mt-1">
                <span className="font-medium text-neutral-900">{material.view_count}</span>
              </div>
            </div>
            <div>
              <span className="text-neutral-500">Ukończenia:</span>
              <div className="mt-1">
                <span className="font-medium text-neutral-900">{material.completion_count}</span>
              </div>
            </div>
            <div>
              <span className="text-neutral-500">Dodano:</span>
              <div className="mt-1">
                <span className="font-medium text-neutral-900">
                  {new Date(material.created_at).toLocaleDateString('pl-PL')}
                </span>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default MaterialDetailPage
