import { useState } from 'react'
import {
  useGetSystemHealthQuery,
  useGetSystemMetricsQuery,
  useClearCacheMutation,
  useCreateBackupMutation,
} from '../api/adminApi'
import { SystemHealthCard, SystemMetricsChart } from '../components'

/**
 * AdminSystemPage Component
 *
 * Main page for system status and operations in the admin panel
 */
export function AdminSystemPage() {
  const [showClearCacheConfirm, setShowClearCacheConfirm] = useState(false)
  const [showBackupConfirm, setShowBackupConfirm] = useState(false)
  const [backupResult, setBackupResult] = useState<{
    backupId: string
    fileName: string
    fileSizeMb: number
  } | null>(null)

  // US-A-08: auto-refresh health & metrics every 30s
  const SYSTEM_POLLING_MS = 30_000
  const {
    data: health,
    isLoading: healthLoading,
    error: healthError,
    refetch: refetchHealth,
  } = useGetSystemHealthQuery(undefined, { pollingInterval: SYSTEM_POLLING_MS })
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
  } = useGetSystemMetricsQuery(undefined, { pollingInterval: SYSTEM_POLLING_MS })
  const [clearCache, { isLoading: isClearingCache }] = useClearCacheMutation()
  const [createBackup, { isLoading: isCreatingBackup }] = useCreateBackupMutation()

  const handleClearCache = async () => {
    try {
      await clearCache().unwrap()
      setShowClearCacheConfirm(false)
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }

  const handleCreateBackup = async () => {
    try {
      const result = await createBackup().unwrap()
      setBackupResult({
        backupId: result.backup_id,
        fileName: result.file_name,
        fileSizeMb: result.file_size_mb,
      })
      setShowBackupConfirm(false)
    } catch (error) {
      console.error('Failed to create backup:', error)
    }
  }

  const handleRefresh = () => {
    refetchHealth()
    refetchMetrics()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Status systemu</h1>
          <p className="mt-1 text-sm text-neutral-700">
            Monitoruj zdrowie systemu i wykonuj operacje administracyjne
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            onClick={handleRefresh}
          >
            Odśwież
          </button>
          <button
            className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
            disabled={isClearingCache}
            onClick={() => setShowClearCacheConfirm(true)}
          >
            {isClearingCache ? 'Czyszczenie...' : 'Wyczyść cache'}
          </button>
          <button
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            disabled={isCreatingBackup}
            onClick={() => setShowBackupConfirm(true)}
          >
            {isCreatingBackup ? 'Tworzenie...' : 'Utwórz backup'}
          </button>
        </div>
      </div>

      {/* Health and Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* System Health */}
        <div>
          {healthLoading ? (
            <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
              <div className="animate-pulse">
                <div className="h-16 border-b border-neutral-200 bg-neutral-50" />
                <div className="space-y-4 p-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 rounded bg-neutral-100" />
                  ))}
                </div>
              </div>
            </div>
          ) : healthError ? (
            <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center">
              <p className="text-red-600">Wystąpił błąd podczas ładowania statusu systemu</p>
              <button
                className="mt-4 font-medium text-primary-600 hover:text-primary-700"
                onClick={refetchHealth}
              >
                Spróbuj ponownie
              </button>
            </div>
          ) : health ? (
            <SystemHealthCard health={health} />
          ) : null}
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          {metricsLoading ? (
            <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
              <div className="animate-pulse">
                <div className="h-16 border-b border-neutral-200 bg-neutral-50" />
                <div className="space-y-4 p-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 rounded bg-neutral-100" />
                  ))}
                </div>
              </div>
            </div>
          ) : metricsError ? (
            <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center">
              <p className="text-red-600">Wystąpił błąd podczas ładowania metryk</p>
              <button
                className="mt-4 font-medium text-primary-600 hover:text-primary-700"
                onClick={refetchMetrics}
              >
                Spróbuj ponownie
              </button>
            </div>
          ) : metrics ? (
            <SystemMetricsChart metrics={metrics} />
          ) : null}
        </div>
      </div>

      {/* System Actions */}
      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-4">
          <h3 className="text-lg font-semibold text-neutral-900">Operacje systemowe</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Clear Cache Card */}
            <div className="rounded-lg border border-neutral-200 p-4 transition-colors hover:border-amber-300">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-lg bg-amber-100 p-2">
                  <svg
                    className="h-6 w-6 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-neutral-900">Wyczyść cache</h4>
              </div>
              <p className="mb-4 text-sm text-neutral-600">
                Czyści pamięć podręczną aplikacji. Może być przydatne po aktualizacjach.
              </p>
              <button
                className="w-full rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100"
                onClick={() => setShowClearCacheConfirm(true)}
              >
                Wyczyść cache
              </button>
            </div>

            {/* Create Backup Card */}
            <div className="rounded-lg border border-neutral-200 p-4 transition-colors hover:border-primary-300">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-lg bg-primary-100 p-2">
                  <svg
                    className="h-6 w-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-neutral-900">Utwórz backup</h4>
              </div>
              <p className="mb-4 text-sm text-neutral-600">
                Tworzy kopię zapasową bazy danych. Przydatne przed większymi zmianami.
              </p>
              <button
                className="w-full rounded-md border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100"
                onClick={() => setShowBackupConfirm(true)}
              >
                Utwórz backup
              </button>
            </div>

            {/* System Info Card */}
            <div className="rounded-lg border border-neutral-200 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-neutral-900">Informacje</h4>
              </div>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Wersja API:</dt>
                  <dd className="font-medium text-neutral-900">v1.0.0</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Strefa czasowa:</dt>
                  <dd className="font-medium text-neutral-900">Europe/Warsaw</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Środowisko:</dt>
                  <dd className="font-medium text-neutral-900">Production</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Cache Confirmation Modal */}
      {showClearCacheConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-neutral-900">
                Wyczyść pamięć podręczną
              </h3>
              <p className="mb-4 text-sm text-neutral-600">
                Czy na pewno chcesz wyczyścić pamięć podręczną systemu?
              </p>
              <p className="mb-4 rounded bg-amber-50 p-3 text-sm text-amber-600">
                Ta operacja może tymczasowo spowolnić działanie aplikacji do czasu ponownego
                wypełnienia cache.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  onClick={() => setShowClearCacheConfirm(false)}
                >
                  Anuluj
                </button>
                <button
                  className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                  disabled={isClearingCache}
                  onClick={handleClearCache}
                >
                  {isClearingCache ? 'Czyszczenie...' : 'Wyczyść'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Create Backup Confirmation Modal */}
      {showBackupConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-neutral-900">Utwórz kopię zapasową</h3>
              <p className="mb-4 text-sm text-neutral-600">
                Czy na pewno chcesz utworzyć kopię zapasową bazy danych?
              </p>
              <p className="mb-4 rounded bg-blue-50 p-3 text-sm text-blue-600">
                Operacja może potrwać kilka minut w zależności od rozmiaru bazy danych.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  onClick={() => setShowBackupConfirm(false)}
                >
                  Anuluj
                </button>
                <button
                  className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                  disabled={isCreatingBackup}
                  onClick={handleCreateBackup}
                >
                  {isCreatingBackup ? 'Tworzenie...' : 'Utwórz backup'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Backup Result Modal */}
      {backupResult ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-2">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  Backup utworzony pomyślnie
                </h3>
              </div>
              <dl className="mb-4 space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-neutral-500">ID backupu:</dt>
                  <dd className="font-mono text-sm text-neutral-900">{backupResult.backupId}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-neutral-500">Nazwa pliku:</dt>
                  <dd className="font-mono text-sm text-neutral-900">{backupResult.fileName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-neutral-500">Rozmiar:</dt>
                  <dd className="text-sm font-medium text-neutral-900">
                    {backupResult.fileSizeMb.toFixed(2)} MB
                  </dd>
                </div>
              </dl>
              <button
                className="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                onClick={() => setBackupResult(null)}
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default AdminSystemPage
