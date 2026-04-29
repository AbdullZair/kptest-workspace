import React, { useState } from 'react'
import { useClear2faMutation } from '../api/adminApi'

export interface Clear2faButtonProps {
  userId: string
  userEmail: string
  userRole: string
  twoFactorEnabled: boolean
  onSuccess?: () => void
}

export const Clear2faButton: React.FC<Clear2faButtonProps> = ({
  userId,
  userEmail,
  userRole,
  twoFactorEnabled,
  onSuccess,
}) => {
  const [reason, setReason] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [clear2fa, { isLoading, error }] = useClear2faMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason.trim()) {
      alert('Podaj powód usunięcia konfiguracji 2FA')
      return
    }

    try {
      const result = await clear2fa({
        userId,
        body: { reason },
      }).unwrap()

      alert(result.message)

      setReason('')
      setShowModal(false)
      onSuccess?.()
    } catch (err) {
      console.error('Failed to clear 2FA:', err)
      alert('Błąd podczas usuwania konfiguracji 2FA')
    }
  }

  const requiresTwoFactor = userRole === 'DOCTOR' || userRole === 'ADMIN'

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={!twoFactorEnabled}
        className={`text-sm font-medium ${
          twoFactorEnabled ? 'text-red-600 hover:text-red-900' : 'cursor-not-allowed text-gray-400'
        }`}
      >
        Usuń 2FA
      </button>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Usuń konfigurację 2FA</h3>
              <p className="mt-1 text-sm text-gray-500">{userEmail}</p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4">
              {error ? (
                <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  Błąd: {String(error)}
                </div>
              ) : null}

              <div className="mb-4">
                <label htmlFor="reason" className="mb-2 block text-sm font-medium text-gray-700">
                  Powód *
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Podaj powód usunięcia konfiguracji 2FA (wymagane do audytu)"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Powód zostanie zapisany w dzienniku audytu.
                </p>
              </div>

              <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm">
                <p className="font-medium text-red-800">Skutki tej operacji:</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-red-700">
                  <li>Sekret 2FA zostanie usunięty</li>
                  <li>Kody zapasowe zostaną unieważnione</li>
                  <li>Uwierzytelnianie dwuskładnikowe zostanie wyłączone</li>
                  {requiresTwoFactor ? (
                    <li className="font-medium">
                      Konto zostanie ustawione w status "Wymaga ponownej konfiguracji"
                    </li>
                  ) : null}
                </ul>
              </div>

              {requiresTwoFactor ? (
                <div className="mb-4 rounded border border-yellow-200 bg-yellow-50 p-3 text-sm">
                  <p className="font-medium text-yellow-800">Uwaga:</p>
                  <p className="mt-1 text-yellow-700">
                    Rola {userRole} wymaga włączonego 2FA. Po usunięciu konfiguracji użytkownik
                    będzie musiał ponownie skonfigurować 2FA przed uzyskaniem dostępu do systemu.
                  </p>
                </div>
              ) : null}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setReason('')
                  }}
                  className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !twoFactorEnabled}
                  className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {isLoading ? 'Usuwanie...' : 'Usuń 2FA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default Clear2faButton
