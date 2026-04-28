import { memo, useMemo } from 'react'
import { Input, Button } from '@shared/components'
import type { DifficultyLevel, MaterialType } from '../types/material.types'

/**
 * MaterialFilters component props
 */
export interface MaterialFiltersProps {
  categories?: string[]
  selectedCategory?: string
  selectedDifficulty?: DifficultyLevel
  selectedType?: MaterialType
  searchQuery?: string
  onCategoryChange?: (category: string | undefined) => void
  onDifficultyChange?: (difficulty: DifficultyLevel | undefined) => void
  onTypeChange?: (type: MaterialType | undefined) => void
  onSearchChange?: (query: string) => void
  onClearFilters?: () => void
  compact?: boolean
}

/**
 * Material type options
 */
const MATERIAL_TYPE_OPTIONS: { value: MaterialType; label: string }[] = [
  { value: 'ARTICLE', label: 'Artykuł' },
  { value: 'PDF', label: 'PDF' },
  { value: 'IMAGE', label: 'Obraz' },
  { value: 'VIDEO', label: 'Wideo' },
  { value: 'LINK', label: 'Link' },
  { value: 'AUDIO', label: 'Audio' },
]

/**
 * Difficulty level options
 */
const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string }[] = [
  { value: 'BASIC', label: 'Podstawowy' },
  { value: 'INTERMEDIATE', label: 'Średniozaawansowany' },
  { value: 'ADVANCED', label: 'Zaawansowany' },
]

/**
 * MaterialFilters Component
 *
 * Filters for educational materials
 *
 * @example
 * ```tsx
 * <MaterialFilters
 *   categories={['Diabetes', 'Hypertension']}
 *   selectedCategory={category}
 *   onCategoryChange={setCategory}
 *   onSearchChange={setSearch}
 * />
 * ```
 */
export const MaterialFilters = memo(
  ({
    categories = [],
    selectedCategory,
    selectedDifficulty,
    selectedType,
    searchQuery,
    onCategoryChange,
    onDifficultyChange,
    onTypeChange,
    onSearchChange,
    onClearFilters,
    compact = false,
  }: MaterialFiltersProps) => {
    const hasActiveFilters = useMemo(() => {
      return !!(selectedCategory || selectedDifficulty || selectedType || searchQuery)
    }, [selectedCategory, selectedDifficulty, selectedType, searchQuery])

    const handleClearFilters = () => {
      onClearFilters?.()
    }

    return (
      <div className="space-y-4">
        {/* Search */}
        <div>
          <Input
            type="text"
            placeholder="Szukaj materiałów..."
            value={searchQuery || ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
            leftIcon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
            fullWidth
          />
        </div>

        {/* Filters */}
        <div className={compact ? 'flex flex-wrap gap-2' : 'grid grid-cols-1 gap-4 sm:grid-cols-3'}>
          {/* Category filter */}
          {categories.length > 0 && (
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Kategoria</label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => onCategoryChange?.(e.target.value || undefined)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Wszystkie</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Difficulty filter */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Poziom trudności
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onDifficultyChange?.(undefined)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  !selectedDifficulty
                    ? 'border-primary-200 bg-primary-50 text-primary-700'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                }`}
              >
                Wszystkie
              </button>
              {DIFFICULTY_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onDifficultyChange?.(value)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                    selectedDifficulty === value
                      ? 'border-primary-200 bg-primary-50 text-primary-700'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Type filter */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Typ materiału</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onTypeChange?.(undefined)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  !selectedType
                    ? 'border-primary-200 bg-primary-50 text-primary-700'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                }`}
              >
                Wszystkie
              </button>
              {MATERIAL_TYPE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onTypeChange?.(value)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                    selectedType === value
                      ? 'border-primary-200 bg-primary-50 text-primary-700'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clear filters */}
        {hasActiveFilters ? (
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Wyczyść filtry
            </Button>
          </div>
        ) : null}
      </div>
    )
  }
)

export default MaterialFilters
