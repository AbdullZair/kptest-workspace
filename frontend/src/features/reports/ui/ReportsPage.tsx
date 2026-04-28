import { useState } from 'react'
import { useGetReportHistoryQuery, useExportReportMutation } from '../api'
import { ExportButton } from '../components'
import type { ReportType } from '../types'
import { clsx } from 'clsx'

/**
 * ReportsPage Component
 *
 * Displays list of generated reports with filtering and export options
 */
export const ReportsPage = () => {
  const [selectedType, setSelectedType] = useState<ReportType | 'ALL'>('ALL')
  const [exportReport] = useExportReportMutation()
  const {
    data: reports,
    isLoading,
    error,
  } = useGetReportHistoryQuery(selectedType !== 'ALL' ? { type: selectedType } : undefined)

  const reportTypeLabels: Record<ReportType, string> = {
    COMPLIANCE: 'Compliance',
    PATIENT_STATS: 'Statystyki Pacjenta',
    PROJECT_STATS: 'Statystyki Projektu',
    MATERIAL_STATS: 'Statystyki Materiałów',
  }

  const reportTypeColors: Record<ReportType, string> = {
    COMPLIANCE: 'bg-blue-100 text-blue-800',
    PATIENT_STATS: 'bg-green-100 text-green-800',
    PROJECT_STATS: 'bg-purple-100 text-purple-800',
    MATERIAL_STATS: 'bg-amber-100 text-amber-800',
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleDownload = async (report: (typeof reports)[0]) => {
    try {
      await exportReport({
        report_type: report.type,
        project_id: report.project_id,
        patient_id: report.patient_id,
        format: 'PDF',
      }).unwrap()
    } catch (err) {
      console.error('Download failed:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        Wystąpił błąd podczas ładowania raportów
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Raporty i Statystyki</h1>
          <p className="mt-1 text-neutral-600">Przeglądaj i eksportuj raporty</p>
        </div>
        <ExportButton label="Eksportuj raport" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setSelectedType('ALL')}
          className={clsx(
            'whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            selectedType === 'ALL'
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          )}
        >
          Wszystkie
        </button>
        {(Object.keys(reportTypeLabels) as ReportType[]).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={clsx(
              'whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              selectedType === type
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            )}
          >
            {reportTypeLabels[type]}
          </button>
        ))}
      </div>

      {/* Reports Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Typ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Nazwa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Okres
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Wygenerowano
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Autor
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-500">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 bg-white">
            {reports && reports.length > 0 ? (
              reports.map((report) => (
                <tr key={report.id} className="hover:bg-neutral-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={clsx(
                        'rounded-full px-2 py-1 text-xs font-medium',
                        reportTypeColors[report.type]
                      )}
                    >
                      {reportTypeLabels[report.type]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-neutral-900">
                      {report.project_name || report.patient_name || 'Raport ogólny'}
                    </div>
                    <div className="text-sm text-neutral-500">
                      {report.project_id ? `Projekt: ${report.project_id.slice(0, 8)}...` : ''}
                      {report.patient_id ? `Pacjent: ${report.patient_id.slice(0, 8)}...` : ''}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">
                    {new Date(report.date_from).toLocaleDateString('pl-PL')} -{' '}
                    {new Date(report.date_to).toLocaleDateString('pl-PL')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">
                    {formatDate(report.generated_at)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">
                    {report.generated_by_name || 'System'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleDownload(report)}
                      className="mr-4 text-primary-600 hover:text-primary-900"
                    >
                      Pobierz
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                  Brak raportów do wyświetlenia
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ReportsPage
