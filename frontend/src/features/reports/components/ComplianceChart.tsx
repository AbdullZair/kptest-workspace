import { memo } from 'react'
import type { ComplianceTrendEntry } from '../types'

export interface ComplianceChartProps {
  /**
   * Compliance trend data
   */
  data?: ComplianceTrendEntry[]
  /**
   * Overall compliance score
   */
  overallCompliance?: number
  /**
   * Compliance threshold
   */
  threshold?: number
  /**
   * Chart height in pixels
   */
  height?: number
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * ComplianceChart Component
 *
 * Displays compliance trend as a simple line chart using SVG
 *
 * @example
 * ```tsx
 * <ComplianceChart
 *   data={complianceTrend}
 *   overallCompliance={75.5}
 *   threshold={80}
 * />
 * ```
 */
export const ComplianceChart = memo(
  ({
    data = [],
    overallCompliance,
    threshold = 80,
    height = 200,
    className,
  }: ComplianceChartProps) => {
    if (!data || data.length === 0) {
      return (
        <div className={`py-8 text-center text-neutral-500 ${className}`}>
          Brak danych do wyświetlenia
        </div>
      )
    }

    const chartHeight = height

    // Get min and max values for scaling
    const values = data.map((d) => d.compliance_score)
    const maxValue = Math.max(...values, 100)
    const minValue = Math.min(...values, 0)
    const valueRange = maxValue - minValue || 1

    // Generate points for the line
    const points = data
      .map((d, index) => {
        const x = (index / (data.length - 1)) * 100
        const y = 100 - ((d.compliance_score - minValue) / valueRange) * 100
        return `${x},${y}`
      })
      .join(' ')

    // Generate threshold line position
    const thresholdY = 100 - ((threshold - minValue) / valueRange) * 100

    // Determine color based on compliance
    const isCompliant = (overallCompliance ?? 0) >= threshold
    const lineColor = isCompliant ? '#10b981' : '#ef4444'
    const fillColor = isCompliant ? 'rgba(16, 184, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'

    return (
      <div className={`relative ${className}`} style={{ height: `${chartHeight}px` }}>
        <svg
          viewBox={`0 0 100 ${chartHeight}`}
          className="h-full w-full"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Threshold line */}
          <line
            x1="0"
            y1={thresholdY}
            x2="100"
            y2={thresholdY}
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="4,4"
            vectorEffect="non-scaling-stroke"
          />

          {/* Area fill */}
          <polygon points={`0,${chartHeight} ${points} 100,${chartHeight}`} fill={fillColor} />

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke={lineColor}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />

          {/* Data points */}
          {data.map((d, index) => {
            const x = (index / (data.length - 1)) * 100
            const y = 100 - ((d.compliance_score - minValue) / valueRange) * 100
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={lineColor}
                stroke="#fff"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            )
          })}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute bottom-0 left-0 top-0 flex flex-col justify-between py-8 text-xs text-neutral-500">
          <span>{Math.round(maxValue)}%</span>
          <span>{Math.round((maxValue + minValue) / 2)}%</span>
          <span>{Math.round(minValue)}%</span>
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-8 pb-2 text-xs text-neutral-500">
          <span>{data[0]?.date}</span>
          <span>{data[data.length - 1]?.date}</span>
        </div>

        {/* Legend */}
        <div className="absolute right-0 top-0 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-0.5 w-3 bg-amber-500" style={{ borderTop: '2px dashed #f59e0b' }} />
            <span className="text-neutral-600">Threshold ({threshold}%)</span>
          </div>
          {overallCompliance !== undefined && (
            <div className={`font-semibold ${isCompliant ? 'text-emerald-600' : 'text-red-600'}`}>
              Średnia: {overallCompliance.toFixed(1)}%
            </div>
          )}
        </div>
      </div>
    )
  }
)

export default ComplianceChart
