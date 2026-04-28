import { useState, useMemo } from 'react'
import { Card, Button, PageLoader, Input } from '@shared/components'
import { MaterialCard, MaterialFilters as MaterialFiltersComponent } from '../components'
import {
  useGetMaterialsQuery,
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation,
  usePublishMaterialMutation,
  useUnpublishMaterialMutation,
} from '../api/materialApi'
import type {
  EducationalMaterial,
  MaterialFormData,
  MaterialType,
  DifficultyLevel,
} from '../types/material.types'

/**
 * MaterialAdminPage Component
 *
 * Staff-facing page for managing educational materials
 */
export const MaterialAdminPage = () => {
  // Local state
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | undefined>()
  const [selectedType, setSelectedType] = useState<MaterialType | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [showPublished, setShowPublished] = useState<boolean | undefined>()
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<EducationalMaterial | null>(null)

  // Mock project ID - in real app, get from context
  const projectId = '00000000-0000-0000-0000-000000000000'

  // RTK Query hooks
  const {
    data: materials = [],
    isLoading,
    refetch,
  } = useGetMaterialsQuery({
    project_id: projectId,
    category: selectedCategory,
    difficulty: selectedDifficulty,
    type: selectedType,
    published: showPublished,
  })
  const [createMaterial] = useCreateMaterialMutation()
  const [updateMaterial] = useUpdateMaterialMutation()
  const [deleteMaterial] = useDeleteMaterialMutation()
  const [publishMaterial] = usePublishMaterialMutation()
  const [unpublishMaterial] = useUnpublishMaterialMutation()

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
      // Search filter
      if (searchQuery && !material.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      return true
    })
  }, [materials, searchQuery])

  // Handlers
  const handleCreateClick = () => {
    setEditingMaterial(null)
    setIsFormModalOpen(true)
  }

  const handleEditClick = (material: EducationalMaterial) => {
    setEditingMaterial(material)
    setIsFormModalOpen(true)
  }

  const handleDeleteClick = async (material: EducationalMaterial) => {
    if (window.confirm(`Czy na pewno chcesz usunąć materiał "${material.title}"?`)) {
      try {
        await deleteMaterial(material.id).unwrap()
        refetch()
      } catch (err) {
        console.error('Failed to delete material:', err)
      }
    }
  }

  const handlePublishClick = async (material: EducationalMaterial) => {
    try {
      if (material.published) {
        await unpublishMaterial(material.id).unwrap()
      } else {
        await publishMaterial(material.id).unwrap()
      }
      refetch()
    } catch (err) {
      console.error('Failed to publish/unpublish material:', err)
    }
  }

  const handleFormSubmit = async (data: MaterialFormData) => {
    try {
      if (editingMaterial) {
        await updateMaterial({ id: editingMaterial.id, material: data }).unwrap()
      } else {
        await createMaterial({
          ...data,
          project_id: projectId,
          created_by: '00000000-0000-0000-0000-000000000000', // Mock user ID
        }).unwrap()
      }
      setIsFormModalOpen(false)
      setEditingMaterial(null)
      refetch()
    } catch (err) {
      console.error('Failed to save material:', err)
    }
  }

  const handleModalClose = () => {
    setIsFormModalOpen(false)
    setEditingMaterial(null)
  }

  const handleClearFilters = () => {
    setSelectedCategory(undefined)
    setSelectedDifficulty(undefined)
    setSelectedType(undefined)
    setSearchQuery('')
    setShowPublished(undefined)
  }

  const hasActiveFilters =
    selectedCategory ||
    selectedDifficulty ||
    selectedType ||
    searchQuery !== '' ||
    showPublished !== undefined

  if (isLoading) {
    return <PageLoader size="lg" text="Ładowanie materiałów..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Zarządzanie materiałami</h1>
          <p className="mt-1 text-neutral-600">Twórz i zarządzaj materiałami edukacyjnymi</p>
        </div>
        <Button variant="primary" onClick={handleCreateClick}>
          <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Dodaj materiał
        </Button>
      </div>

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

          {/* Published filter */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-neutral-600">Status publikacji:</span>
            <button
              onClick={() => setShowPublished(undefined)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                showPublished === undefined
                  ? 'border-primary-200 bg-primary-50 text-primary-700'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
              }`}
            >
              Wszystkie
            </button>
            <button
              onClick={() => setShowPublished(true)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                showPublished === true
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
              }`}
            >
              Opublikowane
            </button>
            <button
              onClick={() => setShowPublished(false)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                showPublished === false
                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
              }`}
            >
              Nieopublikowane
            </button>

            {hasActiveFilters ? (
              <button
                onClick={handleClearFilters}
                className="ml-auto text-sm font-medium text-primary-600 hover:text-primary-700"
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
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <h3 className="text-lg font-semibold text-neutral-900">Brak materiałów</h3>
              <p className="mt-2 text-neutral-600">
                {hasActiveFilters
                  ? 'Nie znaleziono materiałów pasujących do wybranych filtrów'
                  : 'Nie masz jeszcze żadnych materiałów edukacyjnych'}
              </p>
              <Button variant="primary" onClick={handleCreateClick} className="mt-4">
                Dodaj pierwszy materiał
              </Button>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMaterials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onPublish={handlePublishClick}
              showStats
              isStaff
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      {isFormModalOpen ? (
        <MaterialFormModal
          isOpen={isFormModalOpen}
          onClose={handleModalClose}
          onSubmit={handleFormSubmit}
          material={editingMaterial}
        />
      ) : null}
    </div>
  )
}

/**
 * MaterialFormModal Component
 */
interface MaterialFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: MaterialFormData) => void
  material?: EducationalMaterial | null
}

const MaterialFormModal = ({ isOpen, onClose, onSubmit, material }: MaterialFormModalProps) => {
  const [formData, setFormData] = useState<MaterialFormData>({
    title: material?.title || '',
    content: material?.content || '',
    type: material?.type || 'ARTICLE',
    category: material?.category || '',
    difficulty: material?.difficulty || 'BASIC',
    file_url: material?.file_url || '',
    external_url: material?.external_url || '',
    published: material?.published || false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="border-b border-neutral-200 p-6">
          <h2 className="text-xl font-bold text-neutral-900">
            {material ? 'Edytuj materiał' : 'Dodaj materiał'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Tytuł *</label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              fullWidth
            />
          </div>

          {/* Type */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Typ materiału *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as MaterialType })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="ARTICLE">Artykuł</option>
              <option value="PDF">PDF</option>
              <option value="IMAGE">Obraz</option>
              <option value="VIDEO">Wideo</option>
              <option value="LINK">Link</option>
              <option value="AUDIO">Audio</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Kategoria</label>
            <Input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="np. Cukrzyca, Nadciśnienie"
              fullWidth
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Poziom trudności *
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) =>
                setFormData({ ...formData, difficulty: e.target.value as DifficultyLevel })
              }
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="BASIC">Podstawowy</option>
              <option value="INTERMEDIATE">Średniozaawansowany</option>
              <option value="ADVANCED">Zaawansowany</option>
            </select>
          </div>

          {/* Content (for articles) */}
          {formData.type === 'ARTICLE' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Treść *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                rows={8}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Treść artykułu w formacie HTML..."
              />
            </div>
          )}

          {/* File URL */}
          {['PDF', 'IMAGE', 'VIDEO', 'AUDIO'].includes(formData.type) && (
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">URL pliku *</label>
              <Input
                type="url"
                value={formData.file_url}
                onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                required
                placeholder="https://..."
                fullWidth
              />
            </div>
          )}

          {/* External URL */}
          {formData.type === 'LINK' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">URL linku *</label>
              <Input
                type="url"
                value={formData.external_url}
                onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                required
                placeholder="https://..."
                fullWidth
              />
            </div>
          )}

          {/* Published */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="published" className="text-sm text-neutral-700">
              Opublikuj materiał
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Anuluj
            </Button>
            <Button type="submit" variant="primary">
              {material ? 'Zapisz zmiany' : 'Dodaj materiał'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MaterialAdminPage
