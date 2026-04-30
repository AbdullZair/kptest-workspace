import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { format } from 'date-fns'
import type {
  TherapyEvent,
  CreateTherapyEventRequest,
  UpdateTherapyEventRequest,
  EventType,
  Reminders,
} from '@entities/event'
import { ReminderConfig } from '../components'

interface EventFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateTherapyEventRequest | UpdateTherapyEventRequest) => void
  event?: TherapyEvent | null
  projectId?: string
  isLoading?: boolean
}

type FormData = {
  title: string
  description: string
  type: EventType
  scheduled_at: string
  scheduled_time: string
  ends_at: string
  ends_time: string
  location: string
  is_cyclic: boolean
  recurrence_rule: string
  reminders: Reminders
}

/**
 * Modal form for creating and editing therapy events.
 */
export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  event,
  projectId,
  isLoading = false,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      type: 'VISIT',
      scheduled_at: format(new Date(), 'yyyy-MM-dd'),
      scheduled_time: format(new Date(), 'HH:mm'),
      ends_at: '',
      ends_time: '',
      location: '',
      is_cyclic: false,
      recurrence_rule: '',
      reminders: {
        reminder_24h: true,
        reminder_2h: false,
        reminder_30min: false,
      },
    },
  })

  // Populate form when editing an event
  useEffect(() => {
    if (event && isOpen) {
      const scheduledDate = new Date(event.scheduled_at)
      const endsDate = event.ends_at ? new Date(event.ends_at) : null

      reset({
        title: event.title,
        description: event.description || '',
        type: event.type,
        scheduled_at: format(scheduledDate, 'yyyy-MM-dd'),
        scheduled_time: format(scheduledDate, 'HH:mm'),
        ends_at: endsDate ? format(endsDate, 'yyyy-MM-dd') : '',
        ends_time: endsDate ? format(endsDate, 'HH:mm') : '',
        location: event.location || '',
        is_cyclic: event.is_cyclic,
        recurrence_rule: event.recurrence_rule || '',
        reminders: event.reminders || {
          reminder_24h: false,
          reminder_2h: false,
          reminder_30min: false,
        },
      })
      setShowAdvanced(event.is_cyclic || !!event.recurrence_rule)
    } else if (isOpen) {
      // Reset for new event
      reset({
        title: '',
        description: '',
        type: 'VISIT',
        scheduled_at: format(new Date(), 'yyyy-MM-dd'),
        scheduled_time: format(new Date(), 'HH:mm'),
        ends_at: '',
        ends_time: '',
        location: '',
        is_cyclic: false,
        recurrence_rule: '',
        reminders: {
          reminder_24h: true,
          reminder_2h: false,
          reminder_30min: false,
        },
      })
      setShowAdvanced(false)
    }
  }, [event, isOpen, reset])

  const isEditing = !!event

  const handleFormSubmit = (data: FormData) => {
    // Combine date and time
    const scheduledAt = new Date(`${data.scheduled_at}T${data.scheduled_time}:00`).toISOString()
    const endsAt =
      data.ends_at && data.ends_time
        ? new Date(`${data.ends_at}T${data.ends_time}:00`).toISOString()
        : null

    const baseData = {
      title: data.title,
      description: data.description || null,
      type: data.type,
      scheduled_at: scheduledAt,
      ends_at: endsAt,
      location: data.location || null,
      is_cyclic: data.is_cyclic,
      recurrence_rule: data.is_cyclic ? data.recurrence_rule || 'FREQ=WEEKLY' : null,
      reminders: data.reminders,
    }

    if (isEditing && event) {
      onSubmit({
        ...baseData,
        patient_id: event.patient_id,
      })
    } else {
      onSubmit({
        ...baseData,
        project_id: projectId || '',
      })
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pb-20 pt-4 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="my-8 inline-block w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Edytuj wydarzenie' : 'Nowe wydarzenie'}
            </h3>
            <button
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
              onClick={onClose}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>
          </div>

          <form
            className="space-y-4"
            data-testid="event-form"
            onSubmit={handleSubmit(handleFormSubmit)}
          >
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Tytuł *</label>
              <input
                type="text"
                {...register('title', { required: 'Tytuł jest wymagany' })}
                className={`mt-1 block w-full rounded-md border ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                data-testid="event-title"
                disabled={isLoading}
              />
              {errors.title ? (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              ) : null}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Typ wydarzenia *</label>
              <select
                {...register('type', { required: true })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                data-testid="event-type-select"
                disabled={isLoading}
              >
                <option value="VISIT">Wizyta kontrolna</option>
                <option value="SESSION">Sesja terapeutyczna</option>
                <option value="MEDICATION">Przypomnienie o lekach</option>
                <option value="EXERCISE">Ćwiczenie</option>
                <option value="MEASUREMENT">Pomiar parametrów</option>
                <option value="OTHER">Inne</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Opis</label>
              <textarea
                {...register('description')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                data-testid="event-description"
                disabled={isLoading}
                rows={3}
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Data rozpoczęcia *
                </label>
                <input
                  type="date"
                  {...register('scheduled_at', { required: 'Data jest wymagana' })}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.scheduled_at ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  data-testid="event-scheduled-at"
                  disabled={isLoading}
                />
                {errors.scheduled_at ? (
                  <p className="mt-1 text-sm text-red-600">{errors.scheduled_at.message}</p>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Godzina rozpoczęcia *
                </label>
                <input
                  type="time"
                  {...register('scheduled_time', { required: 'Godzina jest wymagana' })}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.scheduled_time ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  data-testid="event-scheduled-time"
                  disabled={isLoading}
                />
                {errors.scheduled_time ? (
                  <p className="mt-1 text-sm text-red-600">{errors.scheduled_time.message}</p>
                ) : null}
              </div>
            </div>

            {/* End Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Data zakończenia</label>
                <input
                  type="date"
                  {...register('ends_at')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  data-testid="event-ends-at"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Godzina zakończenia
                </label>
                <input
                  type="time"
                  {...register('ends_time')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Lokalizacja</label>
              <input
                type="text"
                {...register('location')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                data-testid="event-location"
                disabled={isLoading}
                placeholder="np. Gabinet 123, Telewizyta"
              />
            </div>

            {/* Reminders */}
            <Controller
              control={control}
              name="reminders"
              render={({ field }) => (
                <ReminderConfig
                  disabled={isLoading}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            {/* Advanced Options Toggle */}
            <div>
              <button
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                disabled={isLoading}
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? 'Ukryj opcje zaawansowane' : 'Pokaż opcje zaawansowane'}
              </button>
            </div>

            {/* Advanced Options */}
            {showAdvanced ? (
              <>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register('is_cyclic')}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <span className="text-sm font-medium text-gray-700">Wydarzenie cykliczne</span>
                  </label>
                </div>

                {watch('is_cyclic') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Reguła powtarzania (RRULE)
                    </label>
                    <input
                      type="text"
                      {...register('recurrence_rule')}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={isLoading}
                      placeholder="np. FREQ=WEEKLY;INTERVAL=1;BYDAY=MO"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Format iCalendar RRULE (np. FREQ=WEEKLY;INTERVAL=1 dla cotygodniowego)
                    </p>
                  </div>
                )}
              </>
            ) : null}

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                data-testid="event-cancel"
                disabled={isLoading}
                type="button"
                onClick={onClose}
              >
                Anuluj
              </button>
              <button
                className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="event-save"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        fill="none"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        fill="currentColor"
                      />
                    </svg>
                    Zapisywanie...
                  </span>
                ) : isEditing ? (
                  'Zapisz zmiany'
                ) : (
                  'Utwórz wydarzenie'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EventFormModal
