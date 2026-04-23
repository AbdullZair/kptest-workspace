import React from 'react'
import { EVENT_STATUS_COLORS, EVENT_STATUS_LABELS, type EventStatus } from '@entities/event'

interface EventStatusBadgeProps {
  status: EventStatus
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Badge component displaying event status with color coding.
 */
export const EventStatusBadge: React.FC<EventStatusBadgeProps> = ({ status, size = 'md' }) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
  }

  const sizeMap: Record<string, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  }

  const color = EVENT_STATUS_COLORS[status]
  const className = `${colorMap[color] || colorMap.gray} ${sizeMap[size]} rounded-full font-medium inline-flex items-center`

  return <span className={className}>{EVENT_STATUS_LABELS[status]}</span>
}

export default EventStatusBadge
