import { memo, type ChangeEvent } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * QuietHoursPicker props
 */
export interface QuietHoursPickerProps {
  /** Start time value (HH:MM format) */
  startTime?: string
  /** End time value (HH:MM format) */
  endTime?: string
  /** Disabled state */
  disabled?: boolean
  /** Loading state */
  loading?: boolean
  /** onChange handler */
  onChange: (start: string, end: string) => void
  /** Custom className */
  className?: string
  /** Show labels */
  showLabels?: boolean
}

/**
 * QuietHoursPicker Component
 *
 * Time picker for setting notification quiet hours
 *
 * @example
 * ```tsx
 * <QuietHoursPicker
 *   startTime="22:00"
 *   endTime="07:00"
 *   onChange={(start, end) => updatePreferences({ quiet_hours_start: start, quiet_hours_end: end })}
 * />
 * ```
 */
export const QuietHoursPicker = memo(
  ({
    startTime = '22:00',
    endTime = '07:00',
    disabled = false,
    loading = false,
    onChange,
    className,
    showLabels = true,
  }: QuietHoursPickerProps) => {
    const handleStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value, endTime)
    }

    const handleEndTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
      onChange(startTime, e.target.value)
    }

    const baseStyles = clsx(
      'flex flex-col gap-4 p-4 rounded-lg border',
      'bg-white border-gray-200',
      (disabled || loading) && 'opacity-50 pointer-events-none',
      className
    )

    return (
      <div className={twMerge(baseStyles)}>
        {showLabels ? (
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Godziny ciszy</h4>
            <p className="mt-1 text-xs text-gray-500">W tym czasie powiadomienia będą wyciszone</p>
          </div>
        ) : null}

        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Start Time */}
          <div className="flex-1">
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="quiet-hours-start"
            >
              Od godziny
            </label>
            <div className="relative">
              <input
                aria-describedby="quiet-hours-start-description"
                className={clsx(
                  'block w-full rounded-md border-gray-300',
                  'shadow-sm focus:border-primary-500 focus:ring-primary-500',
                  'px-3 py-2 text-sm',
                  'disabled:cursor-not-allowed disabled:bg-gray-100',
                  'border'
                )}
                disabled={disabled || loading}
                id="quiet-hours-start"
                type="time"
                value={startTime}
                onChange={handleStartTimeChange}
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* End Time */}
          <div className="flex-1">
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="quiet-hours-end"
            >
              Do godziny
            </label>
            <div className="relative">
              <input
                aria-describedby="quiet-hours-end-description"
                className={clsx(
                  'block w-full rounded-md border-gray-300',
                  'shadow-sm focus:border-primary-500 focus:ring-primary-500',
                  'px-3 py-2 text-sm',
                  'disabled:cursor-not-allowed disabled:bg-gray-100',
                  'border'
                )}
                disabled={disabled || loading}
                id="quiet-hours-end"
                type="time"
                value={endTime}
                onChange={handleEndTimeChange}
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3">
          <svg
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          <p className="text-xs text-blue-700">
            Godziny ciszy pozwalają wyciszyć powiadomienia w określonych godzinach. Powiadomienia
            będą nadal gromadzone, ale nie otrzymasz powiadomień push, email ani SMS.
          </p>
        </div>
      </div>
    )
  }
)

export default QuietHoursPicker
