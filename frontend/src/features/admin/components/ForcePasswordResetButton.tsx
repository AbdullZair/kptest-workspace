import React, { useState } from 'react'
import { useForcePasswordResetMutation } from '../api/adminApi'

interface ForcePasswordResetButtonProps {
  userId: string
  userEmail: string
  onSuccess?: () => void
}

export const ForcePasswordResetButton: React.FC<ForcePasswordResetButtonProps> = ({
  userId,
  userEmail,
  onSuccess,
}) => {
  const [reason, setReason] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [forcePasswordReset, { isLoading, error }] = useForcePasswordResetMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason.trim()) {
      alert('Podaj powód resetu hasła')
      return
    }

    try {
      const result = await forcePasswordReset({
        userId,
        body: { reason },
      }).unwrap()

      alert(
        `Hasło zostało zresetowane.\n\nTymczasowe hasło: ${result.temporary_password}\n\n${result.message}`
      )

      setReason('')
      setShowModal(false)
      onSuccess?.()
    } catch (err) {
      console.error('Failed to force password reset:', err)
      alert('Błąd podczas resetowania hasła')
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-orange-600 hover:text-orange-900 font-medium text-sm"
      >
        Resetuj hasło
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Wymuś reset hasła</h3>
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Podaj powód wymuszenia resetu hasła (wymagane do audytu)"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Powód zostanie zapisany w dzienniku audytu.
                </p>
              </div>

              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <p className="text-yellow-800 font-medium">Skutki tej operacji:</p>
                <ul className="mt-2 text-yellow-700 list-disc list-inside space-y-1">
                  <li>Wszystkie sesje użytkownika zostaną unieważnione</li>
                  <li>Użytkownik musi ustawić nowe hasło przy następnym logowaniu</li>
                  <li>Tymczasowe hasło zostanie wygenerowane</li>
                </ul>
              </div>

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
                  disabled={isLoading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                >
                  {isLoading ? 'Resetowanie...' : 'Resetuj hasło'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default ForcePasswordResetButton
