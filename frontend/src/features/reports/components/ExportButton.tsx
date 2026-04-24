import { memo, useState } from 'react'
import { clsx } from 'clsx'
import type { ExportRequest, ReportType } from '../../types'

export interface ExportButtonProps {
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
   * Button variant
   */
  variant?: 'primary' | 'outline'
  /**
   * Button size
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Button text
   */
  label?: string
  /**
   * Disabled state
   */
  disabled?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
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
 * ExportButton Component
 *
 * Button for exporting reports to PDF or Excel
 */
export const ExportButton = memo(function ExportButton({
  reportType = 'COMPLIANCE',
  projectId,
  patientId,
  variant = 'primary',
  size = 'md',
  label = 'Eksportuj',
  disabled = false,
  className,
  onSuccess,
  onError,
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [format, setFormat] = useState<'PDF' | 'EXCEL'>('PDF')
  const [includeCharts, setIncludeCharts] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

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
      setIsOpen(false)
    } catch (error) {
      console.error('Export error:', error)
      onError?.(error as Error)
    } finally {
      setIsExporting(false)
    }
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50',
  }

  return (
    <div className={clsx('relative inline-block', className)}>
      {/* Export Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isExporting}
        className={clsx(
          'inline-flex items-center gap-2 rounded-md font-medium transition-colors',
          sizeClasses[size],
          variantClasses[variant],
          (disabled || isExporting) && 'opacity-50 cursor-not-allowed'
        )}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        {isExporting ? 'Eksportowanie...' : label}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-neutral-200 z-20">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                Eksportuj raport
              </h3>

              {/* Format Selection */}
              <div className="mb-4">
                <label className="text-sm font-medium text-neutral-700 mb-2 block">
                  Format
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormat('PDF')}
                    className={clsx(
                      'flex-1 px-3 py-2 rounded-md text-sm font-medium border transition-colors',
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
                      'flex-1 px-3 py-2 rounded-md text-sm font-medium border transition-colors',
                      format === 'EXCEL'
                        ? 'bg-primary-50 border-primary-600 text-primary-700'
                        : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                    )}
                  >
                    Excel
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="mb-4">
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

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className={clsx(
                    'flex-1 px-3 py-2 text-sm font-medium text-white rounded-md transition-colors',
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
        </>
      )}
    </div>
  )
})

export default ExportButton
