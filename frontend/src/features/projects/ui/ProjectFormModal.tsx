import { useState, useEffect, useMemo } from 'react'
import { Button, Card } from '@shared/components'
import type { ProjectFormModalProps, ProjectFormData } from '../types'
import { clsx } from 'clsx'

/**
 * ProjectFormModal Component
 *
 * Modal for creating and editing projects
 *
 * @example
 * ```tsx
 * <ProjectFormModal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   onSubmit={handleSubmit}
 *   project={editingProject}
 *   isLoading={isSaving}
 * />
 * ```
 */
export const ProjectFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  project,
  isLoading = false,
}: ProjectFormModalProps) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0] ?? '',
    end_date: '',
    status: 'PLANNED',
    compliance_threshold: 80,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Populate form when editing
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        start_date: project.start_date ? (project.start_date.split('T')[0] ?? '') : '',
        end_date: project.end_date ? (project.end_date.split('T')[0] ?? '') : '',
        status: project.status || 'PLANNED',
        compliance_threshold: project.compliance_threshold || 80,
      })
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        description: '',
        start_date: new Date().toISOString().split('T')[0] ?? '',
        end_date: '',
        status: 'PLANNED',
        compliance_threshold: 80,
      })
    }
    setErrors({})
  }, [project, isOpen])

  // Validate form
  const validate = useMemo(
    () => () => {
      const newErrors: Record<string, string> = {}

      if (!formData.name?.trim()) {
        newErrors.name = 'Nazwa projektu jest wymagana'
      } else if (formData.name.length > 200) {
        newErrors.name = 'Nazwa projektu nie może przekraczać 200 znaków'
      }

      if (formData.description && formData.description.length > 5000) {
        newErrors.description = 'Opis nie może przekraczać 5000 znaków'
      }

      if (!formData.start_date) {
        newErrors.start_date = 'Data rozpoczęcia jest wymagana'
      }

      if (formData.end_date && formData.start_date && formData.end_date < formData.start_date) {
        newErrors.end_date = 'Data zakończenia musi być późniejsza niż data rozpoczęcia'
      }

      if (formData.compliance_threshold !== undefined) {
        if (formData.compliance_threshold < 0 || formData.compliance_threshold > 100) {
          newErrors.compliance_threshold = 'Próg compliance musi być między 0 a 100'
        }
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    },
    [formData]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Failed to save project:', error)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : parseInt(value, 10)) : value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl transform transition-all">
          <Card variant="elevated" className="overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-6 py-4">
              <h2 id="modal-title" className="text-lg font-semibold text-neutral-900">
                {project ? 'Edytuj projekt' : 'Nowy projekt'}
              </h2>
              <button
                onClick={onClose}
                className="text-neutral-400 transition-colors hover:text-neutral-600"
                aria-label="Zamknij"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <form onSubmit={handleSubmit}>
              <Card.Body className="space-y-5">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="mb-1 block text-sm font-medium text-neutral-700">
                    Nazwa projektu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={clsx(
                      'w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500',
                      errors.name
                        ? 'border-rose-300 focus:border-rose-500'
                        : 'border-neutral-300 focus:border-primary-500'
                    )}
                    placeholder="Wprowadź nazwę projektu"
                    disabled={isLoading}
                  />
                  {errors.name ? <p className="mt-1 text-sm text-rose-600">{errors.name}</p> : null}
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="mb-1 block text-sm font-medium text-neutral-700"
                  >
                    Opis
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className={clsx(
                      'w-full resize-none rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500',
                      errors.description
                        ? 'border-rose-300 focus:border-rose-500'
                        : 'border-neutral-300 focus:border-primary-500'
                    )}
                    placeholder="Opis projektu (opcjonalny)"
                    disabled={isLoading}
                  />
                  {errors.description ? (
                    <p className="mt-1 text-sm text-rose-600">{errors.description}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-neutral-500">
                    {formData.description?.length || 0}/5000 znaków
                  </p>
                </div>

                {/* Dates Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div>
                    <label
                      htmlFor="start_date"
                      className="mb-1 block text-sm font-medium text-neutral-700"
                    >
                      Data rozpoczęcia <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="start_date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      className={clsx(
                        'w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500',
                        errors.start_date
                          ? 'border-rose-300 focus:border-rose-500'
                          : 'border-neutral-300 focus:border-primary-500'
                      )}
                      disabled={isLoading}
                    />
                    {errors.start_date ? (
                      <p className="mt-1 text-sm text-rose-600">{errors.start_date}</p>
                    ) : null}
                  </div>

                  {/* End Date */}
                  <div>
                    <label
                      htmlFor="end_date"
                      className="mb-1 block text-sm font-medium text-neutral-700"
                    >
                      Data zakończenia
                    </label>
                    <input
                      type="date"
                      id="end_date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      className={clsx(
                        'w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500',
                        errors.end_date
                          ? 'border-rose-300 focus:border-rose-500'
                          : 'border-neutral-300 focus:border-primary-500'
                      )}
                      disabled={isLoading}
                    />
                    {errors.end_date ? (
                      <p className="mt-1 text-sm text-rose-600">{errors.end_date}</p>
                    ) : null}
                  </div>
                </div>

                {/* Status and Compliance Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Status */}
                  <div>
                    <label
                      htmlFor="status"
                      className="mb-1 block text-sm font-medium text-neutral-700"
                    >
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={isLoading}
                    >
                      <option value="PLANNED">Planowany</option>
                      <option value="ACTIVE">Aktywny</option>
                      <option value="COMPLETED">Zakończony</option>
                      <option value="ARCHIVED">Zarchiwizowany</option>
                      <option value="CANCELLED">Anulowany</option>
                    </select>
                  </div>

                  {/* Compliance Threshold */}
                  <div>
                    <label
                      htmlFor="compliance_threshold"
                      className="mb-1 block text-sm font-medium text-neutral-700"
                    >
                      Próg compliance (%)
                    </label>
                    <input
                      type="number"
                      id="compliance_threshold"
                      name="compliance_threshold"
                      value={formData.compliance_threshold}
                      onChange={handleChange}
                      min={0}
                      max={100}
                      className={clsx(
                        'w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500',
                        errors.compliance_threshold
                          ? 'border-rose-300 focus:border-rose-500'
                          : 'border-neutral-300 focus:border-primary-500'
                      )}
                      disabled={isLoading}
                    />
                    {errors.compliance_threshold ? (
                      <p className="mt-1 text-sm text-rose-600">{errors.compliance_threshold}</p>
                    ) : null}
                  </div>
                </div>
              </Card.Body>

              {/* Footer */}
              <Card.Footer className="flex items-center justify-end gap-3 border-t border-neutral-200 bg-neutral-50 px-6 py-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                  Anuluj
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Zapisywanie...
                    </span>
                  ) : project ? (
                    'Zapisz zmiany'
                  ) : (
                    'Utwórz projekt'
                  )}
                </Button>
              </Card.Footer>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProjectFormModal
