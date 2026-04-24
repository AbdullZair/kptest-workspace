import { useState } from 'react'
import { useGetPreferencesQuery, useUpdatePreferencesMutation } from '../api/notificationApi'
import { PreferenceToggle, QuietHoursPicker } from '../components'
import { Button } from '@shared/components/Button'
import type { NotificationPreferencesFormData } from '@entities/notification'

/**
 * NotificationPreferencesPage Component
 *
 * Page for managing notification preferences
 *
 * @route /notifications/preferences
 */
export const NotificationPreferencesPage = function NotificationPreferencesPage() {
  const { data: preferences, isLoading: isLoadingPreferences } = useGetPreferencesQuery()
  const [updatePreferences, { isLoading: isSaving }] = useUpdatePreferencesMutation()

  const [localPreferences, setLocalPreferences] = useState<NotificationPreferencesFormData>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Handle preference change
  const handlePreferenceChange = (key: keyof NotificationPreferencesFormData, value: boolean) => {
    setLocalPreferences((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
    setSaveSuccess(false)
  }

  // Handle quiet hours change
  const handleQuietHoursChange = (start: string, end: string) => {
    setLocalPreferences((prev) => ({
      ...prev,
      quiet_hours_start: start,
      quiet_hours_end: end,
    }))
    setHasChanges(true)
    setSaveSuccess(false)
  }

  // Handle save
  const handleSave = async () => {
    try {
      await updatePreferences(localPreferences).unwrap()
      setHasChanges(false)
      setSaveSuccess(true)
      setLocalPreferences({})

      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to update preferences:', error)
      alert('Nie udało się zapisać preferencji')
    }
  }

  // Handle reset to defaults
  const handleReset = async () => {
    try {
      await updatePreferences({
        message_notifications: true,
        event_notifications: true,
        material_notifications: true,
        reminder_notifications: true,
        email_enabled: false,
        sms_enabled: false,
        push_enabled: true,
        quiet_hours_start: '22:00',
        quiet_hours_end: '07:00',
      }).unwrap()
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to reset preferences:', error)
      alert('Nie udało się przywrócić ustawień domyślnych')
    }
  }

  if (isLoadingPreferences) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent" />
          <p className="mt-4 text-sm text-neutral-500">Ładowanie preferencji...</p>
        </div>
      </div>
    )
  }

  const currentPreferences = {
    ...preferences,
    ...localPreferences,
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-neutral-900">Ustawienia powiadomień</h1>
            <div className="flex items-center gap-3">
              {saveSuccess && (
                <span className="text-sm text-green-600 font-medium">Zapisano!</span>
              )}
              {hasChanges && (
                <Button variant="primary" size="sm" onClick={handleSave} loading={isSaving}>
                  Zapisz zmiany
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Notification Types */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-900">Typy powiadomień</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Wybierz, które typy powiadomień chcesz otrzymywać
              </p>
            </div>
            <div className="divide-y divide-neutral-100">
              <PreferenceToggle
                label="Powiadomienia o wiadomościach"
                description="Otrzymuj powiadomienia o nowych wiadomościach"
                checked={currentPreferences.message_notifications ?? true}
                onChange={(checked) => handlePreferenceChange('message_notifications', checked)}
              />
              <PreferenceToggle
                label="Powiadomienia o wydarzeniach"
                description="Otrzymuj powiadomienia o wydarzeniach i zmianach w harmonogramie"
                checked={currentPreferences.event_notifications ?? true}
                onChange={(checked) => handlePreferenceChange('event_notifications', checked)}
              />
              <PreferenceToggle
                label="Powiadomienia o materiałach"
                description="Otrzymuj powiadomienia o nowych materiałach"
                checked={currentPreferences.material_notifications ?? true}
                onChange={(checked) => handlePreferenceChange('material_notifications', checked)}
              />
              <PreferenceToggle
                label="Przypomnienia"
                description="Otrzymuj przypomnienia o nadchodzących wydarzeniach"
                checked={currentPreferences.reminder_notifications ?? true}
                onChange={(checked) => handlePreferenceChange('reminder_notifications', checked)}
              />
            </div>
          </div>

          {/* Delivery Channels */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-900">Kanały powiadomień</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Wybierz, w jaki sposób chcesz otrzymywać powiadomienia
              </p>
            </div>
            <div className="divide-y divide-neutral-100">
              <PreferenceToggle
                label="Powiadomienia push"
                description="Powiadomienia w przeglądarce i aplikacji mobilnej"
                checked={currentPreferences.push_enabled ?? true}
                onChange={(checked) => handlePreferenceChange('push_enabled', checked)}
              />
              <PreferenceToggle
                label="Powiadomienia email"
                description="Powiadomienia wysyłane na adres email"
                checked={currentPreferences.email_enabled ?? false}
                onChange={(checked) => handlePreferenceChange('email_enabled', checked)}
              />
              <PreferenceToggle
                label="Powiadomienia SMS"
                description="Powiadomienia wysyłane jako wiadomości SMS"
                checked={currentPreferences.sms_enabled ?? false}
                onChange={(checked) => handlePreferenceChange('sms_enabled', checked)}
              />
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-900">Godziny ciszy</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Ustaw godziny, w których nie chcesz otrzymywać powiadomień
              </p>
            </div>
            <div className="p-6">
              <QuietHoursPicker
                startTime={currentPreferences.quiet_hours_start ?? '22:00'}
                endTime={currentPreferences.quiet_hours_end ?? '07:00'}
                onChange={handleQuietHoursChange}
              />
            </div>
          </div>

          {/* Reset to defaults */}
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={handleReset}>
              Przywróć ustawienia domyślne
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default NotificationPreferencesPage
