import { useState, useMemo } from 'react'
import { Card, PageLoader } from '@shared/components'
import {
  MaterialCard,
  MaterialFilters as MaterialFiltersComponent,
  ProgressList,
} from '../components'
import {
  useGetPatientMaterialsQuery,
  useGetPatientProgressQuery,
  useRecordViewMutation,
} from '../api/materialApi'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@app/store'
import { selectUser } from '@features/auth/slices/authSlice'
import type {
  EducationalMaterial,
  MaterialProgress,
  MaterialType,
  DifficultyLevel,
} from '../types/material.types'

const STAFF_ROLES = ['ADMIN', 'DOCTOR', 'COORDINATOR', 'NURSE', 'THERAPIST']

/**
 * MaterialsPage Component
 *
 * Patient-facing page for viewing and accessing educational materials
 */
export const MaterialsPage = () => {
  const navigate = useNavigate()
  const currentUser = useAppSelector(selectUser)
  const isStaff = !!currentUser?.role && STAFF_ROLES.includes(currentUser.role)

  // Mock patient ID - in real app, get from auth context
  const patientId = '00000000-0000-0000-0000-000000000000'

  // Local state
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | undefined>()
  const [selectedType, setSelectedType] = useState<MaterialType | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed'>(
    'all'
  )

  // RTK Query hooks
  const { data: materials = [], isLoading: isLoadingMaterials } =
    useGetPatientMaterialsQuery(patientId)
  const { data: progressRecords = [], isLoading: isLoadingProgress } =
    useGetPatientProgressQuery(patientId)
  const [recordView] = useRecordViewMutation()

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
      if (
        filterStatus === 'pending' &&
        progress?.status !== 'PENDING' &&
        progress?.status !== undefined
      ) {
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
  }, [
    materials,
    progressMap,
    filterStatus,
    selectedCategory,
    selectedDifficulty,
    selectedType,
    searchQuery,
  ])

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

  const handleClearFilters = () => {
    setSelectedCategory(undefined)
    setSelectedDifficulty(undefined)
    setSelectedType(undefined)
    setSearchQuery('')
    setFilterStatus('all')
  }

  const hasActiveFilters =
    selectedCategory || selectedDifficulty || selectedType || searchQuery || filterStatus !== 'all'

  if (isLoadingMaterials || isLoadingProgress) {
    return <PageLoader size="lg" text="Ładowanie materiałów..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Materiały edukacyjne</h1>
          <p className="mt-1 text-neutral-600">Przeglądaj i czytaj materiały edukacyjne</p>
        </div>
        {isStaff ? (
          <button
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            data-testid="materials-go-admin"
            onClick={() => navigate('/materials/admin')}
          >
            Zarządzaj materiałami
          </button>
        ) : null}
      </div>

      {/* Progress Summary */}
      {progressStats.total > 0 && (
        <Card variant="outlined">
          <Card.Body>
            <ProgressList
              completed={progressStats.completed}
              inProgress={progressStats.inProgress}
              pending={progressStats.pending}
              total={progressStats.total}
            />
          </Card.Body>
        </Card>
      )}

      {/* Filters */}
      <Card variant="outlined">
        <Card.Body>
          <MaterialFiltersComponent
            categories={categories}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            selectedDifficulty={selectedDifficulty}
            selectedType={selectedType}
            onCategoryChange={setSelectedCategory}
            onClearFilters={handleClearFilters}
            onDifficultyChange={setSelectedDifficulty}
            onSearchChange={setSearchQuery}
            onTypeChange={setSelectedType}
          />

          {/* Status filter */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-neutral-600">Status:</span>
            <button
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                filterStatus === 'all'
                  ? 'border-primary-200 bg-primary-50 text-primary-700'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
              }`}
              onClick={() => setFilterStatus('all')}
            >
              Wszystkie
            </button>
            <button
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                filterStatus === 'pending'
                  ? 'border-neutral-200 bg-neutral-100 text-neutral-700'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
              }`}
              onClick={() => setFilterStatus('pending')}
            >
              Do przeczytania
            </button>
            <button
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                filterStatus === 'in_progress'
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
              }`}
              onClick={() => setFilterStatus('in_progress')}
            >
              W trakcie
            </button>
            <button
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                filterStatus === 'completed'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
              }`}
              onClick={() => setFilterStatus('completed')}
            >
              Ukończone
            </button>

            {hasActiveFilters ? (
              <button
                className="ml-auto text-sm font-medium text-primary-600 hover:text-primary-700"
                onClick={handleClearFilters}
              >
                Wyczyść filtry
              </button>
            ) : null}
          </div>
        </Card.Body>
      </Card>

      {/* Materials Grid */}
      {filteredMaterials.length === 0 ? (
        <Card variant="outlined">
          <Card.Body>
            <div className="py-12 text-center">
              <svg
                className="mx-auto mb-4 h-16 w-16 text-neutral-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                />
              </svg>
              <h3 className="text-lg font-semibold text-neutral-900">Brak materiałów</h3>
              <p className="mt-2 text-neutral-600">
                {hasActiveFilters
                  ? 'Nie znaleziono materiałów pasujących do wybranych filtrów'
                  : 'Nie masz jeszcze przypisanych żadnych materiałów edukacyjnych'}
              </p>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMaterials.map((material) => (
            <MaterialCard
              key={material.id}
              compact
              isStaff={false}
              material={material}
              onClick={handleMaterialClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default MaterialsPage
