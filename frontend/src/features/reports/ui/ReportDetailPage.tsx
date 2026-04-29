import { useParams, useNavigate } from 'react-router-dom'
import {
  useGetComplianceReportQuery,
  useGetPatientStatsQuery,
  useGetProjectStatsQuery,
  useGetMaterialStatsQuery,
} from '../api'
import { ComplianceChart, PatientStatsCard, ProjectStatsCard, ExportButton } from '../components'

/**
 * ReportDetailPage Component
 *
 * Displays detailed view of a specific report
 */
export const ReportDetailPage = () => {
  const { type, id } = useParams<{ type: string; id: string }>()
  const navigate = useNavigate()

  const { data: complianceReport, isLoading: complianceLoading } = useGetComplianceReportQuery(
    type === 'compliance' && id
      ? {
          projectId: id,
          dateFrom: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          dateTo: new Date().toISOString().split('T')[0],
        }
      : (undefined as any),
    { skip: type !== 'compliance' || !id }
  )

  const { data: patientStats, isLoading: patientLoading } = useGetPatientStatsQuery(
    type === 'patient' && id ? { patientId: id } : (undefined as any),
    { skip: type !== 'patient' || !id }
  )

  const { data: projectStats, isLoading: projectLoading } = useGetProjectStatsQuery(
    type === 'project' && id ? { projectId: id } : (undefined as any),
    { skip: type !== 'project' || !id }
  )

  const { data: materialStats, isLoading: materialLoading } = useGetMaterialStatsQuery(
    type === 'material' && id ? { projectId: id } : (undefined as any),
    { skip: type !== 'material' || !id }
  )

  const isLoading = complianceLoading || patientLoading || projectLoading || materialLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    )
  }

  const renderContent = () => {
    switch (type) {
      case 'compliance':
        return renderComplianceReport()
      case 'patient':
        return renderPatientStats()
      case 'project':
        return renderProjectStats()
      case 'material':
        return renderMaterialStats()
      default:
        return <div className="text-neutral-500">Nieznany typ raportu</div>
    }
  }

  const renderComplianceReport = () => {
    if (!complianceReport) return null

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Raport Compliance</h1>
            <p className="mt-1 text-neutral-600">{complianceReport.project_name}</p>
          </div>
          <ExportButton reportType="COMPLIANCE" projectId={id} label="Eksportuj PDF" />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm text-neutral-600">Overall Compliance</p>
            <p
              className={`mt-2 text-3xl font-bold ${complianceReport.is_compliant ? 'text-emerald-600' : 'text-red-600'}`}
            >
              {complianceReport.overall_compliance.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm text-neutral-600">Zadania</p>
            <p className="mt-2 text-3xl font-bold text-neutral-900">
              {complianceReport.completed_tasks}/{complianceReport.total_tasks}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm text-neutral-600">Zaległe</p>
            <p className="mt-2 text-3xl font-bold text-red-600">{complianceReport.overdue_tasks}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm text-neutral-600">Threshold</p>
            <p className="mt-2 text-3xl font-bold text-neutral-900">
              {complianceReport.compliance_threshold}%
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">Trend Compliance</h2>
          <ComplianceChart
            data={complianceReport.compliance_trend}
            overallCompliance={complianceReport.overall_compliance}
            threshold={complianceReport.compliance_threshold}
            height={300}
          />
        </div>

        {/* Non-compliant Items */}
        {complianceReport.non_compliant_items.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">Elementy Niezgodne</h2>
            <div className="space-y-3">
              {complianceReport.non_compliant_items.map((item, index) => (
                <div key={index} className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="font-medium text-red-900">{item.description}</p>
                  <p className="mt-1 text-sm text-red-700">
                    Termin: {item.due_date} | Przypisany do: {item.assigned_to}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderPatientStats = () => {
    if (!patientStats) return null

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Statystyki Pacjenta</h1>
            <p className="mt-1 text-neutral-600">{patientStats.patient_name}</p>
          </div>
          <ExportButton reportType="PATIENT_STATS" patientId={id} label="Eksportuj PDF" />
        </div>

        <PatientStatsCard stats={patientStats} />

        {/* Project Stats */}
        {patientStats.project_stats.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">Projekty</h2>
            <div className="space-y-3">
              {patientStats.project_stats.map((proj, index) => (
                <div key={index} className="rounded-lg border border-neutral-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-neutral-900">{proj.project_name}</p>
                      <p className="mt-1 text-sm text-neutral-600">Etap: {proj.current_stage}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-neutral-900">
                        {proj.compliance_score.toFixed(1)}%
                      </p>
                      <p className="text-sm text-neutral-600">{proj.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderProjectStats = () => {
    if (!projectStats) return null

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Statystyki Projektu</h1>
            <p className="mt-1 text-neutral-600">{projectStats.project_name}</p>
          </div>
          <ExportButton reportType="PROJECT_STATS" projectId={id} label="Eksportuj PDF" />
        </div>

        <ProjectStatsCard stats={projectStats} />
      </div>
    )
  }

  const renderMaterialStats = () => {
    if (!materialStats) return null

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Statystyki Materiałów</h1>
            <p className="mt-1 text-neutral-600">{materialStats.project_name}</p>
          </div>
          <ExportButton reportType="MATERIAL_STATS" projectId={id} label="Eksportuj PDF" />
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm text-neutral-600">Materiały</p>
            <p className="mt-2 text-3xl font-bold text-neutral-900">
              {materialStats.materials_assigned}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm text-neutral-600">Ukończone</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {materialStats.materials_completed}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm text-neutral-600">W toku</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {materialStats.materials_in_progress}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm text-neutral-600">Completion Rate</p>
            <p className="mt-2 text-3xl font-bold text-neutral-900">
              {materialStats.completion_rate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Materials List */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">Materiały</h2>
          <div className="space-y-3">
            {materialStats.materials_list.map((material, index) => (
              <div key={index} className="rounded-lg border border-neutral-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-neutral-900">{material.title}</p>
                    <p className="mt-1 text-sm text-neutral-600">Kategoria: {material.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-neutral-900">
                      {material.completion_rate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-neutral-600">
                      {material.completed_count}/{material.assigned_count}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-primary-600 hover:text-primary-700"
      >
        <svg className="mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Powrót
      </button>

      {renderContent()}
    </div>
  )
}

export default ReportDetailPage
