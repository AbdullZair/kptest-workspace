import { memo, useState } from 'react'
import { clsx } from 'clsx'
import type { ReportType } from '../types'

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
   * Whether export should include charts (forwarded into the export request)
   */
  includeCharts?: boolean
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
export const ExportButton = memo(
  ({
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
  }: ExportButtonProps) => {
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
          className={clsx(
            'inline-flex items-center gap-2 rounded-md font-medium transition-colors',
            sizeClasses[size],
            variantClasses[variant],
            (disabled || isExporting) && 'cursor-not-allowed opacity-50'
          )}
          disabled={disabled || isExporting}
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          {isExporting ? 'Eksportowanie...' : label}
        </button>

        {/* Dropdown */}
        {isOpen ? (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

            {/* Dropdown Content */}
            <div className="absolute right-0 z-20 mt-2 w-72 rounded-lg border border-neutral-200 bg-white shadow-lg">
              <div className="p-4">
                <h3 className="mb-3 text-sm font-semibold text-neutral-900">Eksportuj raport</h3>

                {/* Format Selection */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-neutral-700">Format</label>
                  <div className="flex gap-2">
                    <button
                      className={clsx(
                        'flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                        format === 'PDF'
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
                      )}
                      onClick={() => setFormat('PDF')}
                    >
                      PDF
                    </button>
                    <button
                      className={clsx(
                        'flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                        format === 'EXCEL'
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
                      )}
                      onClick={() => setFormat('EXCEL')}
                    >
                      Excel
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className="mb-4">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      checked={includeCharts}
                      className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      type="checkbox"
                      onChange={(e) => setIncludeCharts(e.target.checked)}
                    />
                    <span className="text-sm text-neutral-700">Uwzględnij wykresy</span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    className="flex-1 rounded-md bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Anuluj
                  </button>
                  <button
                    className={clsx(
                      'flex-1 rounded-md px-3 py-2 text-sm font-medium text-white transition-colors',
                      isExporting
                        ? 'cursor-not-allowed bg-primary-400'
                        : 'bg-primary-600 hover:bg-primary-700'
                    )}
                    disabled={isExporting}
                    onClick={handleExport}
                  >
                    {isExporting ? 'Eksportowanie...' : 'Eksportuj'}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    )
  }
)

export default ExportButton
