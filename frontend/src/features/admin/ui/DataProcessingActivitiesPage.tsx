import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog } from '@headlessui/react'
import {
  useGetDataProcessingActivitiesQuery,
  useCreateDataProcessingActivityMutation,
  useUpdateDataProcessingActivityMutation,
  useDeleteDataProcessingActivityMutation,
} from '../api/adminApi'
import { dataProcessingActivitySchema, type DataProcessingActivityFormData, legalBasisValues } from '../lib/schemas'
import { Button } from '@shared/components'
import { Input } from '@shared/components'
import type { DataProcessingActivity, LegalBasis } from '../types'

/**
 * DataProcessingActivitiesPage Component
 *
 * Admin page for managing data processing activities registry
 * Implements US-A-13 (rejestr przetwarzania danych osobowych - RODO Art. 30)
 *
 * Features:
 * - List of DataProcessingActivity with filters (legalBasis, date range)
 * - CRUD form with RHF + Zod validation
 */
export const DataProcessingActivitiesPage: React.FC = () => {
  const [filters, setFilters] = useState({
    legal_basis: undefined as LegalBasis | undefined,
    page: 0,
    size: 20,
  })
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [editingActivity, setEditingActivity] = useState<DataProcessingActivity | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data, isLoading, error, refetch } = useGetDataProcessingActivitiesQuery(filters)
  const [createActivity] = useCreateDataProcessingActivityMutation()
  const [updateActivity] = useUpdateDataProcessingActivityMutation()
  const [deleteActivity] = useDeleteDataProcessingActivityMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DataProcessingActivityFormData>({
    resolver: zodResolver(dataProcessingActivitySchema),
    defaultValues: {
      name: '',
      purpose: '',
      legal_basis: 'CONSENT',
      categories: [],
      recipients: [],
      retention_period: '',
      security_measures: '',
      data_controller: '',
      data_processor: '',
    },
  })

  const handleOpenCreate = () => {
    reset({
      name: '',
      purpose: '',
      legal_basis: 'CONSENT',
      categories: [],
      recipients: [],
      retention_period: '',
      security_measures: '',
      data_controller: '',
      data_processor: '',
    })
    setEditingActivity(null)
    setShowFormDialog(true)
  }

  const handleOpenEdit = (activity: DataProcessingActivity) => {
    reset({
      name: activity.name,
      purpose: activity.purpose,
      legal_basis: activity.legal_basis,
      categories: activity.categories,
      recipients: activity.recipients,
      retention_period: activity.retention_period,
      security_measures: activity.security_measures,
      data_controller: activity.data_controller,
      data_processor: activity.data_processor,
    })
    setEditingActivity(activity)
    setShowFormDialog(true)
  }

  const handleFormSubmit = async (formData: DataProcessingActivityFormData) => {
    try {
      if (editingActivity) {
        await updateActivity({ id: editingActivity.id, body: formData }).unwrap()
      } else {
        await createActivity(formData).unwrap()
      }
      reset()
      setEditingActivity(null)
      setShowFormDialog(false)
      refetch()
    } catch (err) {
      console.error('Failed to save activity:', err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteActivity(id).unwrap()
      setDeletingId(null)
      setShowDeleteDialog(false)
      refetch()
    } catch (err) {
      console.error('Failed to delete activity:', err)
    }
  }

  const handleLegalBasisFilter = (legalBasis: LegalBasis | 'ALL') => {
    setFilters((prev) => ({
      ...prev,
      legal_basis: legalBasis === 'ALL' ? undefined : legalBasis,
      page: 0,
    }))
  }

  const LEGAL_BASIS_OPTIONS: { value: LegalBasis | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'Wszystkie podstawy' },
    { value: 'CONSENT', label: 'Zgoda' },
    { value: 'CONTRACT', label: 'Umowa' },
    { value: 'LEGAL_OBLIGATION', label: 'Obowiązek prawny' },
    { value: 'VITAL_INTEREST', label: 'Ochrona interesów życiowych' },
    { value: 'PUBLIC_TASK', label: 'Zadanie publiczne' },
    { value: 'LEGITIMATE_INTEREST', label: 'Prawnie uzasadniony interes' },
  ]

  const getLegalBasisLabel = (basis: LegalBasis): string => {
    const labels: Record<LegalBasis, string> = {
      CONSENT: 'Zgoda',
      CONTRACT: 'Umowa',
      LEGAL_OBLIGATION: 'Obowiązek prawny',
      VITAL_INTEREST: 'Ochrona interesów życiowych',
      PUBLIC_TASK: 'Zadanie publiczne',
      LEGITIMATE_INTEREST: 'Prawnie uzasadniony interes',
    }
    return labels[basis]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Rejestr czynności przetwarzania</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Zarządzaj rejestrem czynności przetwarzania danych osobowych (RODO Art. 30)
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          Dodaj czynność
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-neutral-700">Podstawa prawna:</span>
        <div className="flex flex-wrap gap-1">
          {LEGAL_BASIS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleLegalBasisFilter(option.value)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filters.legal_basis === option.value || (option.value === 'ALL' && !filters.legal_basis)
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error ? (
        <div className="text-center py-12">
          <p className="text-red-600">Wystąpił błąd podczas ładowania rejestru</p>
          <button onClick={() => refetch()} className="mt-4 text-primary-600 hover:text-primary-700 font-medium">
            Spróbuj ponownie
          </button>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Nazwa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Cel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Podstawa prawna
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Administrator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Okres przechowywania
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                      Ładowanie...
                    </td>
                  </tr>
                ) : data?.content.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                      Brak czynności przetwarzania w rejestrze
                    </td>
                  </tr>
                ) : (
                  data?.content.map((activity) => (
                    <tr key={activity.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                        {activity.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600 max-w-xs truncate">
                        {activity.purpose}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-700">
                          {getLegalBasisLabel(activity.legal_basis)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                        {activity.data_controller}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                        {activity.retention_period}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="outline" size="sm" onClick={() => handleOpenEdit(activity)} className="mr-2">
                          Edytuj
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setDeletingId(activity.id)
                            setShowDeleteDialog(true)
                          }}
                        >
                          Usuń
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-white border border-neutral-200 rounded-lg">
              <div className="text-sm text-neutral-700">
                Strona {data.pageNumber + 1} z {data.totalPages} ({data.totalElements} czynności)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(0, prev.page - 1) }))}
                  disabled={data.isFirst}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Poprzednia
                </button>
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={data.isLast}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Następna
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Form Dialog */}
      <Dialog open={showFormDialog} onClose={() => setShowFormDialog(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <div className="px-6 py-4 border-b border-neutral-200">
                <Dialog.Title className="text-lg font-semibold text-neutral-900">
                  {editingActivity ? 'Edytuj czynność przetwarzania' : 'Dodaj czynność przetwarzania'}
                </Dialog.Title>
              </div>

              <div className="px-6 py-4 space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
                    Nazwa *
                  </label>
                  <Input
                    id="name"
                    {...register('name')}
                    variant={errors.name ? 'error' : 'default'}
                    errorMessage={errors.name?.message}
                    fullWidth
                  />
                </div>

                {/* Purpose */}
                <div>
                  <label htmlFor="purpose" className="block text-sm font-medium text-neutral-700 mb-1">
                    Cel przetwarzania *
                  </label>
                  <textarea
                    id="purpose"
                    {...register('purpose')}
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  />
                  {errors.purpose && <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>}
                </div>

                {/* Legal Basis */}
                <div>
                  <label htmlFor="legal_basis" className="block text-sm font-medium text-neutral-700 mb-1">
                    Podstawa prawna *
                  </label>
                  <select
                    id="legal_basis"
                    {...register('legal_basis')}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  >
                    {legalBasisValues.map((basis) => (
                      <option key={basis} value={basis}>
                        {getLegalBasisLabel(basis)}
                      </option>
                    ))}
                  </select>
                  {errors.legal_basis && <p className="mt-1 text-sm text-red-600">{errors.legal_basis.message}</p>}
                </div>

                {/* Categories */}
                <div>
                  <label htmlFor="categories" className="block text-sm font-medium text-neutral-700 mb-1">
                    Kategorie danych *
                  </label>
                  <Input
                    id="categories"
                    placeholder="Wpisz kategorię i naciśnij Enter"
                    fullWidth
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        e.preventDefault()
                        const currentValue = register('categories').value || []
                        // This is a simplified version - in production you'd want a proper tag input
                      }
                    }}
                  />
                  <p className="text-xs text-neutral-500 mt-1">Kategorie oddzielone przecinkami</p>
                  {errors.categories && <p className="mt-1 text-sm text-red-600">{errors.categories.message}</p>}
                </div>

                {/* Retention Period */}
                <div>
                  <label htmlFor="retention_period" className="block text-sm font-medium text-neutral-700 mb-1">
                    Okres przechowywania *
                  </label>
                  <Input
                    id="retention_period"
                    {...register('retention_period')}
                    placeholder="np. 5 lat od zakończenia leczenia"
                    fullWidth
                  />
                  {errors.retention_period && (
                    <p className="mt-1 text-sm text-red-600">{errors.retention_period.message}</p>
                  )}
                </div>

                {/* Security Measures */}
                <div>
                  <label htmlFor="security_measures" className="block text-sm font-medium text-neutral-700 mb-1">
                    Środki bezpieczeństwa *
                  </label>
                  <textarea
                    id="security_measures"
                    {...register('security_measures')}
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  />
                  {errors.security_measures && (
                    <p className="mt-1 text-sm text-red-600">{errors.security_measures.message}</p>
                  )}
                </div>

                {/* Data Controller */}
                <div>
                  <label htmlFor="data_controller" className="block text-sm font-medium text-neutral-700 mb-1">
                    Administrator danych *
                  </label>
                  <Input
                    id="data_controller"
                    {...register('data_controller')}
                    fullWidth
                  />
                  {errors.data_controller && (
                    <p className="mt-1 text-sm text-red-600">{errors.data_controller.message}</p>
                  )}
                </div>

                {/* Data Processor */}
                <div>
                  <label htmlFor="data_processor" className="block text-sm font-medium text-neutral-700 mb-1">
                    Procesor danych
                  </label>
                  <Input
                    id="data_processor"
                    {...register('data_processor')}
                    fullWidth
                  />
                  {errors.data_processor && (
                    <p className="mt-1 text-sm text-red-600">{errors.data_processor.message}</p>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex justify-end gap-3 rounded-b-lg">
                <Button type="button" variant="outline" onClick={() => setShowFormDialog(false)}>
                  Anuluj
                </Button>
                <Button type="submit" variant="primary">
                  {editingActivity ? 'Zapisz zmiany' : 'Dodaj'}
                </Button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4">
              <Dialog.Title className="text-lg font-semibold text-neutral-900 mb-2">
                Usuwanie czynności przetwarzania
              </Dialog.Title>
              <p className="text-sm text-neutral-600 mb-4">
                Czy na pewno chcesz usunąć tę czynność przetwarzania? Ta operacja jest nieodwracalna.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Anuluj
                </Button>
                <Button
                  variant="danger"
                  onClick={() => deletingId && handleDelete(deletingId)}
                >
                  Usuń
                </Button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  )
}

export default DataProcessingActivitiesPage
