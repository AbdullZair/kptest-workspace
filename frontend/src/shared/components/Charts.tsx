import { clsx } from 'clsx'

/**
 * BarChart Props
 */
export interface BarChartProps {
  data: { label: string; value: number; color?: string }[]
  height?: number
  showValues?: boolean
  showGrid?: boolean
  className?: string
  barColor?: string
  colorScale?: 'default' | 'gradient' | 'categorical'
}

/**
 * BarChart Component
 *
 * Simple SVG bar chart for displaying data distributions
 *
 * @example
 * ```tsx
 * <BarChart
 *   data={[
 *     { label: 'Mon', value: 40 },
 *     { label: 'Tue', value: 65 },
 *     { label: 'Wed', value: 85 }
 *   ]}
 *   height={200}
 *   showValues
 * />
 * ```
 */
export function BarChart({
  data,
  height = 200,
  showValues = true,
  showGrid = true,
  className,
  barColor = '#3b82f6',
  colorScale = 'default',
}: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const barWidth = 40
  const gap = 20
  const chartWidth = data.length * (barWidth + gap)

  const getColor = (index: number, value: number) => {
    if (colorScale === 'categorical') {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
      return colors[index % colors.length]
    }

    if (colorScale === 'gradient') {
      const intensity = value / maxValue
      if (intensity > 0.75) return '#10b981'
      if (intensity > 0.5) return '#3b82f6'
      if (intensity > 0.25) return '#f59e0b'
      return '#ef4444'
    }

    return barColor
  }

  return (
    <div className={clsx('w-full', className)} style={{ height }}>
      <svg viewBox={`0 0 ${chartWidth + gap} ${height}`} className="w-full h-full" preserveAspectRatio="none">
        {/* Grid lines */}
        {showGrid &&
          [0, 25, 50, 75, 100].map((y) => (
            <g key={y}>
              <line
                x1="0"
                y1={height - (y / 100) * height - 20}
                x2={chartWidth + gap}
                y2={height - (y / 100) * height - 20}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x="-5"
                y={height - (y / 100) * height - 16}
                textAnchor="end"
                className="text-xs fill-neutral-500"
              >
                {y}%
              </text>
            </g>
          ))}

        {/* Bars */}
        {data.map((d, i) => {
          const barHeight = (d.value / maxValue) * (height - 40)
          const x = i * (barWidth + gap) + gap / 2
          const y = height - barHeight - 20
          const color = d.color || getColor(i, d.value)

          return (
            <g key={d.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                rx="4"
                className="transition-all duration-300 hover:opacity-80"
              />
              {showValues && (
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  className="text-xs fill-neutral-700 font-medium"
                >
                  {d.value}
                </text>
              )}
              <text
                x={x + barWidth / 2}
                y={height - 5}
                textAnchor="middle"
                className="text-xs fill-neutral-600"
              >
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/**
 * LineChart Props
 */
export interface LineChartProps {
  data: { label: string; value: number }[]
  height?: number
  showPoints?: boolean
  showGrid?: boolean
  className?: string
  lineColor?: string
  fillColor?: string
  smooth?: boolean
}

/**
 * LineChart Component
 *
 * Simple SVG line chart for displaying trends over time
 *
 * @example
 * ```tsx
 * <LineChart
 *   data={[
 *     { label: 'Mon', value: 40 },
 *     { label: 'Tue', value: 65 },
 *     { label: 'Wed', value: 85 }
 *   ]}
 *   height={200}
 *   showPoints
 * />
 * ```
 */
export function LineChart({
  data,
  height = 200,
  showPoints = true,
  showGrid = true,
  className,
  lineColor = '#3b82f6',
  fillColor = 'rgba(59, 130, 246, 0.1)',
  smooth = true,
}: LineChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const minValue = Math.min(...data.map((d) => d.value), 0)
  const range = maxValue - minValue || 1
  const pointGap = 80
  const chartWidth = data.length * pointGap

  const getX = (index: number) => index * pointGap + pointGap / 2
  const getY = (value: number) => height - ((value - minValue) / range) * (height - 40) - 20

  // Generate path for line
  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`)
  const linePath = smooth
    ? `M ${points.join(' Q ')}`
    : `M ${points.join(' L ')}`

  // Generate area path
  const areaPath = `
    M ${getX(0)},${height - 20}
    L ${getX(0)},${getY(data[0].value)}
    ${data.map((d, i) => `L ${getX(i)},${getY(d.value)}`).join(' ')}
    L ${getX(data.length - 1)},${height - 20}
    Z
  `

  return (
    <div className={clsx('w-full', className)} style={{ height }}>
      <svg viewBox={`0 0 ${chartWidth + pointGap} ${height}`} className="w-full h-full" preserveAspectRatio="none">
        {/* Grid lines */}
        {showGrid &&
          [0, 25, 50, 75, 100].map((y) => (
            <g key={y}>
              <line
                x1="0"
                y1={height - (y / 100) * height - 20}
                x2={chartWidth + pointGap}
                y2={height - (y / 100) * height - 20}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x="-5"
                y={height - (y / 100) * height - 16}
                textAnchor="end"
                className="text-xs fill-neutral-500"
              >
                {y}%
              </text>
            </g>
          ))}

        {/* Area fill */}
        <path d={areaPath} fill={fillColor} />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={lineColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {showPoints &&
          data.map((d, i) => (
            <g key={d.label}>
              <circle cx={getX(i)} cy={getY(d.value)} r="4" fill={lineColor} className="hover:r-6 transition-all" />
              <text
                x={getX(i)}
                y={height - 5}
                textAnchor="middle"
                className="text-xs fill-neutral-600"
              >
                {d.label}
              </text>
            </g>
          ))}
      </svg>
    </div>
  )
}

/**
 * PieChart Props
 */
export interface PieChartProps {
  data: { label: string; value: number; color: string }[]
  size?: number
  showLabels?: boolean
  showLegend?: boolean
  className?: string
  innerRadius?: number
}

/**
 * PieChart Component
 *
 * Simple SVG pie/donut chart for displaying proportions
 *
 * @example
 * ```tsx
 * <PieChart
 *   data={[
 *     { label: 'High', value: 45, color: '#10b981' },
 *     { label: 'Medium', value: 35, color: '#f59e0b' },
 *     { label: 'Low', value: 20, color: '#ef4444' }
 *   ]}
 *   size={200}
 *   showLegend
 * />
 * ```
 */
export function PieChart({
  data,
  size = 200,
  showLabels = true,
  showLegend = true,
  className,
  innerRadius = 0,
}: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const center = size / 2
  const radius = size / 2 - 20

  let currentAngle = -Math.PI / 2

  const slices = data.map((d) => {
    const sliceAngle = (d.value / total) * 2 * Math.PI
    const startAngle = currentAngle
    const endAngle = currentAngle + sliceAngle

    const x1 = center + radius * Math.cos(startAngle)
    const y1 = center + radius * Math.sin(startAngle)
    const x2 = center + radius * Math.cos(endAngle)
    const y2 = center + radius * Math.sin(endAngle)

    // Inner circle for donut
    const x3 = innerRadius > 0 ? center + innerRadius * Math.cos(endAngle) : x2
    const y3 = innerRadius > 0 ? center + innerRadius * Math.sin(endAngle) : y2
    const x4 = innerRadius > 0 ? center + innerRadius * Math.cos(startAngle) : x1
    const y4 = innerRadius > 0 ? center + innerRadius * Math.sin(startAngle) : y1

    const largeArc = sliceAngle > Math.PI ? 1 : 0

    const pathData = innerRadius > 0
      ? `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`
      : `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`

    // Label position
    const labelAngle = startAngle + sliceAngle / 2
    const labelX = center + (radius * 0.7) * Math.cos(labelAngle)
    const labelY = center + (radius * 0.7) * Math.sin(labelAngle)

    currentAngle = endAngle

    return {
      path: pathData,
      label: d.label,
      value: d.value,
      color: d.color,
      percentage: ((d.value / total) * 100).toFixed(1),
      labelX,
      labelY,
    }
  })

  return (
    <div className={clsx('flex items-center gap-4', className)}>
      <svg width={size} height={size} className="shrink-0">
        {slices.map((slice, i) => (
          <g key={i}>
            <path d={slice.path} fill={slice.color} className="transition-opacity hover:opacity-80" />
            {showLabels && slice.percentage !== '0.0' && (
              <text
                x={slice.labelX}
                y={slice.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-white font-medium"
              >
                {slice.percentage}%
              </text>
            )}
          </g>
        ))}
      </svg>

      {showLegend && (
        <div className="space-y-2">
          {slices.map((slice, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: slice.color }} />
              <span className="text-sm text-neutral-700">{slice.label}</span>
              <span className="text-sm font-medium text-neutral-900">{slice.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default { BarChart, LineChart, PieChart }
