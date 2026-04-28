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
      if (!formData.pesel.trim()) {
        newErrors.pesel = 'PESEL jest wymagany'
      } else if (!/^\d{11}$/.test(formData.pesel)) {
        newErrors.pesel = 'PESEL musi zawierać 11 cyfr'
      }

      // Validate first name
      if (!formData.first_name.trim()) {
        newErrors.first_name = 'Imię jest wymagane'
      }

      // Validate last name
      if (!formData.last_name.trim()) {
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
        className="fixed inset-0 z-50 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onKeyDown={handleKeyDown}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal panel */}
        <div className="flex min-h-full items-center justify-center p-4">
          <Card variant="elevated" size="lg" className="relative z-10 w-full max-w-2xl">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between border-b border-neutral-200 pb-4">
              <h2 id="modal-title" className="text-xl font-semibold text-neutral-900">
                {isEditing ? 'Edytuj pacjenta' : 'Dodaj pacjenta'}
              </h2>
              <button
                onClick={onClose}
                className="text-neutral-400 transition-colors hover:text-neutral-600"
                aria-label="Zamknij"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Information Section */}
              <div>
                <h3 className="mb-3 text-sm font-medium text-neutral-900">Dane osobowe</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="PESEL *"
                    value={formData.pesel}
                    onChange={(e) => handleChange('pesel', e.target.value)}
                    placeholder="90010112345"
                    error={errors.pesel}
                    variant={errors.pesel ? 'error' : 'default'}
                    disabled={isLoading}
                    required
                  />

                  <Input
                    label="HIS ID"
                    value={formData.his_patient_id}
                    onChange={(e) => handleChange('his_patient_id', e.target.value)}
                    placeholder="HIS-123456"
                    disabled={isLoading}
                  />

                  <Input
                    label="Imię *"
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    placeholder="Jan"
                    error={errors.first_name}
                    variant={errors.first_name ? 'error' : 'default'}
                    disabled={isLoading}
                    required
                  />

                  <Input
                    label="Nazwisko *"
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    placeholder="Kowalski"
                    error={errors.last_name}
                    variant={errors.last_name ? 'error' : 'default'}
                    disabled={isLoading}
                    required
                  />

                  <Input
                    label="Data urodzenia"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleChange('date_of_birth', e.target.value)}
                    disabled={isLoading}
                  />

                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">Płeć</label>
                    <select
                      value={formData.gender || ''}
                      onChange={(e) => handleChange('gender', e.target.value)}
                      disabled={isLoading}
                      className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100"
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
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="jan.kowalski@example.com"
                    error={errors.email}
                    variant={errors.email ? 'error' : 'default'}
                    disabled={isLoading}
                  />

                  <Input
                    label="Telefon"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+48 123 456 789"
                    error={errors.phone}
                    variant={errors.phone ? 'error' : 'default'}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Address Section */}
              <div>
                <h3 className="mb-3 text-sm font-medium text-neutral-900">Adres</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Ulica i numer"
                    value={formData.address_street}
                    onChange={(e) => handleChange('address_street', e.target.value)}
                    placeholder="ul. Przykładowa 1/2"
                    disabled={isLoading}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Kod pocztowy"
                      value={formData.address_postal_code}
                      onChange={(e) => handleChange('address_postal_code', e.target.value)}
                      placeholder="00-001"
                      disabled={isLoading}
                    />

                    <Input
                      label="Miasto"
                      value={formData.address_city}
                      onChange={(e) => handleChange('address_city', e.target.value)}
                      placeholder="Warszawa"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-neutral-200 pt-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                  Anuluj
                </Button>
                <Button type="submit" variant="primary" loading={isLoading}>
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
