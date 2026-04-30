import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, PageLoader } from '@shared/components'
import { VerificationStatus } from '../../features/patients/ui'
import {
  useGetPatientByIdQuery,
  useUpdatePatientMutation,
  useDeletePatientMutation,
  useVerifyPatientMutation,
  openEditModal,
} from '../../features/patients'
import { useDispatch } from 'react-redux'
import { useState } from 'react'

/**
 * Format date for display
 */
const formatDate = (dateString?: string): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Get gender label
 */
const getGenderLabel = (gender?: string): string => {
  if (!gender) return '-'
  const labels: Record<string, string> = {
    MALE: 'Mężczyzna',
    FEMALE: 'Kobieta',
    OTHER: 'Inna',
    UNKNOWN: 'Nieustalone',
  }
  return labels[gender] || '-'
}

/**
 * PatientDetailPage Component
 *
 * Displays detailed information about a single patient
 */
export const PatientDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [cartNumber, setCartNumber] = useState('')

  // RTK Query hooks
  const {
    data: patient,
    isLoading,
    error,
    refetch,
  } = useGetPatientByIdQuery(id!, {
    skip: !id,
  })
  const [updatePatient] = useUpdatePatientMutation()
  const [deletePatient] = useDeletePatientMutation()
  const [verifyPatient, { isLoading: isVerifying }] = useVerifyPatientMutation()

  const dispatchEdit = () => {
    if (id) {
      dispatch(openEditModal(id))
    }
  }

  const handleDelete = async () => {
    if (
      window.confirm(
        `Czy na pewno chcesz usunąć pacjenta ${patient?.first_name} ${patient?.last_name}?`
      )
    ) {
      try {
        if (id) {
          await deletePatient(id).unwrap()
          navigate('/patients')
        }
      } catch (err) {
        console.error('Failed to delete patient:', err)
      }
    }
  }

  const handleVerify = async () => {
    if (!patient?.pesel || !cartNumber.trim()) return

    try {
      const result = await verifyPatient({
        pesel: patient.pesel,
        cart_number: cartNumber.trim(),
      }).unwrap()

      if (result.verified && result.his_patient_id) {
        await updatePatient({
          id: patient.id,
          patient: {
            his_patient_id: result.his_patient_id,
          },
        }).unwrap()

        setVerifyDialogOpen(false)
        setCartNumber('')
        refetch()
      }
    } catch (err) {
      console.error('Failed to verify patient:', err)
    }
  }

  const handleBack = () => {
    navigate('/patients')
  }

  if (isLoading) {
    return <PageLoader size="lg" text="Ładowanie danych pacjenta..." />
  }

  if (error || !patient) {
    return (
      <div className="py-12 text-center">
        <p className="text-error-600">Nie znaleziono pacjenta</p>
        <Button className="mt-4" variant="primary" onClick={handleBack}>
          Powrót do listy
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button size="sm" variant="ghost" onClick={handleBack}>
            <svg className="mr-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M15 19l-7-7 7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            Powrót
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {patient.first_name} {patient.last_name}
            </h1>
            <p className="mt-1 text-neutral-600">PESEL: {patient.pesel}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <VerificationStatus size="lg" status={patient.verification_status} />

          <Button variant="outline" onClick={dispatchEdit}>
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            Edytuj
          </Button>

          <Button variant="primary" onClick={() => setVerifyDialogOpen(true)}>
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            Weryfikuj HIS
          </Button>

          <Button variant="danger" onClick={handleDelete}>
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            Usuń
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Patient Information */}
        <Card className="lg:col-span-2" variant="elevated">
          <Card.Header>
            <h2 className="text-lg font-semibold text-neutral-900">Informacje o pacjencie</h2>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="border-b border-neutral-200 pb-2 text-sm font-medium text-neutral-900">
                  Dane osobowe
                </h3>

                <div>
                  <p className="text-sm text-neutral-500">Imię i nazwisko</p>
                  <p className="text-base font-medium text-neutral-900">
                    {patient.first_name} {patient.last_name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-neutral-500">PESEL</p>
                  <p className="font-mono text-base text-neutral-900">{patient.pesel}</p>
                </div>

                <div>
                  <p className="text-sm text-neutral-500">Data urodzenia</p>
                  <p className="text-base text-neutral-900">{formatDate(patient.date_of_birth)}</p>
                </div>

                <div>
                  <p className="text-sm text-neutral-500">Płeć</p>
                  <p className="text-base text-neutral-900">{getGenderLabel(patient.gender)}</p>
                </div>

                {patient.his_patient_id ? (
                  <div>
                    <p className="text-sm text-neutral-500">HIS Patient ID</p>
                    <p className="font-mono text-base text-neutral-900">{patient.his_patient_id}</p>
                  </div>
                ) : null}
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="border-b border-neutral-200 pb-2 text-sm font-medium text-neutral-900">
                  Dane kontaktowe
                </h3>

                {patient.email ? (
                  <div>
                    <p className="text-sm text-neutral-500">Email</p>
                    <p className="text-base text-neutral-900">{patient.email}</p>
                  </div>
                ) : null}

                {patient.phone ? (
                  <div>
                    <p className="text-sm text-neutral-500">Telefon</p>
                    <p className="text-base text-neutral-900">{patient.phone}</p>
                  </div>
                ) : null}

                {patient.address_street || patient.address_city ? (
                  <div>
                    <p className="text-sm text-neutral-500">Adres</p>
                    <p className="text-base text-neutral-900">
                      {patient.address_street ? <span>{patient.address_street}</span> : null}
                      {patient.address_postal_code ? (
                        <span>, {patient.address_postal_code}</span>
                      ) : null}
                      {patient.address_city ? <span> {patient.address_city}</span> : null}
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Verification Info */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="border-b border-neutral-200 pb-2 text-sm font-medium text-neutral-900">
                  Weryfikacja
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-500">Status weryfikacji</p>
                    <div className="mt-1">
                      <VerificationStatus showLabel status={patient.verification_status} />
                    </div>
                  </div>

                  {patient.verified_at ? (
                    <div>
                      <p className="text-sm text-neutral-500">Zweryfikowano</p>
                      <p className="text-base text-neutral-900">
                        {formatDate(patient.verified_at)}
                      </p>
                    </div>
                  ) : null}

                  {patient.verification_method ? (
                    <div>
                      <p className="text-sm text-neutral-500">Metoda weryfikacji</p>
                      <p className="text-base text-neutral-900">{patient.verification_method}</p>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="border-b border-neutral-200 pb-2 text-sm font-medium text-neutral-900">
                  Metadane
                </h3>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-neutral-500">Utworzono</p>
                    <p className="text-neutral-900">{formatDate(patient.created_at)}</p>
                  </div>

                  <div>
                    <p className="text-neutral-500">Ostatnia aktualizacja</p>
                    <p className="text-neutral-900">{formatDate(patient.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Quick Actions */}
        <Card variant="elevated">
          <Card.Header>
            <h2 className="text-lg font-semibold text-neutral-900">Szybkie akcje</h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-3">
              <Button fullWidth variant="outline">
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                Historia wizyt
              </Button>

              <Button fullWidth variant="outline">
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                Wyniki badań
              </Button>

              <Button fullWidth variant="outline">
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                Recepty
              </Button>

              <Button fullWidth variant="outline">
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                Dokumenty
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Verify Dialog */}
      {verifyDialogOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setVerifyDialogOpen(false)} />

          <div className="flex min-h-full items-center justify-center p-4">
            <Card className="relative z-10 w-full max-w-md" variant="elevated">
              <Card.Header>
                <h3 className="text-lg font-semibold text-neutral-900">Weryfikacja w HIS</h3>
              </Card.Header>
              <Card.Body>
                <p className="mb-4 text-sm text-neutral-600">
                  Wprowadź numer karty pacjenta, aby zweryfikować dane w systemie HIS.
                </p>

                <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium text-neutral-700">
                    Numer karty
                  </label>
                  <input
                    autoFocus
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Wpisz numer karty..."
                    type="text"
                    value={cartNumber}
                    onChange={(e) => setCartNumber(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setVerifyDialogOpen(false)}>
                    Anuluj
                  </Button>
                  <Button
                    disabled={!cartNumber.trim()}
                    loading={isVerifying}
                    variant="primary"
                    onClick={handleVerify}
                  >
                    Weryfikuj
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default PatientDetailPage
