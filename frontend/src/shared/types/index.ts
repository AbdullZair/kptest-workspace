/**
 * User entity types
 */
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  avatarUrl?: string
  phone?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

/**
 * User role types
 */
export type UserRole = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST' | 'PATIENT'

/**
 * Authentication types
 * Basic auth types for shared usage
 * For extended auth types, see @features/auth/types
 */
export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

/**
 * Pagination types
 */
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * API response types
 */
export interface ApiResponse<T> {
  data: T
  message?: string
  status: number
  timestamp: string
}

export interface ApiError {
  status: number
  message: string
  code?: string
  details?: Record<string, string[]>
  timestamp: string
}

/**
 * Common entity types for medical application
 */
export interface Patient {
  id: string
  pesel: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  email: string
  phone: string
  address: Address
  emergencyContact?: EmergencyContact
  medicalRecordNumber: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Address {
  street: string
  city: string
  postalCode: string
  country: string
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
}

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  date: string
  time: string
  duration: number
  type: AppointmentType
  status: AppointmentStatus
  notes?: string
  reason?: string
  createdAt: string
  updatedAt: string
}

export type AppointmentType = 'CHECKUP' | 'FOLLOW_UP' | 'CONSULTATION' | 'PROCEDURE' | 'EMERGENCY'

export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

export interface MedicalRecord {
  id: string
  patientId: string
  doctorId: string
  appointmentId?: string
  diagnosis?: string
  treatment?: string
  notes: string
  attachments?: Attachment[]
  createdAt: string
  updatedAt: string
}

export interface Attachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedAt: string
}

export interface Prescription {
  id: string
  patientId: string
  doctorId: string
  medications: PrescriptionMedication[]
  notes?: string
  validUntil: string
  createdAt: string
}

export interface PrescriptionMedication {
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}

export interface LabResult {
  id: string
  patientId: string
  testType: string
  testDate: string
  results: LabResultItem[]
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
  notes?: string
  doctorId?: string
  createdAt: string
}

export interface LabResultItem {
  name: string
  value: string
  unit: string
  referenceRange?: string
  flag?: 'LOW' | 'HIGH' | 'NORMAL'
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: string
  readAt?: string
}

export type NotificationType = 'INFO' | 'WARNING' | 'ERROR' | 'APPOINTMENT_REMINDER' | 'NEW_MESSAGE'

export interface Settings {
  id: string
  userId: string
  theme: 'light' | 'dark' | 'system'
  language: 'pl' | 'en'
  notifications: NotificationSettings
  createdAt: string
  updatedAt: string
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  appointmentReminders: boolean
  newsletter: boolean
}
