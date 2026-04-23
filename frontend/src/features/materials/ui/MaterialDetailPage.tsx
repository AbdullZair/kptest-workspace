import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, PageLoader } from '@shared/components'
import { MaterialViewer, MaterialTypeIcon, ProgressTracker } from '../components'
import {
  useGetMaterialByIdQuery,
  useRecordViewMutation,
  useMarkAsCompleteMutation,
} from '../api/materialApi'
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
  const { data: material, isLoading, error } = useGetMaterialByIdQuery(id!, {
    skip: !id,
  })
  const [recordView] = useRecordViewMutation()
  const [markAsComplete] = useMarkAsCompleteMutation()

  // Material progress (mock - would come from progress API)
  const materialProgress = useMemo(() => {
    // In real app, fetch from progress API
    return null
  }, [])

  const isCompleted = materialProgress?.status === 'COMPLETED'

  // Handlers
  const handleBack = () => {
    navigate('/materials')
  }

  const handleView = async () => {
    if (!id) return

    try {
      await recordView({ id, patientId }).unwrap()
    } catch (err) {
      console.error('Failed to record view:', err)
    }
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
      <div className="text-center py-12">
        <p className="text-neutral-600">Brak ID materiału</p>
        <Button variant="primary" onClick={handleBack} className="mt-4">
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
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-error-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-error-900">Błąd ładowania materiału</h3>
        <p className="text-error-600 mt-2">Materiał nie został znaleziony lub wystąpił błąd</p>
        <Button variant="primary" onClick={handleBack} className="mt-4">
          Powrót do materiałów
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <MaterialTypeIcon type={material.type} size="sm" showLabel />
            {material.category && (
              <span className="text-sm text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                {material.category}
              </span>
            )}
            {isCompleted && (
              <ProgressTracker status="COMPLETED" size="sm" showLabel={false} />
            )}
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">{material.title}</h1>
        </div>
        <Button variant="outline" size="sm" onClick={handleEdit}>
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Edytuj
        </Button>
      </div>

      {/* Material Viewer */}
      <Card variant="elevated">
        <Card.Body>
          <MaterialViewer
            material={material}
            isCompleted={isCompleted}
            onComplete={handleComplete}
            onClose={handleBack}
          />
        </Card.Body>
      </Card>

      {/* Material Info */}
      <Card variant="outlined">
        <Card.Body>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
