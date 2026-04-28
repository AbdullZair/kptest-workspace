import { memo } from 'react'
import { Card, Button } from '@shared/components'
import { VerificationStatus, type VerificationStatusType } from './VerificationStatus'
import type { Patient } from '../types'

/**
 * PatientCard component props
 */
export interface PatientCardProps {
  patient: Patient
  onClick?: (patient: Patient) => void
  onEdit?: (patient: Patient) => void
  onDelete?: (patient: Patient) => void
  compact?: boolean
}

/**
 * Format date for display
 */
const formatDate = (dateString?: string): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('pl-PL')
}

/**
 * Get gender label
 */
const getGenderLabel = (gender?: string): string => {
  if (!gender) return '-'
  const labels: Record<string, string> = {
    MALE: 'Mężczyzna',
    FEMALE: 'Kobieta',
    OTHER: 'Inna',
    UNKNOWN: 'Nieustalone',
  }
  return labels[gender] || '-'
}

/**
 * PatientCard Component
 *
 * Displays patient information in a card format
 *
 * @example
 * ```tsx
 * <PatientCard
 *   patient={patient}
 *   onClick={handleClick}
 *   onEdit={handleEdit}
 * />
 * ```
 */
export const PatientCard = memo(
  ({ patient, onClick, onEdit, onDelete, compact = false }: PatientCardProps) => {
    const handleClick = () => {
      onClick?.(patient)
    }

    const handleEditClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      onEdit?.(patient)
    }

    const handleDeleteClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      onDelete?.(patient)
    }

    return (
      <Card
        variant="interactive"
        onClick={handleClick}
        size={compact ? 'sm' : 'md'}
        className="cursor-pointer"
      >
        <div className="flex items-start justify-between gap-4">
          {/* Patient info */}
          <div className="min-w-0 flex-1">
            {/* Name and PESEL */}
            <div className="mb-2 flex items-center gap-3">
              <h3 className="truncate text-lg font-semibold text-neutral-900">
                {patient.first_name} {patient.last_name}
              </h3>
              <VerificationStatus status={patient.verification_status} size="sm" />
            </div>

            {/* Basic info grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
              <div>
                <span className="text-neutral-500">PESEL:</span>
                <span className="ml-2 font-medium text-neutral-900">{patient.pesel}</span>
              </div>

              {patient.date_of_birth ? (
                <div>
                  <span className="text-neutral-500">Data ur.:</span>
                  <span className="ml-2 text-neutral-900">{formatDate(patient.date_of_birth)}</span>
                </div>
              ) : null}

              <div>
                <span className="text-neutral-500">Płeć:</span>
                <span className="ml-2 text-neutral-900">{getGenderLabel(patient.gender)}</span>
              </div>

              {patient.his_patient_id ? (
                <div>
                  <span className="text-neutral-500">HIS ID:</span>
                  <span className="ml-2 font-mono text-xs text-neutral-900">
                    {patient.his_patient_id}
                  </span>
                </div>
              ) : null}

              {patient.phone ? (
                <div>
                  <span className="text-neutral-500">Telefon:</span>
                  <span className="ml-2 text-neutral-900">{patient.phone}</span>
                </div>
              ) : null}

              {patient.email ? (
                <div>
                  <span className="text-neutral-500">Email:</span>
                  <span className="ml-2 block max-w-[150px] truncate text-neutral-900">
                    {patient.email}
                  </span>
                </div>
              ) : null}
            </div>

            {/* Address */}
            {!compact && patient.address_city ? (
              <div className="mt-3 border-t border-neutral-100 pt-3 text-sm text-neutral-600">
                <span className="text-neutral-500">Adres:</span>{' '}
                {patient.address_street ? <span>{patient.address_street}, </span> : null}
                {patient.address_postal_code ? <span>{patient.address_postal_code} </span> : null}
                {patient.address_city}
              </div>
            ) : null}
          </div>

          {/* Actions */}
          <div className="flex flex-shrink-0 flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              aria-label="Edytuj pacjenta"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              aria-label="Usuń pacjenta"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </Button>
          </div>
        </div>
      </Card>
    )
  }
)

export default PatientCard
