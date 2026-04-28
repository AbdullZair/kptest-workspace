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
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
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
          <p className="mt-1 text-neutral-600">Przegląd kluczowych wskaźników wydajności</p>
        </div>
        <ExportButton reportType="COMPLIANCE" label="Eksportuj dashboard" includeCharts={true} />
      </div>

      {/* KPI Cards */}
      <DashboardKpiCard kpi={kpis} />

      {/* Compliance Trend Chart */}
      {kpis?.compliance_trend && kpis.compliance_trend.length > 0 ? (
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Trend Compliance (30 dni)</h2>
          </div>
          <ComplianceChart
            data={kpis.compliance_trend}
            overallCompliance={kpis.average_compliance}
            threshold={80}
            height={250}
          />
        </div>
      ) : null}

      {/* Project Status Summary */}
      {kpis?.project_status_summary ? (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            Podsumowanie statusu projektów
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {Object.entries(kpis.project_status_summary).map(([status, count]) => (
              <div key={status} className="rounded-lg bg-neutral-50 p-4 text-center">
                <p className="text-2xl font-bold text-neutral-900">{count}</p>
                <p className="mt-1 text-sm text-neutral-600">{status}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Patient Stage Summary */}
      {kpis?.patient_stage_summary ? (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            Podsumowanie etapów pacjentów
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {Object.entries(kpis.patient_stage_summary).map(([stage, count]) => (
              <div key={stage} className="rounded-lg bg-neutral-50 p-4 text-center">
                <p className="text-2xl font-bold text-neutral-900">{count}</p>
                <p className="mt-1 text-sm text-neutral-600">{stage}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default DashboardPage
