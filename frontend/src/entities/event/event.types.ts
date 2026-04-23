/**
 * Type of therapy event.
 */
export type EventType =
  | 'VISIT'
  | 'SESSION'
  | 'MEDICATION'
  | 'EXERCISE'
  | 'MEASUREMENT'
  | 'OTHER'

/**
 * Status of a therapy event.
 */
export type EventStatus =
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'MISSED'
  | 'CANCELLED'

/**
 * Reminders configuration for therapy events.
 */
export interface Reminders {
  reminder_24h: boolean
  reminder_2h: boolean
  reminder_30min: boolean
}

/**
 * Therapy event entity.
 */
export interface TherapyEvent {
  id: string
  project_id: string
  patient_id: string | null
  title: string
  description: string | null
  type: EventType
  scheduled_at: string
  ends_at: string | null
  location: string | null
  status: EventStatus
  is_cyclic: boolean
  recurrence_rule: string | null
  completed_at: string | null
  patient_notes: string | null
  reminders: Reminders | null
  created_at: string
  updated_at: string
}

/**
 * Request DTO for creating a therapy event.
 */
export interface CreateTherapyEventRequest {
  project_id: string
  patient_id?: string | null
  title: string
  description?: string | null
  type: EventType
  scheduled_at: string
  ends_at?: string | null
  location?: string | null
  is_cyclic?: boolean
  recurrence_rule?: string | null
  reminders?: Reminders
}

/**
 * Request DTO for updating a therapy event.
 */
export interface UpdateTherapyEventRequest {
  title?: string
  description?: string | null
  type?: EventType
  scheduled_at?: string
  ends_at?: string | null
  location?: string | null
  is_cyclic?: boolean
  recurrence_rule?: string | null
  reminders?: Reminders
}

/**
 * Request DTO for completing a therapy event.
 */
export interface CompleteEventRequest {
  patient_notes?: string | null
}

/**
 * Filters for getting calendar events.
 */
export interface CalendarEventFilters {
  patientId?: string
  type?: EventType
  status?: EventStatus
  startDate?: string
  endDate?: string
}

/**
 * Event type display labels.
 */
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  VISIT: 'Wizyta',
  SESSION: 'Sesja terapeutyczna',
  MEDICATION: 'Leki',
  EXERCISE: 'Ćwiczenie',
  MEASUREMENT: 'Pomiar',
  OTHER: 'Inne',
}

/**
 * Event type colors.
 */
export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  VISIT: 'blue',
  SESSION: 'purple',
  MEDICATION: 'red',
  EXERCISE: 'green',
  MEASUREMENT: 'yellow',
  OTHER: 'gray',
}

/**
 * Event status display labels.
 */
export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  SCHEDULED: 'Zaplanowane',
  COMPLETED: 'Wykonane',
  MISSED: 'Przeterminowane',
  CANCELLED: 'Anulowane',
}

/**
 * Event status colors.
 */
export const EVENT_STATUS_COLORS: Record<EventStatus, string> = {
  SCHEDULED: 'blue',
  COMPLETED: 'green',
  MISSED: 'red',
  CANCELLED: 'gray',
}
