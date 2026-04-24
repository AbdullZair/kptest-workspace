import { useState } from 'react'
import {
  useGetSystemHealthQuery,
  useGetSystemMetricsQuery,
  useClearCacheMutation,
  useCreateBackupMutation,
} from '../api/adminApi'
import { SystemHealthCard, SystemMetricsChart } from '../components'
import { clsx } from 'clsx'

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

  const { data: health, isLoading: healthLoading, error: healthError, refetch: refetchHealth } = useGetSystemHealthQuery()
  const { data: metrics, isLoading: metricsLoading, error: metricsError, refetch: refetchMetrics } = useGetSystemMetricsQuery()
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
          <p className="mt-1 text-sm text-neutral-500">
            Monitoruj zdrowie systemu i wykonuj operacje administracyjne
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50"
          >
            Odśwież
          </button>
          <button
            onClick={() => setShowClearCacheConfirm(true)}
            disabled={isClearingCache}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 disabled:opacity-50"
          >
            {isClearingCache ? 'Czyszczenie...' : 'Wyczyść cache'}
          </button>
          <button
            onClick={() => setShowBackupConfirm(true)}
            disabled={isCreatingBackup}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {isCreatingBackup ? 'Tworzenie...' : 'Utwórz backup'}
          </button>
        </div>
      </div>

      {/* Health and Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div>
          {healthLoading ? (
            <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
              <div className="animate-pulse">
                <div className="h-16 bg-neutral-50 border-b border-neutral-200" />
                <div className="p-6 space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 bg-neutral-100 rounded" />
                  ))}
                </div>
              </div>
            </div>
          ) : healthError ? (
            <div className="bg-white rounded-lg border border-neutral-200 p-6 text-center">
              <p className="text-red-600">Wystąpił błąd podczas ładowania statusu systemu</p>
              <button
                onClick={refetchHealth}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
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
            <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
              <div className="animate-pulse">
                <div className="h-16 bg-neutral-50 border-b border-neutral-200" />
                <div className="p-6 space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 bg-neutral-100 rounded" />
                  ))}
                </div>
              </div>
            </div>
          ) : metricsError ? (
            <div className="bg-white rounded-lg border border-neutral-200 p-6 text-center">
              <p className="text-red-600">Wystąpił błąd podczas ładowania metryk</p>
              <button
                onClick={refetchMetrics}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
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
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
          <h3 className="text-lg font-semibold text-neutral-900">Operacje systemowe</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Clear Cache Card */}
            <div className="border border-neutral-200 rounded-lg p-4 hover:border-amber-300 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-neutral-900">Wyczyść cache</h4>
              </div>
              <p className="text-sm text-neutral-600 mb-4">
                Czyści pamięć podręczną aplikacji. Może być przydatne po aktualizacjach.
              </p>
              <button
                onClick={() => setShowClearCacheConfirm(true)}
                className="w-full px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100"
              >
                Wyczyść cache
              </button>
            </div>

            {/* Create Backup Card */}
            <div className="border border-neutral-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-neutral-900">Utwórz backup</h4>
              </div>
              <p className="text-sm text-neutral-600 mb-4">
                Tworzy kopię zapasową bazy danych. Przydatne przed większymi zmianami.
              </p>
              <button
                onClick={() => setShowBackupConfirm(true)}
                className="w-full px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100"
              >
                Utwórz backup
              </button>
            </div>

            {/* System Info Card */}
            <div className="border border-neutral-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
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
      {showClearCacheConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Wyczyść pamięć podręczną
              </h3>
              <p className="text-sm text-neutral-600 mb-4">
                Czy na pewno chcesz wyczyścić pamięć podręczną systemu?
              </p>
              <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded mb-4">
                Ta operacja może tymczasowo spowolnić działanie aplikacji do czasu ponownego wypełnienia cache.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowClearCacheConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleClearCache}
                  disabled={isClearingCache}
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 disabled:opacity-50"
                >
                  {isClearingCache ? 'Czyszczenie...' : 'Wyczyść'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Backup Confirmation Modal */}
      {showBackupConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Utwórz kopię zapasową
              </h3>
              <p className="text-sm text-neutral-600 mb-4">
                Czy na pewno chcesz utworzyć kopię zapasową bazy danych?
              </p>
              <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded mb-4">
                Operacja może potrwać kilka minut w zależności od rozmiaru bazy danych.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowBackupConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleCreateBackup}
                  disabled={isCreatingBackup}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {isCreatingBackup ? 'Tworzenie...' : 'Utwórz backup'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup Result Modal */}
      {backupResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  Backup utworzony pomyślnie
                </h3>
              </div>
              <dl className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <dt className="text-sm text-neutral-500">ID backupu:</dt>
                  <dd className="text-sm font-mono text-neutral-900">{backupResult.backupId}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-neutral-500">Nazwa pliku:</dt>
                  <dd className="text-sm font-mono text-neutral-900">{backupResult.fileName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-neutral-500">Rozmiar:</dt>
                  <dd className="text-sm font-medium text-neutral-900">{backupResult.fileSizeMb.toFixed(2)} MB</dd>
                </div>
              </dl>
              <button
                onClick={() => setBackupResult(null)}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSystemPage
