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
          format: format,
          include_charts: includeCharts,
        } as ExportRequest),
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
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900">Eksportuj raport</h3>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <div className="p-6 space-y-4">
            {/* Format Selection */}
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Format
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFormat('PDF')}
                  className={clsx(
                    'flex-1 px-4 py-2 rounded-md text-sm font-medium border transition-colors',
                    format === 'PDF'
                      ? 'bg-primary-50 border-primary-600 text-primary-700'
                      : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                  )}
                >
                  PDF
                </button>
                <button
                  onClick={() => setFormat('EXCEL')}
                  className={clsx(
                    'flex-1 px-4 py-2 rounded-md text-sm font-medium border transition-colors',
                    format === 'EXCEL'
                      ? 'bg-primary-50 border-primary-600 text-primary-700'
                      : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                  )}
                >
                  Excel
                </button>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1 block">
                  Data od
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1 block">
                  Data do
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Options */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700">Uwzględnij wykresy</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-neutral-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors"
              disabled={isExporting}
            >
              Anuluj
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className={clsx(
                'flex-1 px-4 py-2 text-sm font-medium text-white rounded-md transition-colors',
                isExporting
                  ? 'bg-primary-400 cursor-not-allowed'
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
