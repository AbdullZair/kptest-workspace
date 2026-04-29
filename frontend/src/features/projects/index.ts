// Projects feature barrel export
export * from './types'
export * from './api/projectApi'
// UI components — re-export with renames where they clash with type names
export {
  ProjectCard,
  ProjectStatus as ProjectStatusBadge,
  ProjectStatistics as ProjectStatisticsComponent,
  ProjectFormModal,
  PatientAssignmentModal,
} from './ui'
