/**
 * Patient Types
 * TypeScript types for patient management
 */

/**
 * Patient entity
 */
export interface Patient {
  id: string
  pesel: string
  first_name: string
  last_name: string
  date_of_birth?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN'
  email?: string
  phone?: string
  address_street?: string
  address_city?: string
  address_postal_code?: string
  his_patient_id?: string
  verification_status: VerificationStatus
  verified_at?: string
  verified_by?: string
  verification_method?: string
  created_at: string
  updated_at: string
}

/**
 * Verification status for patient identity verification
 */
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

/**
 * Patient DTO for creating and updating
 */
export interface PatientDto {
  id?: string
  pesel: string
  first_name: string
  last_name: string
  date_of_birth?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN'
  email?: string
  phone?: string
  address_street?: string
  address_city?: string
  address_postal_code?: string
  his_patient_id?: string
  verification_status?: VerificationStatus
}

/**
 * Patient search request filters
 */
export interface PatientSearchRequest {
  pesel?: string
  name?: string
  his_patient_id?: string
  status?: string[]
  verification_status?: VerificationStatus[]
  project?: string
  page?: number
  size?: number
  sort?: string
  sort_order?: 'asc' | 'desc'
}

/**
 * Patient search response with pagination
 */
export interface PatientSearchResponse {
  data: Patient[]
  total: number
  page: number
  size: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
}

/**
 * Patient verification request for HIS
 */
export interface PatientVerifyRequest {
  pesel: string
  cart_number: string
}

/**
 * Patient verification response from HIS
 */
export interface PatientVerifyResponse {
  verified: boolean
  his_patient_id?: string
  pesel?: string
  first_name?: string
  last_name?: string
  date_of_birth?: string
  message: string
}

/**
 * Patient form data for create/edit
 */
export interface PatientFormData {
  pesel: string
  first_name: string
  last_name: string
  date_of_birth?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN'
  email?: string
  phone?: string
  address_street?: string
  address_city?: string
  address_postal_code?: string
  his_patient_id?: string
}

/**
 * Patient table filters
 */
export interface PatientTableFilters {
  pesel?: string
  name?: string
  verificationStatus?: VerificationStatus[]
  status?: string[]
}
