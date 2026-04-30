import React, { useState } from 'react'
import { useExportPatientDataMutation } from '../api/adminApi'
import type { ExportFormat } from '../types'
import type { ApiError } from '@shared/api'

interface ExportPatientDataButtonProps {
  patientId: string
  patientName: string
  onSuccess: () => void
}

interface FormatOption {
  value: ExportFormat
  label: string
  mime: string
}

const FORMATS: FormatOption[] = [
  { value: 'json', label: 'JSON', mime: 'application/json' },
  { value: 'pdf', label: 'PDF', mime: 'application/pdf' },
]

type FeedbackKind = 'success' | 'error'

interface Feedback {
  kind: FeedbackKind
  message: string
}

const sanitizeFileName = (name: string): string =>
  name
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}_-]+/gu, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') || 'pacjent'

/**
 * ExportPatientDataButton (US-A-11, RODO Art. 20 — data portability)
 *
 * Renders a format dropdown and downloads the chosen export blob via
 * an in-memory anchor. Reports inline success/failure feedback.
 */
export const ExportPatientDataButton: React.FC<ExportPatientDataButtonProps> = ({
  patientId,
  patientName,
  onSuccess,
}) => {
  const [format, setFormat] = useState<ExportFormat>('json')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [exportPatientData, { isLoading }] = useExportPatientDataMutation()

  const handleExport = async (): Promise<void> => {
    setFeedback(null)
    try {
      const blob = await exportPatientData({ patientId, format }).unwrap()

      const downloadName = `pacjent_${sanitizeFileName(patientName)}_${patientId}.${format}`
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = downloadName
      link.rel = 'noopener'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      setFeedback({
        kind: 'success',
        message: `Eksport (${format.toUpperCase()}) gotowy — pobieranie rozpoczęte.`,
      })
      onSuccess()
    } catch (err) {
      const apiError = err as ApiError
      const message = apiError?.message ?? 'Eksport nie powiódł się.'
      console.error('[ExportPatientDataButton] export failed', err)
      setFeedback({ kind: 'error', message: `Błąd eksportu: ${message}` })
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-neutral-700" htmlFor="export-format">
          Format eksportu
        </label>
        <select
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          disabled={isLoading}
          id="export-format"
          value={format}
          onChange={(e) => setFormat(e.target.value as ExportFormat)}
        >
          {FORMATS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          aria-busy={isLoading}
          className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading}
          type="button"
          onClick={handleExport}
        >
          {isLoading ? 'Eksportuję...' : 'Eksportuj dane (RODO)'}
        </button>
      </div>

      {feedback ? (
        <div
          aria-live="polite"
          className={
            feedback.kind === 'success'
              ? 'rounded border border-green-200 bg-green-50 p-2 text-sm text-green-700'
              : 'rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700'
          }
          role="status"
        >
          {feedback.message}
        </div>
      ) : null}
    </div>
  )
}

export default ExportPatientDataButton
