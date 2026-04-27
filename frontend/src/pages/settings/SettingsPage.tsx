import { Card, Button } from '@shared/components'
import { useState } from 'react'
import ChangePasswordDialog from '@features/auth/ui/ChangePasswordDialog'

/**
 * SettingsPage Component
 *
 * Application settings page
 */
export const SettingsPage = () => {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Ustawienia</h1>
        <p className="text-neutral-600 mt-1">Konfiguracja aplikacji</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General settings */}
        <Card variant="elevated">
          <Card.Header>
            <h2 className="text-lg font-semibold text-neutral-900">Ogólne</h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                <div>
                  <p className="font-medium text-neutral-900">Język</p>
                  <p className="text-sm text-neutral-500">Polski</p>
                </div>
                <Button variant="outline" size="sm">Zmień</Button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                <div>
                  <p className="font-medium text-neutral-900">Strefa czasowa</p>
                  <p className="text-sm text-neutral-500">Europa/Warszawa</p>
                </div>
                <Button variant="outline" size="sm">Zmień</Button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-neutral-900">Motyw</p>
                  <p className="text-sm text-neutral-500">Jasny</p>
                </div>
                <Button variant="outline" size="sm">Zmień</Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Security */}
        <Card variant="elevated">
          <Card.Header>
            <h2 className="text-lg font-semibold text-neutral-900">Bezpieczeństwo</h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                <div>
                  <p className="font-medium text-neutral-900">Hasło</p>
                  <p className="text-sm text-neutral-500">Zmień hasło do konta</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsChangePasswordOpen(true)}
                >
                  Zmień
                </Button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-neutral-900">Weryfikacja dwuetapowa</p>
                  <p className="text-sm text-neutral-500">2FA jest wyłączone</p>
                </div>
                <Button variant="outline" size="sm">Włącz</Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Notifications */}
        <Card variant="elevated">
          <Card.Header>
            <h2 className="text-lg font-semibold text-neutral-900">Powiadomienia</h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                <div>
                  <p className="font-medium text-neutral-900">Email</p>
                  <p className="text-sm text-neutral-500">Powiadomienia email</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-primary-600 rounded" defaultChecked />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                <div>
                  <p className="font-medium text-neutral-900">Push</p>
                  <p className="text-sm text-neutral-500">Powiadomienia push</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-primary-600 rounded" />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-neutral-900">SMS</p>
                  <p className="text-sm text-neutral-500">Powiadomienia SMS</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-primary-600 rounded" />
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button variant="primary">Zapisz zmiany</Button>
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
