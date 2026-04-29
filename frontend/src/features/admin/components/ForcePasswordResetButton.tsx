import React, { useState } from 'react'
import { useForcePasswordResetMutation } from '../api/adminApi'

export interface ForcePasswordResetButtonProps {
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
        className="text-sm font-medium text-orange-600 hover:text-orange-900"
      >
        Resetuj hasło
      </button>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Wymuś reset hasła</h3>
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
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Podaj powód wymuszenia resetu hasła (wymagane do audytu)"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Powód zostanie zapisany w dzienniku audytu.
                </p>
              </div>

              <div className="mb-4 rounded border border-yellow-200 bg-yellow-50 p-3 text-sm">
                <p className="font-medium text-yellow-800">Skutki tej operacji:</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-yellow-700">
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
                  className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-md bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                >
                  {isLoading ? 'Resetowanie...' : 'Resetuj hasło'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default ForcePasswordResetButton
