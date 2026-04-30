import { useTranslation } from 'react-i18next'
import { Card, Button } from '@shared/components'
import { useState } from 'react'
import ChangePasswordDialog from '@features/auth/ui/ChangePasswordDialog'
import { LanguageSwitcher } from '@features/settings/ui/LanguageSwitcher'

/**
 * SettingsPage Component
 *
 * Application settings page
 */
export const SettingsPage = () => {
  const { t } = useTranslation()
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)

  return (
    <div className="space-y-6" data-testid="settings-page">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900" data-testid="settings-title">
          {t('settings.title')}
        </h1>
        <p className="mt-1 text-neutral-600">{t('settings.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* General settings */}
        <Card variant="elevated">
          <Card.Header>
            <h2 className="text-lg font-semibold text-neutral-900">{t('settings.general')}</h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 py-3">
                <div>
                  <p className="font-medium text-neutral-900">{t('settings.language')}</p>
                  <LanguageSwitcher />
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-neutral-100 py-3">
                <div>
                  <p className="font-medium text-neutral-900">{t('settings.timezone')}</p>
                  <p className="text-sm text-neutral-500">{t('settings.timezoneValue')}</p>
                </div>
                <Button size="sm" variant="outline">
                  {t('settings.change')}
                </Button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-neutral-900">{t('settings.theme')}</p>
                  <p className="text-sm text-neutral-500">{t('settings.themeValue')}</p>
                </div>
                <Button size="sm" variant="outline">
                  {t('settings.change')}
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Security */}
        <Card variant="elevated">
          <Card.Header>
            <h2 className="text-lg font-semibold text-neutral-900">{t('settings.security')}</h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 py-3">
                <div>
                  <p className="font-medium text-neutral-900">{t('settings.password')}</p>
                  <p className="text-sm text-neutral-500">{t('settings.passwordDesc')}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setIsChangePasswordOpen(true)}>
                  {t('settings.change')}
                </Button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-neutral-900">{t('settings.twoFactor')}</p>
                  <p className="text-sm text-neutral-500">{t('settings.twoFactorDesc')}</p>
                </div>
                <Button size="sm" variant="outline">
                  {t('settings.enable')}
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Notifications */}
        <Card variant="elevated">
          <Card.Header>
            <h2 className="text-lg font-semibold text-neutral-900">
              {t('settings.notifications')}
            </h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 py-3">
                <div>
                  <p className="font-medium text-neutral-900">{t('settings.email')}</p>
                  <p className="text-sm text-neutral-500">{t('settings.emailDesc')}</p>
                </div>
                <input
                  defaultChecked
                  className="h-5 w-5 rounded text-primary-600"
                  type="checkbox"
                />
              </div>

              <div className="flex items-center justify-between border-b border-neutral-100 py-3">
                <div>
                  <p className="font-medium text-neutral-900">{t('settings.push')}</p>
                  <p className="text-sm text-neutral-500">{t('settings.pushDesc')}</p>
                </div>
                <input className="h-5 w-5 rounded text-primary-600" type="checkbox" />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-neutral-900">{t('settings.sms')}</p>
                  <p className="text-sm text-neutral-500">{t('settings.smsDesc')}</p>
                </div>
                <input className="h-5 w-5 rounded text-primary-600" type="checkbox" />
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button variant="primary">{t('settings.saveChanges')}</Button>
      </div>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  )
}

export default SettingsPage
