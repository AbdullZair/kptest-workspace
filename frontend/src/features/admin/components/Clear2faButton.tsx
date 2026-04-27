import React, { useState } from 'react'
import { useClear2faMutation } from '../../api/adminApi'

interface Clear2faButtonProps {
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
        className={`font-medium text-sm ${
          twoFactorEnabled
            ? 'text-red-600 hover:text-red-900'
            : 'text-gray-400 cursor-not-allowed'
        }`}
      >
        Usuń 2FA
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Usuń konfigurację 2FA</h3>
              <p className="text-sm text-gray-500 mt-1">{userEmail}</p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                  Błąd: {String(error)}
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Powód *
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Podaj powód usunięcia konfiguracji 2FA (wymagane do audytu)"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Powód zostanie zapisany w dzienniku audytu.
                </p>
              </div>

              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm">
                <p className="text-red-800 font-medium">Skutki tej operacji:</p>
                <ul className="mt-2 text-red-700 list-disc list-inside space-y-1">
                  <li>Sekret 2FA zostanie usunięty</li>
                  <li>Kody zapasowe zostaną unieważnione</li>
                  <li>Uwierzytelnianie dwuskładnikowe zostanie wyłączone</li>
                  {requiresTwoFactor && (
                    <li className="font-medium">
                      Konto zostanie ustawione w status "Wymaga ponownej konfiguracji"
                    </li>
                  )}
                </ul>
              </div>

              {requiresTwoFactor && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  <p className="text-yellow-800 font-medium">Uwaga:</p>
                  <p className="mt-1 text-yellow-700">
                    Rola {userRole} wymaga włączonego 2FA. Po usunięciu konfiguracji użytkownik
                    będzie musiał ponownie skonfigurować 2FA przed uzyskaniem dostępu do systemu.
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setReason('')
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !twoFactorEnabled}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {isLoading ? 'Usuwanie...' : 'Usuń 2FA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Clear2faButton
