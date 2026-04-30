import { Card, Button } from '@shared/components'
import { useAuth } from '@features/auth'

/**
 * ProfilePage Component
 *
 * User profile page
 */
export const ProfilePage = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Mój profil</h1>
        <p className="mt-1 text-neutral-600">Zarządzaj swoimi danymi</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile info */}
        <Card className="lg:col-span-2" variant="elevated">
          <Card.Header>
            <h2 className="text-lg font-semibold text-neutral-900">Informacje osobiste</h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700">Imię</label>
                  <p className="text-neutral-900">{user?.firstName || '-'}</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700">
                    Nazwisko
                  </label>
                  <p className="text-neutral-900">{user?.lastName || '-'}</p>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Email</label>
                <p className="text-neutral-900">{user?.email || '-'}</p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Rola</label>
                <p className="text-neutral-900">{user?.role || '-'}</p>
              </div>
            </div>
          </Card.Body>
          <Card.Footer>
            <Button variant="outline">Edytuj profil</Button>
          </Card.Footer>
        </Card>

        {/* Change password */}
        <Card variant="elevated">
          <Card.Header>
            <h2 className="text-lg font-semibold text-neutral-900">Bezpieczeństwo</h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-neutral-100 py-3">
                <svg
                  className="h-5 w-5 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                <span className="text-sm font-medium text-neutral-900">Zmień hasło</span>
              </div>

              <div className="flex items-center gap-3 py-3">
                <svg
                  className="h-5 w-5 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                <span className="text-sm font-medium text-neutral-900">Numer telefonu</span>
              </div>
            </div>
          </Card.Body>
          <Card.Footer>
            <Button fullWidth variant="outline">
              Zmień hasło
            </Button>
          </Card.Footer>
        </Card>
      </div>

      {/* Account actions */}
      <Card variant="elevated">
        <Card.Header>
          <h2 className="text-lg font-semibold text-neutral-900">Akcje konta</h2>
        </Card.Header>
        <Card.Body>
          <div className="flex gap-3">
            <Button variant="outline">Eksportuj dane</Button>
            <Button variant="danger">Usuń konto</Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default ProfilePage
