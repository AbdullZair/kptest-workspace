import React, { useState } from 'react'
import { useGenerateActivationCodeMutation } from '../api/adminApi'

interface GenerateActivationCodeButtonProps {
  patientId: string
  patientName: string
  patientPesel: string
  onSuccess?: (code: string) => void
}

export const GenerateActivationCodeButton: React.FC<GenerateActivationCodeButtonProps> = ({
  patientId,
  patientName,
  patientPesel,
  onSuccess,
}) => {
  const [showModal, setShowModal] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [generateActivationCode, { isLoading, error }] = useGenerateActivationCodeMutation()

  const handleGenerate = async () => {
    try {
      const result = await generateActivationCode(patientId).unwrap()

      setGeneratedCode(result.activation_code)
      onSuccess?.(result.activation_code)
    } catch (err) {
      console.error('Failed to generate activation code:', err)
      alert('Błąd podczas generowania kodu aktywacyjnego')
    }
  }

  const handleDownloadPdf = () => {
    // In a real implementation, this would download the PDF
    alert('Pobieranie PDF z instrukcjami... (w implementacji produkcyjnej)')
  }

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode)
      alert('Kod skopiowany do schowka!')
    }
  }

  return (
    <>
      <button
        onClick={() => {
          setShowModal(true)
          setGeneratedCode(null)
        }}
        className="text-sm font-medium text-blue-600 hover:text-blue-900"
      >
        Generuj kod aktywacyjny
      </button>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-lg rounded-lg bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Kod aktywacyjny dla pacjenta</h3>
              <p className="mt-1 text-sm text-gray-500">{patientName}</p>
              <p className="text-xs text-gray-400">PESEL: {patientPesel}</p>
            </div>

            <div className="px-6 py-4">
              {error ? (
                <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  Błąd: {String(error)}
                </div>
              ) : null}

              {!generatedCode ? (
                <>
                  <div className="mb-4 rounded border border-blue-200 bg-blue-50 p-3 text-sm">
                    <p className="font-medium text-blue-800">Informacje o kodzie aktywacyjnym:</p>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-blue-700">
                      <li>Kod będzie miał 8 znaków (wielkie litery i cyfry)</li>
                      <li>Ważność kodu: 72 godziny</li>
                      <li>Pacjent może użyć kodu do aktywacji konta bez email/telefonu</li>
                      <li>Zostanie wygenerowany PDF z instrukcjami</li>
                    </ul>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Anuluj
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={isLoading}
                      className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isLoading ? 'Generowanie...' : 'Generuj kod'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <p className="mb-2 text-sm font-medium text-gray-700">Wygenerowany kod:</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 p-4 text-center">
                        <span className="font-mono text-3xl font-bold tracking-wider text-gray-900">
                          {generatedCode}
                        </span>
                      </div>
                      <button
                        onClick={handleCopyCode}
                        className="p-2 text-gray-600 hover:text-gray-900"
                        title="Kopiuj kod"
                      >
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-sm">
                    <p className="font-medium text-green-800">Kod wygenerowany pomyślnie!</p>
                    <p className="mt-1 text-green-700">
                      Kod jest ważny przez 72 godziny. PDF z instrukcjami został wygenerowany.
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={handleDownloadPdf}
                      className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Pobierz PDF
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Zamknij
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default GenerateActivationCodeButton
