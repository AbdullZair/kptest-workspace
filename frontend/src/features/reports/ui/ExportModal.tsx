import { useState } from 'react'
import { clsx } from 'clsx'
import type { ExportRequest, ReportType } from '../types'

export interface ExportModalProps {
  /**
   * Whether modal is open
   */
  isOpen: boolean
  /**
   * Close callback
   */
  onClose: () => void
  /**
   * Report type to export
   */
  reportType?: ReportType
  /**
   * Project ID (optional)
   */
  projectId?: string
  /**
   * Patient ID (optional)
   */
  patientId?: string
  /**
   * Export success callback
   */
  onSuccess?: (blob: Blob) => void
  /**
   * Export error callback
   */
  onError?: (error: Error) => void
}

/**
 * ExportModal Component
 *
 * Modal for exporting reports to PDF or Excel
 */
export const ExportModal = ({
  isOpen,
  onClose,
  reportType = 'COMPLIANCE',
  projectId,
  patientId,
  onSuccess,
  onError,
}: ExportModalProps) => {
  const [format, setFormat] = useState<'PDF' | 'EXCEL'>('PDF')
  const [includeCharts, setIncludeCharts] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 3)
    return date.toISOString().split('T')[0]
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0])

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const response = await fetch('/api/v1/reports/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report_type: reportType,
          project_id: projectId,
          patient_id: patientId,
          date_from: dateFrom,
          date_to: dateTo,
          format,
          include_charts: includeCharts,
        }),
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `raport_${reportType.toLowerCase()}_${new Date().toISOString().split('T')[0]}.${format === 'PDF' ? 'pdf' : 'xlsx'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      onSuccess?.(blob)
      onClose()
    } catch (error) {
      console.error('Export error:', error)
      onError?.(error as Error)
    } finally {
      setIsExporting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Modal Content */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900">Eksportuj raport</h3>
            <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
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

          {/* Body */}
          <div className="space-y-4 p-6">
            {/* Format Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">Format</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFormat('PDF')}
                  className={clsx(
                    'flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors',
                    format === 'PDF'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
                  )}
                >
                  PDF
                </button>
                <button
                  onClick={() => setFormat('EXCEL')}
                  className={clsx(
                    'flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors',
                    format === 'EXCEL'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
                  )}
                >
                  Excel
                </button>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Data od</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Data do</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Options */}
            <div>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700">Uwzględnij wykresy</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 border-t border-neutral-200 p-6">
            <button
              onClick={onClose}
              className="flex-1 rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200"
              disabled={isExporting}
            >
              Anuluj
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className={clsx(
                'flex-1 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors',
                isExporting
                  ? 'cursor-not-allowed bg-primary-400'
                  : 'bg-primary-600 hover:bg-primary-700'
              )}
            >
              {isExporting ? 'Eksportowanie...' : 'Eksportuj'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExportModal
