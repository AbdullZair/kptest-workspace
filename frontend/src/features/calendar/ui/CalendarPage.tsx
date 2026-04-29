import React, { useState, useMemo } from 'react'
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
} from 'date-fns'
import { pl } from 'date-fns/locale'
import { useGetCalendarEventsQuery, useCompleteEventMutation } from '../api/calendarApi'
import { EventCard, EventStatusBadge } from '../components'
import { EventFormModal } from './EventFormModal'
import type { TherapyEvent, EventType, EventStatus } from '@entities/event'

type CalendarView = 'day' | 'week' | 'month'

/**
 * Calendar page with day/week/month views.
 */
export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>('month')
  const [selectedEvent, setSelectedEvent] = useState<TherapyEvent | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedEventType, setSelectedEventType] = useState<EventType | undefined>()
  const [selectedEventStatus, setSelectedEventStatus] = useState<EventStatus | undefined>()

  // Get current user's patient ID from context (placeholder)
  const patientId = 'placeholder-patient-id' // TODO: Get from auth context

  const {
    data: events = [],
    isLoading,
    refetch,
  } = useGetCalendarEventsQuery({
    patientId,
    type: selectedEventType,
    status: selectedEventStatus,
  })

  const [completeEvent] = useCompleteEventMutation()

  // Calculate date range based on view
  const dateRange = useMemo(() => {
    switch (view) {
      case 'day':
        return { start: currentDate, end: currentDate }
      case 'week':
        return {
          start: startOfWeek(currentDate, { locale: pl }),
          end: endOfWeek(currentDate, { locale: pl }),
        }
      case 'month':
        return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) }
    }
  }, [currentDate, view])

  // Generate days for calendar grid
  const days = useMemo(() => {
    return eachDayOfInterval({ start: dateRange.start, end: dateRange.end })
  }, [dateRange])

  // Filter events for current view
  const eventsForView = useMemo(() => {
    return events.filter((event) => {
      const eventDate = new Date(event.scheduled_at)
      return eventDate >= dateRange.start && eventDate <= dateRange.end
    })
  }, [events, dateRange])

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return eventsForView.filter((event) => isSameDay(new Date(event.scheduled_at), day))
  }

  // Navigation handlers
  const goToPrevious = () => {
    switch (view) {
      case 'day':
        setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)))
        break
      case 'week':
        setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))
        break
      case 'month':
        setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))
        break
    }
  }

  const goToNext = () => {
    switch (view) {
      case 'day':
        setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)))
        break
      case 'week':
        setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))
        break
      case 'month':
        setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))
        break
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Handle event completion
  const handleCompleteEvent = async (event: TherapyEvent) => {
    try {
      await completeEvent({ id: event.id, request: {} }).unwrap()
      refetch()
    } catch (error) {
      console.error('Failed to complete event:', error)
    }
  }

  // Handle event export to iCal
  const handleExportEvent = async (event: TherapyEvent) => {
    try {
      const response = await fetch(`/api/v1/calendar/events/${event.id}/ics`, {
        method: 'POST',
      })
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `event-${event.id}.ics`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export event:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Kalendarz wydarzeń</h1>
          <button
            onClick={() => setIsFormOpen(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + Dodaj wydarzenie
          </button>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-4">
          <select
            value={selectedEventType || ''}
            onChange={(e) => setSelectedEventType((e.target.value as EventType) || undefined)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Wszystkie typy</option>
            <option value="VISIT">Wizyty</option>
            <option value="SESSION">Sesje</option>
            <option value="MEDICATION">Leki</option>
            <option value="EXERCISE">Ćwiczenia</option>
            <option value="MEASUREMENT">Pomiary</option>
            <option value="OTHER">Inne</option>
          </select>

          <select
            value={selectedEventStatus || ''}
            onChange={(e) => setSelectedEventStatus((e.target.value as EventStatus) || undefined)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Wszystkie statusy</option>
            <option value="SCHEDULED">Zaplanowane</option>
            <option value="COMPLETED">Wykonane</option>
            <option value="MISSED">Przeterminowane</option>
            <option value="CANCELLED">Anulowane</option>
          </select>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={goToToday}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Dzisiaj
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={goToPrevious}
                className="rounded p-1.5 text-gray-600 hover:bg-gray-100"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button onClick={goToNext} className="rounded p-1.5 text-gray-600 hover:bg-gray-100">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
            <h2 className="min-w-[200px] text-lg font-semibold text-gray-900">
              {view === 'day' && format(currentDate, 'dd MMMM yyyy', { locale: pl })}
              {view === 'week' && (
                <>
                  {format(dateRange.start, 'dd MMM')} -{' '}
                  {format(dateRange.end, 'dd MMMM yyyy', { locale: pl })}
                </>
              )}
              {view === 'month' && format(currentDate, 'MMMM yyyy', { locale: pl })}
            </h2>
          </div>

          {/* View Switcher */}
          <div className="flex items-center gap-1 rounded-md bg-gray-100 p-1">
            <button
              onClick={() => setView('day')}
              className={`rounded px-3 py-1.5 text-sm font-medium ${
                view === 'day'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dzień
            </button>
            <button
              onClick={() => setView('week')}
              className={`rounded px-3 py-1.5 text-sm font-medium ${
                view === 'week'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tydzień
            </button>
            <button
              onClick={() => setView('month')}
              className={`rounded px-3 py-1.5 text-sm font-medium ${
                view === 'month'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Miesiąc
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="h-8 w-8 animate-spin text-blue-600" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        ) : view === 'month' ? (
          <MonthView
            days={days}
            currentDate={currentDate}
            getEventsForDay={getEventsForDay}
            onEventClick={setSelectedEvent}
          />
        ) : view === 'week' ? (
          <WeekView days={days} getEventsForDay={getEventsForDay} onEventClick={setSelectedEvent} />
        ) : (
          <DayView
            day={currentDate}
            events={getEventsForDay(currentDate)}
            onEventClick={setSelectedEvent}
            onEventComplete={handleCompleteEvent}
            onEventExport={handleExportEvent}
          />
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent ? (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={() => {
            setIsFormOpen(true)
          }}
          onComplete={handleCompleteEvent}
          onExport={handleExportEvent}
        />
      ) : null}

      {/* Event Form Modal */}
      <EventFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={(data) => {
          // TODO: Call create/update event mutation
          console.log('Event data:', data)
          setIsFormOpen(false)
          refetch()
        }}
        event={selectedEvent}
        isLoading={false}
      />
    </div>
  )
}

// Month View Component
const MonthView: React.FC<{
  days: Date[]
  currentDate: Date
  getEventsForDay: (day: Date) => TherapyEvent[]
  onEventClick: (event: TherapyEvent) => void
}> = ({ days, currentDate, getEventsForDay, onEventClick }) => {
  const weeks: Date[][] = []
  let weekDays: Date[] = []

  // Pad with empty cells at start
  const startDayOfWeek = days[0]?.getDay() ?? 0
  for (let i = 0; i < startDayOfWeek; i++) {
    weekDays.push(null as unknown as Date)
  }

  days.forEach((day, index) => {
    weekDays.push(day)
    if (weekDays.length === 7 || index === days.length - 1) {
      weeks.push(weekDays)
      weekDays = []
    }
  })

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="grid grid-cols-7 border-b bg-gray-50">
        {['Ndz', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'].map((day) => (
          <div key={day} className="py-2 text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {weeks.map((week, weekIndex) =>
          week.map((day, dayIndex) => {
            const isCurrentMonth = day?.getMonth() === currentDate.getMonth()
            const events = day ? getEventsForDay(day) : []

            return (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`min-h-[100px] border-b border-r p-2 ${
                  !isCurrentMonth ? 'bg-gray-50' : ''
                } ${isToday(day) ? 'bg-blue-50' : ''}`}
              >
                {day ? (
                  <>
                    <div
                      className={`mb-1 text-sm font-medium ${
                        isToday(day)
                          ? 'text-blue-600'
                          : isCurrentMonth
                            ? 'text-gray-900'
                            : 'text-gray-400'
                      }`}
                    >
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {events.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          onClick={() => onEventClick(event)}
                          className="cursor-pointer truncate rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 hover:bg-blue-200"
                        >
                          {event.title}
                        </div>
                      ))}
                      {events.length > 3 && (
                        <div className="text-xs text-gray-500">+{events.length - 3} więcej</div>
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// Week View Component
const WeekView: React.FC<{
  days: Date[]
  getEventsForDay: (day: Date) => TherapyEvent[]
  onEventClick: (event: TherapyEvent) => void
}> = ({ days, getEventsForDay, onEventClick }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="grid grid-cols-8 border-b bg-gray-50">
        <div className="border-r py-2 text-center text-sm font-medium text-gray-600">Godz</div>
        {days.map((day, index) => (
          <div
            key={index}
            className={`border-r py-2 text-center text-sm font-medium ${isToday(day) ? 'bg-blue-50' : ''}`}
          >
            <div>{format(day, 'EEE', { locale: pl })}</div>
            <div className={`text-lg ${isToday(day) ? 'text-blue-600' : 'text-gray-900'}`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b">
            <div className="border-r py-2 text-center text-xs text-gray-500">
              {hour.toString().padStart(2, '0')}:00
            </div>
            {days.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(day).filter(
                (event) => new Date(event.scheduled_at).getHours() === hour
              )

              return (
                <div key={dayIndex} className="min-h-[40px] border-r p-1">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className="mb-1 cursor-pointer rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 hover:bg-blue-200"
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// Day View Component
const DayView: React.FC<{
  day: Date
  events: TherapyEvent[]
  onEventClick: (event: TherapyEvent) => void
  onEventComplete: (event: TherapyEvent) => void
  onEventExport: (event: TherapyEvent) => void
}> = ({ day, events, onEventClick, onEventComplete: _onEventComplete, onEventExport: _onEventExport }) => {
  return (
    <div className="rounded-lg bg-white shadow">
      <div className="border-b p-4">
        <h3 className="text-lg font-semibold">
          {format(day, 'EEEE, dd MMMM yyyy', { locale: pl })}
        </h3>
        <p className="text-sm text-gray-500">{events.length} wydarzeń</p>
      </div>
      <div className="space-y-3 p-4">
        {events.length === 0 ? (
          <p className="py-8 text-center text-gray-500">Brak wydarzeń w tym dniu</p>
        ) : (
          events.map((event) => <EventCard key={event.id} event={event} onClick={onEventClick} />)
        )}
      </div>
    </div>
  )
}

// Event Detail Modal
const EventDetailModal: React.FC<{
  event: TherapyEvent
  onClose: () => void
  onEdit: () => void
  onComplete: (event: TherapyEvent) => void
  onExport: (event: TherapyEvent) => void
}> = ({ event, onClose, onEdit, onComplete, onExport }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Szczegóły wydarzenia</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-xl font-bold text-gray-900">{event.title}</h4>
                <p className="text-sm text-gray-600">{event.type}</p>
              </div>
              <EventStatusBadge status={event.status} />
            </div>

            {event.description ? <p className="text-gray-700">{event.description}</p> : null}

            <div className="space-y-2 text-sm text-gray-600">
              <div>
                <strong>Data:</strong>{' '}
                {format(new Date(event.scheduled_at), 'dd MMMM yyyy, HH:mm', { locale: pl })}
              </div>
              {event.ends_at ? (
                <div>
                  <strong>Koniec:</strong> {format(new Date(event.ends_at), 'HH:mm')}
                </div>
              ) : null}
              {event.location ? (
                <div>
                  <strong>Lokalizacja:</strong> {event.location}
                </div>
              ) : null}
            </div>

            {event.patient_notes ? (
              <div className="rounded bg-green-50 p-3">
                <strong className="text-green-800">Notatka pacjenta:</strong>
                <p className="mt-1 text-green-700">{event.patient_notes}</p>
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t pt-4">
            {event.status === 'SCHEDULED' && (
              <button
                onClick={() => onComplete(event)}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Oznacz jako wykonane
              </button>
            )}
            <button
              onClick={() => onExport(event)}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Eksportuj do iCal
            </button>
            <button
              onClick={onEdit}
              className="rounded-md bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
            >
              Edytuj
            </button>
            <button
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Zamknij
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarPage
