import { useEffect, useState } from 'react'
import { useGetSystemConfigQuery, useUpdateSystemConfigMutation } from '../api/adminApi'

/**
 * Form fields exposed by the US-A-05 minimal configuration UI.
 *
 * The backend currently only accepts these three keys (the rest are ignored
 * by the placeholder implementation). When a feature-flag store ships, this
 * component should switch to a dynamic schema-driven form.
 */
interface SystemConfigFormState {
  complianceThreshold: string
  language: string
  notificationsEnabled: boolean
}

const DEFAULT_FORM: SystemConfigFormState = {
  complianceThreshold: '80',
  language: 'pl',
  notificationsEnabled: true,
}

const fromConfig = (cfg?: Record<string, string>): SystemConfigFormState => {
  if (!cfg) return DEFAULT_FORM
  return {
    complianceThreshold: cfg['default.compliance.threshold'] ?? DEFAULT_FORM.complianceThreshold,
    language: cfg['default.language'] ?? DEFAULT_FORM.language,
    notificationsEnabled: (cfg['notifications.enabled'] ?? 'true') === 'true',
  }
}

const toConfig = (form: SystemConfigFormState): Record<string, string> => ({
  'default.compliance.threshold': form.complianceThreshold,
  'default.language': form.language,
  'notifications.enabled': form.notificationsEnabled ? 'true' : 'false',
})

/**
 * AdminSystemConfigPage Component (US-A-05)
 *
 * Minimal admin form for global system settings: default compliance
 * threshold, default UI language and notifications toggle. Backed by the
 * placeholder /admin/system/config endpoints — values are not yet persisted
 * server-side; this page surfaces them so the UI is wired up end-to-end.
 */
export function AdminSystemConfigPage() {
  const { data, isLoading, error, refetch } = useGetSystemConfigQuery()
  const [updateConfig, { isLoading: isSaving }] = useUpdateSystemConfigMutation()
  const [form, setForm] = useState<SystemConfigFormState>(DEFAULT_FORM)
  const [saved, setSaved] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (data) setForm(fromConfig(data))
  }, [data])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(false)
    setSubmitError(null)
    try {
      await updateConfig(toConfig(form)).unwrap()
      setSaved(true)
      window.setTimeout(() => setSaved(false), 4000)
    } catch (err) {
      setSubmitError('Nie udało się zapisać konfiguracji')

      console.error('Failed to update system config', err)
    }
  }

  return (
    <div className="space-y-6" data-testid="admin-system-config-page">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Konfiguracja systemu</h1>
        <p className="mt-1 text-sm text-neutral-700">
          US-A-05: Globalne ustawienia aplikacji — domyślny próg compliance, język interfejsu oraz
          powiadomienia. Wartości są obecnie placeholderem (nie są jeszcze trwale zapisywane).
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Nie udało się załadować bieżącej konfiguracji
          <button
            className="ml-2 font-medium text-red-700 underline"
            type="button"
            onClick={() => refetch()}
          >
            Spróbuj ponownie
          </button>
        </div>
      ) : null}

      <form
        className="space-y-5 rounded-lg border border-neutral-200 bg-white p-6"
        data-testid="admin-system-config-form"
        onSubmit={handleSubmit}
      >
        <fieldset className="space-y-5" disabled={isLoading || isSaving}>
          <div>
            <label
              className="block text-sm font-medium text-neutral-700"
              htmlFor="complianceThreshold"
            >
              Domyślny próg compliance (%)
            </label>
            <input
              className="mt-1 block w-32 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              data-testid="config-compliance-threshold"
              id="complianceThreshold"
              max={100}
              min={0}
              type="number"
              value={form.complianceThreshold}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, complianceThreshold: e.target.value }))
              }
            />
            <p className="mt-1 text-xs text-neutral-500">
              Wartość bazowa wykorzystywana w raportach compliance.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700" htmlFor="language">
              Domyślny język
            </label>
            <select
              className="mt-1 block w-32 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              data-testid="config-language"
              id="language"
              value={form.language}
              onChange={(e) => setForm((prev) => ({ ...prev, language: e.target.value }))}
            >
              <option value="pl">Polski (pl)</option>
              <option value="en">English (en)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              checked={form.notificationsEnabled}
              className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              data-testid="config-notifications-enabled"
              id="notificationsEnabled"
              type="checkbox"
              onChange={(e) =>
                setForm((prev) => ({ ...prev, notificationsEnabled: e.target.checked }))
              }
            />
            <label className="text-sm text-neutral-700" htmlFor="notificationsEnabled">
              Powiadomienia włączone globalnie
            </label>
          </div>
        </fieldset>

        {saved ? (
          <div
            className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800"
            data-testid="admin-system-config-saved"
            role="status"
          >
            Zapisano
          </div>
        ) : null}

        {submitError ? (
          <div
            className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            role="alert"
          >
            {submitError}
          </div>
        ) : null}

        <div className="flex justify-end">
          <button
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            data-testid="admin-system-config-submit"
            disabled={isLoading || isSaving}
            type="submit"
          >
            {isSaving ? 'Zapisywanie...' : 'Zapisz konfigurację'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminSystemConfigPage
