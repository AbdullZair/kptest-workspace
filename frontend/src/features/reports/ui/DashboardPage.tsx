import { useGetDashboardKpisQuery } from '../api'
import { DashboardKpiCard, ComplianceChart, ExportButton } from '../components'
import type { DashboardComplianceTrendEntry } from '../types'

/**
 * DashboardPage Component
 *
 * Displays dashboard with KPIs and charts
 */
export const DashboardPage = () => {
  const { data: kpis, isLoading, error } = useGetDashboardKpisQuery()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        Wystąpił błąd podczas ładowania danych dashboardu
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-600 mt-1">Przegląd kluczowych wskaźników wydajności</p>
        </div>
        <ExportButton
          reportType="COMPLIANCE"
          label="Eksportuj dashboard"
          includeCharts={true}
        />
      </div>

      {/* KPI Cards */}
      <DashboardKpiCard kpi={kpis} />

      {/* Compliance Trend Chart */}
      {kpis?.compliance_trend && kpis.compliance_trend.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">
              Trend Compliance (30 dni)
            </h2>
          </div>
          <ComplianceChart
            data={kpis.compliance_trend as unknown as ComplianceTrendEntry[]}
            overallCompliance={kpis.average_compliance}
            threshold={80}
            height={250}
          />
        </div>
      )}

      {/* Project Status Summary */}
      {kpis?.project_status_summary && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Podsumowanie statusu projektów
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(kpis.project_status_summary).map(([status, count]) => (
              <div
                key={status}
                className="bg-neutral-50 rounded-lg p-4 text-center"
              >
                <p className="text-2xl font-bold text-neutral-900">{count}</p>
                <p className="text-sm text-neutral-600 mt-1">{status}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patient Stage Summary */}
      {kpis?.patient_stage_summary && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Podsumowanie etapów pacjentów
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(kpis.patient_stage_summary).map(([stage, count]) => (
              <div
                key={stage}
                className="bg-neutral-50 rounded-lg p-4 text-center"
              >
                <p className="text-2xl font-bold text-neutral-900">{count}</p>
                <p className="text-sm text-neutral-600 mt-1">{stage}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
