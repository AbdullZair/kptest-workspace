import { useEffect, useMemo, useState } from 'react'
import { useGetPatientsQuery } from '@features/patients/api/patientApi'
import { useExportPatientDataMutation } from '../api/adminApi'
import type { ExportFormat } from '../types'
import type { ApiError } from '@shared/api'

const sanitize = (s: string): string =>
  s.normalize('NFKD').replace(/[^\p{L}\p{N}_-]+/gu, '_').replace(/_+/g, '_') || 'pacjent'

/**
 * RodoPanelPage (US-A-10/11/12 — admin RODO operations).
 *
 * Single-page view: select a patient, choose format, download export blob.
 * Mounted at /admin/rodo. Companion to per-patient flow at
 * /admin/patients/:id/data.
 */
export const RodoPanelPage = () => {
  const { data, isLoading } = useGetPatientsQuery({ page: 0, size: 100 })
  const patients = useMemo(() => data?.data ?? [], [data])

  const [patientId, setPatientId] = useState<string>('')
  const [format, setFormat] = useState<ExportFormat>('json')
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  const [exportPatientData, { isLoading: isExporting }] = useExportPatientDataMutation()

  useEffect(() => {
    if (!patientId && patients.length > 0 && patients[0]?.id) {
      setPatientId(patients[0].id)
    }
  }, [patients, patientId])

  const selectedPatient = patients.find((p) => p.id === patientId)

  const handleDownload = async (): Promise<void> => {
    if (!patientId) {
      setFeedback({ kind: 'err', text: 'Wybierz pacjenta przed eksportem.' })
      return
    }
    setFeedback(null)
    try {
      const blob = await exportPatientData({ patientId, format }).unwrap()
      const fname = selectedPatient
        ? `pacjent_${sanitize(selectedPatient.first_name)}_${sanitize(selectedPatient.last_name)}_${patientId}.${format}`
        : `pacjent_${patientId}.${format}`
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fname
      link.rel = 'noopener'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      setFeedback({ kind: 'ok', text: `Eksport ${format.toUpperCase()} zainicjowany.` })
    } catch (err) {
      const apiErr = err as ApiError
      setFeedback({ kind: 'err', text: `Błąd eksportu: ${apiErr?.message ?? 'nieznany'}` })
    }
  }

  return (
    <div className="space-y-6" data-testid="rodo-panel">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Panel RODO</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Eksport danych pacjenta zgodnie z Art. 20 RODO.
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <label htmlFor="patient-select" className="block text-sm font-medium text-neutral-700">
          Pacjent
        </label>
        <select
          id="patient-select"
          data-testid="patient-select"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          disabled={isLoading || patients.length === 0}
          className="mt-1 w-full max-w-xl rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {patients.length === 0 ? (
            <option value="">{isLoading ? 'Ładowanie...' : 'Brak pacjentów'}</option>
          ) : (
            patients.map((p) => (
              <option key={p.id} value={p.id ?? ''}>
                {p.first_name} {p.last_name} — PESEL {p.pesel}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-neutral-900">Eksport danych</h2>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setFormat('json')}
            data-testid="format-json"
            className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
              format === 'json'
                ? 'border-primary-600 bg-primary-50 text-primary-700'
                : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            JSON
          </button>
          <button
            type="button"
            onClick={() => setFormat('pdf')}
            data-testid="format-pdf"
            className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
              format === 'pdf'
                ? 'border-primary-600 bg-primary-50 text-primary-700'
                : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            PDF
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting || !patientId}
            data-testid="export-data-button"
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting ? 'Eksportuję...' : 'Eksportuj dane'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting || !patientId}
            data-testid="download-button"
            className="rounded-md border border-primary-300 bg-white px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Pobierz {format.toUpperCase()}
          </button>
        </div>
      </div>

      {feedback ? (
        <div
          role="status"
          className={
            feedback.kind === 'ok'
              ? 'rounded-md border border-success-200 bg-success-50 p-3 text-sm text-success-700'
              : 'rounded-md border border-error-200 bg-error-50 p-3 text-sm text-error-700'
          }
        >
          {feedback.text}
        </div>
      ) : null}
    </div>
  )
}

export default RodoPanelPage
