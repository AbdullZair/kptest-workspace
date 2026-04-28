import { useState } from 'react'
import { clsx } from 'clsx'

/**
 * ExportButton Props
 */
export interface ExportButtonProps {
  label?: string
  formats?: ExportFormat[]
  onExport?: (format: ExportFormat) => Promise<void>
  className?: string
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

export type ExportFormat = 'PDF' | 'CSV' | 'XLSX' | 'JSON'

/**
 * ExportButton Component
 *
 * Button with dropdown for exporting data in various formats
 *
 * @example
 * ```tsx
 * <ExportButton
 *   label="Eksportuj raport"
 *   formats={['PDF', 'XLSX']}
 *   onExport={async (format) => {
 *     // Handle export
 *   }}
 * />
 * ```
 */
export function ExportButton({
  label = 'Eksportuj',
  formats = ['PDF', 'CSV', 'XLSX'],
  onExport,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true)
    setIsOpen(false)

    try {
      await onExport?.(format)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const variantStyles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    outline: 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50',
    ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100',
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const formatLabels: Record<ExportFormat, string> = {
    PDF: 'PDF (Dokument)',
    CSV: 'CSV (Dane)',
    XLSX: 'Excel (Arkusz)',
    JSON: 'JSON (Dane)',
  }

  const formatIcons: Record<ExportFormat, React.ReactNode> = {
    PDF: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
    CSV: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    XLSX: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    JSON: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
        />
      </svg>
    ),
  }

  return (
    <div className={clsx('relative inline-block text-left', className)}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleExport(formats[0])}
          disabled={disabled || isExporting}
          className={clsx(
            'inline-flex items-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            variantStyles[variant],
            sizeStyles[size],
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          {isExporting ? (
            <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
          ) : (
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          )}
          {label}
        </button>

        {formats.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              disabled={disabled || isExporting}
              className={clsx(
                'inline-flex items-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                variantStyles[variant],
                sizeStyles[size],
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isOpen ? (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-neutral-200 bg-white shadow-lg">
                  <div className="py-1">
                    {formats.map((format) => (
                      <button
                        key={format}
                        type="button"
                        onClick={() => handleExport(format)}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100"
                      >
                        {formatIcons[format]}
                        {formatLabels[format]}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

export default ExportButton
