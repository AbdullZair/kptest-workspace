import { memo, useEffect, useState, useCallback } from 'react'
import { Button, Input, Card } from '@shared/components'
import type { Patient, PatientFormData } from '../types'

/**
 * PatientFormModal props
 */
export interface PatientFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PatientFormData) => void
  patient?: Patient | null
  isLoading?: boolean
}

/**
 * Gender options
 */
const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Mężczyzna' },
  { value: 'FEMALE', label: 'Kobieta' },
  { value: 'OTHER', label: 'Inna' },
  { value: 'UNKNOWN', label: 'Nieustalone' },
] as const

/**
 * Initial form state
 */
const initialFormState: PatientFormData = {
  pesel: '',
  first_name: '',
  last_name: '',
  date_of_birth: '',
  gender: undefined,
  email: '',
  phone: '',
  address_street: '',
  address_city: '',
  address_postal_code: '',
  his_patient_id: '',
}

/**
 * PatientFormModal Component
 *
 * Modal form for creating and editing patients
 *
 * @example
 * ```tsx
 * <PatientFormModal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   onSubmit={handleSubmit}
 *   patient={editingPatient}
 * />
 * ```
 */
export const PatientFormModal = memo(
  ({ isOpen, onClose, onSubmit, patient, isLoading = false }: PatientFormModalProps) => {
    const [formData, setFormData] = useState<PatientFormData>(initialFormState)
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Reset form when patient changes or modal opens/closes
    useEffect(() => {
      if (isOpen && patient) {
        setFormData({
          pesel: patient.pesel || '',
          first_name: patient.first_name || '',
          last_name: patient.last_name || '',
          date_of_birth: patient.date_of_birth || '',
          gender: patient.gender,
          email: patient.email || '',
          phone: patient.phone || '',
          address_street: patient.address_street || '',
          address_city: patient.address_city || '',
          address_postal_code: patient.address_postal_code || '',
          his_patient_id: patient.his_patient_id || '',
        })
      } else if (isOpen) {
        setFormData(initialFormState)
      }
      setErrors({})
    }, [isOpen, patient])

    const handleChange = useCallback(
      (field: keyof PatientFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        // Clear error for this field
        if (errors[field]) {
          setErrors((prev) => {
            const newErrors = { ...prev }
            delete newErrors[field]
            return newErrors
          })
        }
      },
      [errors]
    )

    const validateForm = (): boolean => {
      const newErrors: Record<string, string> = {}

      // Validate PESEL
      if (!formData.pesel?.trim()) {
        newErrors.pesel = 'PESEL jest wymagany'
      } else if (!/^\d{11}$/.test(formData.pesel)) {
        newErrors.pesel = 'PESEL musi zawierać 11 cyfr'
      }

      // Validate first name
      if (!formData.first_name?.trim()) {
        newErrors.first_name = 'Imię jest wymagane'
      }

      // Validate last name
      if (!formData.last_name?.trim()) {
        newErrors.last_name = 'Nazwisko jest wymagane'
      }

      // Validate email if provided
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Nieprawidłowy format email'
      }

      // Validate phone if provided
      if (formData.phone && !/^[\d\s+-]{9,15}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Nieprawidłowy format numeru telefonu'
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateForm()) {
        return
      }

      // Remove empty fields
      const cleanData = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== '' && value !== undefined)
      ) as PatientFormData

      onSubmit(cleanData)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (!isOpen) return null

    const isEditing = !!patient

    return (
      <div
        aria-labelledby="modal-title"
        aria-modal="true"
        className="fixed inset-0 z-50 overflow-y-auto"
        role="dialog"
        onKeyDown={handleKeyDown}
      >
        {/* Backdrop */}
        <div
          aria-hidden="true"
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="flex min-h-full items-center justify-center p-4">
          <Card className="relative z-10 w-full max-w-2xl" size="lg" variant="elevated">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between border-b border-neutral-200 pb-4">
              <h2 className="text-xl font-semibold text-neutral-900" id="modal-title">
                {isEditing ? 'Edytuj pacjenta' : 'Dodaj pacjenta'}
              </h2>
              <button
                aria-label="Zamknij"
                className="text-neutral-400 transition-colors hover:text-neutral-600"
                onClick={onClose}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form className="space-y-4" data-testid="patient-form" onSubmit={handleSubmit}>
              {/* Personal Information Section */}
              <div>
                <h3 className="mb-3 text-sm font-medium text-neutral-900">Dane osobowe</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    required
                    data-testid="patient-pesel"
                    disabled={isLoading}
                    error={errors.pesel}
                    label="PESEL *"
                    placeholder="90010112345"
                    value={formData.pesel}
                    variant={errors.pesel ? 'error' : 'default'}
                    onChange={(e) => handleChange('pesel', e.target.value)}
                  />

                  <Input
                    disabled={isLoading}
                    label="HIS ID"
                    placeholder="HIS-123456"
                    value={formData.his_patient_id}
                    onChange={(e) => handleChange('his_patient_id', e.target.value)}
                  />

                  <Input
                    required
                    data-testid="patient-firstName"
                    disabled={isLoading}
                    error={errors.first_name}
                    label="Imię *"
                    placeholder="Jan"
                    value={formData.first_name}
                    variant={errors.first_name ? 'error' : 'default'}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                  />

                  <Input
                    required
                    data-testid="patient-lastName"
                    disabled={isLoading}
                    error={errors.last_name}
                    label="Nazwisko *"
                    placeholder="Kowalski"
                    value={formData.last_name}
                    variant={errors.last_name ? 'error' : 'default'}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                  />

                  <Input
                    disabled={isLoading}
                    label="Data urodzenia"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleChange('date_of_birth', e.target.value)}
                  />

                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">Płeć</label>
                    <select
                      className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100"
                      disabled={isLoading}
                      value={formData.gender || ''}
                      onChange={(e) => handleChange('gender', e.target.value)}
                    >
                      <option value="">Nieustalone</option>
                      {GENDER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div>
                <h3 className="mb-3 text-sm font-medium text-neutral-900">Dane kontaktowe</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    data-testid="patient-email"
                    disabled={isLoading}
                    error={errors.email}
                    label="Email"
                    placeholder="jan.kowalski@example.com"
                    type="email"
                    value={formData.email}
                    variant={errors.email ? 'error' : 'default'}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />

                  <Input
                    data-testid="patient-phone"
                    disabled={isLoading}
                    error={errors.phone}
                    label="Telefon"
                    placeholder="+48 123 456 789"
                    type="tel"
                    value={formData.phone}
                    variant={errors.phone ? 'error' : 'default'}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
              </div>

              {/* Address Section */}
              <div>
                <h3 className="mb-3 text-sm font-medium text-neutral-900">Adres</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    disabled={isLoading}
                    label="Ulica i numer"
                    placeholder="ul. Przykładowa 1/2"
                    value={formData.address_street}
                    onChange={(e) => handleChange('address_street', e.target.value)}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      disabled={isLoading}
                      label="Kod pocztowy"
                      placeholder="00-001"
                      value={formData.address_postal_code}
                      onChange={(e) => handleChange('address_postal_code', e.target.value)}
                    />

                    <Input
                      disabled={isLoading}
                      label="Miasto"
                      placeholder="Warszawa"
                      value={formData.address_city}
                      onChange={(e) => handleChange('address_city', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-neutral-200 pt-4">
                <Button
                  data-testid="patient-cancel"
                  disabled={isLoading}
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  Anuluj
                </Button>
                <Button
                  data-testid="patient-save"
                  loading={isLoading}
                  type="submit"
                  variant="primary"
                >
                  {isEditing ? 'Zapisz zmiany' : 'Dodaj pacjenta'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    )
  }
)

export default PatientFormModal
