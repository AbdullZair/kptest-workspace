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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{t('settings.title')}</h1>
        <p className="text-neutral-600 mt-1">{t('settings.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General settings */}
        <Card variant="elevated">
          <Card.Header>
            <h2 className="text-lg font-semibold text-neutral-900">{t('settings.general')}</h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                <div>
                  <p className="font-medium text-neutral-900">{t('settings.language')}</p>
                  <LanguageSwitcher />
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                <div>
                  <p className="font-medium text-neutral-900">{t('settings.timezone')}</p>
                  <p className="text-sm text-neutral-500">{t('settings.timezoneValue')}</p>
                </div>
                <Button variant="outline" size="sm">{t('settings.change')}</Button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-neutral-900">{t('settings.theme')}</p>
                  <p className="text-sm text-neutral-500">{t('settings.themeValue')}</p>
                </div>
                <Button variant="outline" size="sm">{t('settings.change')}</Button>
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
              <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                <div>
                  <p className="font-medium text-neutral-900">{t('settings.password')}</p>
                  <p className="text-sm text-neutral-500">{t('settings.passwordDesc')}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsChangePasswordOpen(true)}
                >
                  {t('settings.change')}
                </Button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-neutral-900">{t('settings.twoFactor')}</p>
                  <p className="text-sm text-neutral-500">{t('settings.twoFactorDesc')}</p>
                </div>
                <Button variant="outline" size="sm">{t('settings.enable')}</Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Notifications */}
        <Card variant="elevated">
          <Card.Header>
            <h2 className="text-lg font-semibold text-neutral-900">{t('settings.notifications')}</h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                <div>
                  <p className="font-medium text-neutral-900">{t('settings.email')}</p>
                  <p className="text-sm text-neutral-500">{t('settings.emailDesc')}</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-primary-600 rounded" defaultChecked />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                <div>
                  <p className="font-medium text-neutral-900">{t('settings.push')}</p>
                  <p className="text-sm text-neutral-500">{t('settings.pushDesc')}</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-primary-600 rounded" />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-neutral-900">{t('settings.sms')}</p>
                  <p className="text-sm text-neutral-500">{t('settings.smsDesc')}</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-primary-600 rounded" />
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
