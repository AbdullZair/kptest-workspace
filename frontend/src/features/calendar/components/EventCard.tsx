import React from 'react'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import {
  type TherapyEvent,
  EVENT_TYPE_LABELS,
  EVENT_TYPE_COLORS,
  EVENT_STATUS_LABELS,
} from '@entities/event'
import { EventStatusBadge } from './EventStatus'

interface EventCardProps {
  event: TherapyEvent
  onClick?: (event: TherapyEvent) => void
  compact?: boolean
}

/**
 * Card component displaying therapy event information.
 */
export const EventCard: React.FC<EventCardProps> = ({ event, onClick, compact = false }) => {
  const colorMap: Record<string, string> = {
    blue: 'border-blue-500 bg-blue-50',
    green: 'border-green-500 bg-green-50',
    red: 'border-red-500 bg-red-50',
    gray: 'border-gray-500 bg-gray-50',
    yellow: 'border-yellow-500 bg-yellow-50',
    purple: 'border-purple-500 bg-purple-50',
  }

  const eventTypeColor = EVENT_TYPE_COLORS[event.type]
  const borderClass = colorMap[eventTypeColor] || colorMap.gray

  const handleClick = () => {
    if (onClick) {
      onClick(event)
    }
  }

  if (compact) {
    return (
      <div
        onClick={handleClick}
        className={`${borderClass} cursor-pointer rounded border-l-4 p-2 transition-shadow hover:shadow-md`}
      >
        <div className="truncate text-sm font-medium">{event.title}</div>
        <div className="text-xs text-gray-600">{format(new Date(event.scheduled_at), 'HH:mm')}</div>
      </div>
    )
  }

  return (
    <div
      onClick={handleClick}
      className={`${borderClass} cursor-pointer rounded border-l-4 bg-white p-4 transition-shadow hover:shadow-md`}
    >
      <div className="mb-2 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{event.title}</h3>
          <p className="text-sm text-gray-600">{EVENT_TYPE_LABELS[event.type]}</p>
        </div>
        <EventStatusBadge status={event.status} size="sm" />
      </div>

      <div className="space-y-1 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{format(new Date(event.scheduled_at), 'dd MMMM yyyy, HH:mm', { locale: pl })}</span>
        </div>

        {event.ends_at ? (
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Do: {format(new Date(event.ends_at), 'HH:mm')}</span>
          </div>
        ) : null}

        {event.location ? (
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{event.location}</span>
          </div>
        ) : null}
      </div>

      {event.description ? (
        <p className="mt-2 line-clamp-2 text-sm text-gray-700">{event.description}</p>
      ) : null}

      {event.status === 'COMPLETED' && event.patient_notes ? (
        <div className="mt-2 rounded bg-green-50 p-2 text-sm text-gray-700">
          <strong>Notatka:</strong> {event.patient_notes}
        </div>
      ) : null}
    </div>
  )
}

export default EventCard
