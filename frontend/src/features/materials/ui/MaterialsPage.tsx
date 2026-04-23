import { useState, useMemo } from 'react'
import { Card, Button, PageLoader } from '@shared/components'
import {
  MaterialCard,
  MaterialFilters as MaterialFiltersComponent,
  ProgressList,
} from '../components'
import {
  useGetPatientMaterialsQuery,
  useGetPatientProgressQuery,
  useRecordViewMutation,
  useMarkAsCompleteMutation,
} from '../api/materialApi'
import { useNavigate } from 'react-router-dom'
import type { EducationalMaterial, MaterialProgress, MaterialType, DifficultyLevel } from '../types/material.types'

/**
 * MaterialsPage Component
 *
 * Patient-facing page for viewing and accessing educational materials
 */
export const MaterialsPage = () => {
  const navigate = useNavigate()

  // Mock patient ID - in real app, get from auth context
  const patientId = '00000000-0000-0000-0000-000000000000'

  // Local state
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | undefined>()
  const [selectedType, setSelectedType] = useState<MaterialType | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all')

  // RTK Query hooks
  const { data: materials = [], isLoading: isLoadingMaterials } = useGetPatientMaterialsQuery(patientId)
  const { data: progressRecords = [], isLoading: isLoadingProgress } = useGetPatientProgressQuery(patientId)
  const [recordView] = useRecordViewMutation()
  const [markAsComplete] = useMarkAsCompleteMutation()

  // Create progress map
  const progressMap = useMemo(() => {
    const map = new Map<string, MaterialProgress>()
    progressRecords?.forEach((p) => {
      map.set(p.material_id, p)
    })
    return map
  }, [progressRecords])

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>()
    materials.forEach((m) => {
      if (m.category) cats.add(m.category)
    })
    return Array.from(cats)
  }, [materials])

  // Filter materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      // Status filter
      const progress = progressMap.get(material.id)
      if (filterStatus === 'pending' && progress?.status !== 'PENDING' && progress?.status !== undefined) {
        return false
      }
      if (filterStatus === 'in_progress' && progress?.status !== 'IN_PROGRESS') {
        return false
      }
      if (filterStatus === 'completed' && progress?.status !== 'COMPLETED') {
        return false
      }

      // Category filter
      if (selectedCategory && material.category !== selectedCategory) {
        return false
      }

      // Difficulty filter
      if (selectedDifficulty && material.difficulty !== selectedDifficulty) {
        return false
      }

      // Type filter
      if (selectedType && material.type !== selectedType) {
        return false
      }

      // Search filter
      if (searchQuery && !material.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      return true
    })
  }, [materials, progressMap, filterStatus, selectedCategory, selectedDifficulty, selectedType, searchQuery])

  // Calculate progress stats
  const progressStats = useMemo(() => {
    const total = materials.length
    const completed = progressRecords?.filter((p) => p.status === 'COMPLETED').length || 0
    const inProgress = progressRecords?.filter((p) => p.status === 'IN_PROGRESS').length || 0
    const pending = total - completed - inProgress

    return { total, completed, inProgress, pending }
  }, [materials, progressRecords])

  // Handlers
  const handleMaterialClick = async (material: EducationalMaterial) => {
    // Record view
    try {
      await recordView({ id: material.id, patientId }).unwrap()
    } catch (err) {
      console.error('Failed to record view:', err)
    }

    // Navigate to detail page
    navigate(`/materials/${material.id}`)
  }

  const handleComplete = async (materialId: string) => {
    try {
      await markAsComplete({ id: materialId, patientId }).unwrap()
    } catch (err) {
      console.error('Failed to mark as complete:', err)
    }
  }

  const handleClearFilters = () => {
    setSelectedCategory(undefined)
    setSelectedDifficulty(undefined)
    setSelectedType(undefined)
    setSearchQuery('')
    setFilterStatus('all')
  }

  const hasActiveFilters = selectedCategory || selectedDifficulty || selectedType || searchQuery || filterStatus !== 'all'

  if (isLoadingMaterials || isLoadingProgress) {
    return <PageLoader size="lg" text="Ładowanie materiałów..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Materiały edukacyjne</h1>
        <p className="text-neutral-600 mt-1">Przeglądaj i czytaj materiały edukacyjne</p>
      </div>

      {/* Progress Summary */}
      {progressStats.total > 0 && (
        <Card variant="outlined">
          <Card.Body>
            <ProgressList
              total={progressStats.total}
              completed={progressStats.completed}
              inProgress={progressStats.inProgress}
              pending={progressStats.pending}
            />
          </Card.Body>
        </Card>
      )}

      {/* Filters */}
      <Card variant="outlined">
        <Card.Body>
          <MaterialFiltersComponent
            categories={categories}
            selectedCategory={selectedCategory}
            selectedDifficulty={selectedDifficulty}
            selectedType={selectedType}
            searchQuery={searchQuery}
            onCategoryChange={setSelectedCategory}
            onDifficultyChange={setSelectedDifficulty}
            onTypeChange={setSelectedType}
            onSearchChange={setSearchQuery}
            onClearFilters={handleClearFilters}
          />

          {/* Status filter */}
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-neutral-600">Status:</span>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                filterStatus === 'all'
                  ? 'bg-primary-50 border-primary-200 text-primary-700'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
              }`}
            >
              Wszystkie
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-neutral-100 border-neutral-200 text-neutral-700'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
              }`}
            >
              Do przeczytania
            </button>
            <button
              onClick={() => setFilterStatus('in_progress')}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                filterStatus === 'in_progress'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
              }`}
            >
              W trakcie
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                filterStatus === 'completed'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
              }`}
            >
              Ukończone
            </button>

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="ml-auto text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Wyczyść filtry
              </button>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Materials Grid */}
      {filteredMaterials.length === 0 ? (
        <Card variant="outlined">
          <Card.Body>
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-neutral-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <h3 className="text-lg font-semibold text-neutral-900">Brak materiałów</h3>
              <p className="text-neutral-600 mt-2">
                {hasActiveFilters
                  ? 'Nie znaleziono materiałów pasujących do wybranych filtrów'
                  : 'Nie masz jeszcze przypisanych żadnych materiałów edukacyjnych'}
              </p>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onClick={handleMaterialClick}
              compact
              isStaff={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default MaterialsPage
