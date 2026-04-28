import { useParams, useNavigate } from 'react-router-dom'
import { PageLoader } from '@shared/components'
import { MaterialViewer } from '../components'
import {
  useGetMaterialByIdQuery,
  useRecordViewMutation,
  useMarkAsCompleteMutation,
} from '../api/materialApi'

/**
 * MaterialViewerPage Component
 *
 * Full-page viewer for educational materials
 */
export const MaterialViewerPage = () => {
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
  const [recordView] = useRecordViewMutation()
  const [markAsComplete] = useMarkAsCompleteMutation()

  // Handlers
  const handleClose = () => {
    navigate('/materials')
  }

  const handleComplete = async () => {
    if (!id) return

    try {
      await recordView({ id, patientId }).unwrap()
      await markAsComplete({ id, patientId }).unwrap()
      handleClose()
    } catch (err) {
      console.error('Failed to complete material:', err)
    }
  }

  if (!id) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-600">Brak ID materiału</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PageLoader size="lg" text="Ładowanie materiału..." />
      </div>
    )
  }

  if (error || !material) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-error-600">Materiał nie został znaleziony</p>
          <button onClick={handleClose} className="mt-4 text-primary-600 hover:text-primary-700">
            Powrót do materiałów
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-4xl p-6">
        <MaterialViewer material={material} onClose={handleClose} onComplete={handleComplete} />
      </div>
    </div>
  )
}

export default MaterialViewerPage
