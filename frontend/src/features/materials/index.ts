/**
 * Materials Feature
 * Educational materials management for patients
 */

// Types
export * from './types/material.types'

// API
export * from './api/materialApi'

// Components — use named re-exports to avoid name collision with MaterialFilters type
export {
  MaterialCard,
  MaterialTypeIcon,
  ProgressTracker,
  DifficultyBadge,
  MaterialFilters as MaterialFiltersComponent,
  MaterialViewer,
} from './components'

// UI / Pages
export * from './ui'
