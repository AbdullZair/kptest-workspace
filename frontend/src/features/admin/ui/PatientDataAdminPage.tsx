import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetPatientDataQuery } from '../api/adminApi'
import { AnonymizePatientDialog } from './AnonymizePatientDialog'
import { ExportPatientDataButton } from './ExportPatientDataButton'
import { ErasePatientDialog } from './ErasePatientDialog'
import { Button } from '@shared/components'
import { PageLoader } from '@shared/components'

type TabType = 'view' | 'anonymize' | 'export' | 'erase' | 'audit'

/**
 * PatientDataAdminPage Component
 *
 * Admin page for managing patient data with RODO compliance features
 * Implements US-A-10 through US-A-13
 *
 * Tabs:
 * - View: Patient data overview
 * - Anonymize: Anonymize patient data (US-A-10)
 * - Export: Export patient data (US-A-11, RODO Art. 20)
 * - Erase: Permanently erase patient data (US-A-12, RODO Art. 17)
 * - Audit: Audit trail for patient data operations
 */
export const PatientDataAdminPage: React.FC = () => {
  const { id: patientId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('view')
  const [showAnonymizeDialog, setShowAnonymizeDialog] = useState(false)
  const [showEraseDialog, setShowEraseDialog] = useState(false)

  const { data: patient, isLoading, error, refetch } = useGetPatientDataQuery(patientId!, {
    skip: !patientId,
  })

  const TABS: { id: TabType; label: string; icon: string }[] = [
    { id: 'view', label: 'Podgląd', icon: '👁️' },
    { id: 'anonymize', label: 'Anonimizuj', icon: '🔒' },
    { id: 'export', label: 'Eksportuj', icon: '📥' },
    { id: 'erase', label: 'Usuń', icon: '🗑️' },
    { id: 'audit', label: 'Audit Trail', icon: '📋' },
  ]

  if (isLoading) {
    return <PageLoader />
  }

  if (error || !patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-600 text-lg mb-4">Wystąpił błąd podczas ładowania danych pacjenta</p>
        <Button variant="primary" onClick={() => navigate('/admin/users')}>
          Powrót do listy użytkowników
        </Button>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'view':
        return (
          <div className="space-y-6">
            {/* Patient Info */}
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Dane osobowe</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-neutral-500">PESEL</dt>
                  <dd className="mt-1 text-sm text-neutral-900 font-mono">{patient.pesel}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-500">Imię i nazwisko</dt>
                  <dd className="mt-1 text-sm text-neutral-900">
                    {patient.first_name} {patient.last_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-500">Email</dt>
                  <dd className="mt-1 text-sm text-neutral-900">{patient.email}</dd>
                </div>
                {patient.phone && (
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">Telefon</dt>
                    <dd className="mt-1 text-sm text-neutral-900">{patient.phone}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-neutral-500">Data urodzenia</dt>
                  <dd className="mt-1 text-sm text-neutral-900">
                    {new Date(patient.date_of_birth).toLocaleDateString('pl-PL')}
                  </dd>
                </div>
                {(patient.address_street || patient.address_city || patient.address_postal_code) && (
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">Adres</dt>
                    <dd className="mt-1 text-sm text-neutral-900">
                      {[patient.address_street, patient.address_postal_code, patient.address_city]
                        .filter(Boolean)
                        .join(', ')}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-neutral-500">Utworzono</dt>
                  <dd className="mt-1 text-sm text-neutral-900">
                    {new Date(patient.created_at).toLocaleDateString('pl-PL')}
                  </dd>
                </div>
                {patient.deleted_at && (
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">Usunięto</dt>
                    <dd className="mt-1 text-sm text-red-600">
                      {new Date(patient.deleted_at).toLocaleDateString('pl-PL')}
                    </dd>
                  </div>
                )}
                {patient.anonymized_at && (
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">Anonimizowano</dt>
                    <dd className="mt-1 text-sm text-amber-600">
                      {new Date(patient.anonymized_at).toLocaleDateString('pl-PL')}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Projects */}
            {patient.projects.length > 0 && (
              <div className="bg-white border border-neutral-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Projekty</h3>
                <div className="space-y-2">
                  {patient.projects.map((project) => (
                    <div
                      key={project.project_id}
                      className="flex items-center justify-between p-3 bg-neutral-50 rounded-md"
                    >
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{project.project_name}</p>
                        <p className="text-xs text-neutral-500">
                          Rola: {project.role} • Dołączono:{' '}
                          {new Date(project.enrolled_at).toLocaleDateString('pl-PL')}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          project.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {project.active ? 'Aktywny' : 'Nieaktywny'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'anonymize':
        return (
          <div className="space-y-4">
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Anonimizacja danych</h3>
              <p className="text-sm text-neutral-600 mb-4">
                Anonimizacja zastępuje dane osobowe pacjenta danymi anonimizowanymi. Operacja jest nieodwracalna.
              </p>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md mb-4">
                <p className="text-sm text-amber-800">
                  <strong>Zakres anonimizacji:</strong>
                </p>
                <ul className="text-sm text-amber-700 mt-2 list-disc list-inside space-y-1">
                  <li>PESEL → XXXXXXXXXXX-{patient.patient_id.slice(0, 4)}</li>
                  <li>Imię → ANON</li>
                  <li>Nazwisko → ANON-{patient.patient_id.slice(0, 4)}</li>
                  <li>Email → anon-{patient.patient_id}@deleted.local</li>
                  <li>Telefon → null</li>
                  <li>Data urodzenia → null</li>
                  <li>Adres → null</li>
                </ul>
              </div>
              <Button variant="danger" onClick={() => setShowAnonymizeDialog(true)}>
                Rozpocznij anonimizację
              </Button>
            </div>
          </div>
        )

      case 'export':
        return (
          <div className="space-y-4">
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Eksport danych (RODO Art. 20)</h3>
              <p className="text-sm text-neutral-600 mb-4">
                Eksportuj kompletne dane pacjenta w formacie JSON lub PDF. Eksport zawiera: dane osobowe, projekty,
                wiadomości, materiały, zdarzenia, quizy, badge i audit log.
              </p>
              <ExportPatientDataButton patientId={patient.patient_id} patientName={`${patient.first_name}_${patient.last_name}`} onSuccess={refetch} />
            </div>
          </div>
        )

      case 'erase':
        return (
          <div className="space-y-4">
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Trwałe usunięcie (RODO Art. 17)</h3>
              <p className="text-sm text-neutral-600 mb-4">
                Trwałe usunięcie wszystkich danych pacjenta z systemu. Operacja wymaga upływu 30-dniowego okresu
                karencji od momentu usunięcia pacjenta.
              </p>
              <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
                <p className="text-sm text-red-800">
                  <strong>Uwaga:</strong> Ta operacja jest nieodwracalna. Wszystkie dane pacjenta zostaną trwale
                  usunięte.
                </p>
              </div>
              {patient.deleted_at ? (
                <ErasePatientDialog
                  isOpen={showEraseDialog}
                  onClose={() => setShowEraseDialog(false)}
                  patientId={patient.patient_id}
                  patientName={`${patient.first_name} ${patient.last_name}`}
                  deletedAt={patient.deleted_at}
                  onSuccess={refetch}
                />
              ) : null}
              <Button
                variant="danger"
                onClick={() => setShowEraseDialog(true)}
                disabled={!patient.deleted_at}
              >
                {patient.deleted_at ? 'Rozpocznij trwałe usunięcie' : 'Brak możliwości usunięcia (pacjent nie został usunięty)'}
              </Button>
              {!patient.deleted_at && (
                <p className="text-sm text-neutral-500 mt-2">
                  Aby móc trwale usunąć dane, pacjent musi najpierw zostać usunięty (miękkie usunięcie).
                </p>
              )}
            </div>
          </div>
        )

      case 'audit':
        return (
          <div className="space-y-4">
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Audit Trail</h3>
              <p className="text-sm text-neutral-600 mb-4">
                Historia operacji na danych pacjenta. Audit log zawiera wszystkie operacje CREATE, UPDATE, DELETE, VIEW
                oraz specjalne operacje RODO (ANONYMIZE, ERASURE).
              </p>
              <div className="text-sm text-neutral-500">
                <p>Audit log jest dostępny w panelu administracyjnym:</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => navigate('/admin/audit-logs')}
                >
                  Przejdź do Audit Logs
                </Button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dane pacjenta</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {patient.first_name} {patient.last_name} (PESEL: {patient.pesel})
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/users')}>
          Powrót
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Anonymize Dialog */}
      <AnonymizePatientDialog
        isOpen={showAnonymizeDialog}
        onClose={() => setShowAnonymizeDialog(false)}
        patientId={patient.patient_id}
        patientName={`${patient.first_name} ${patient.last_name}`}
        onSuccess={refetch}
      />
    </div>
  )
}

export default PatientDataAdminPage
