import React from 'react'
import type { Reminders } from '@entities/event'

interface ReminderConfigProps {
  value?: Reminders
  onChange: (reminders: Reminders) => void
  disabled?: boolean
}

/**
 * Component for configuring event reminders.
 */
export const ReminderConfig: React.FC<ReminderConfigProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const reminders: Reminders = value || {
    reminder_24h: false,
    reminder_2h: false,
    reminder_30min: false,
  }

  const handleChange = (key: keyof Reminders, checked: boolean) => {
    onChange({
      ...reminders,
      [key]: checked,
    })
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Powiadomienia i przypomnienia
      </label>

      <div className="space-y-2">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            checked={reminders.reminder_24h}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={disabled}
            type="checkbox"
            onChange={(e) => handleChange('reminder_24h', e.target.checked)}
          />
          <span className="text-sm text-gray-700">
            <span className="font-medium">24 godziny przed</span>
            <span className="ml-1 text-gray-500">- Przypomnienie na dzień przed wydarzeniem</span>
          </span>
        </label>

        <label className="flex cursor-pointer items-center gap-3">
          <input
            checked={reminders.reminder_2h}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={disabled}
            type="checkbox"
            onChange={(e) => handleChange('reminder_2h', e.target.checked)}
          />
          <span className="text-sm text-gray-700">
            <span className="font-medium">2 godziny przed</span>
            <span className="ml-1 text-gray-500">
              - Przypomnienie na 2 godziny przed wydarzeniem
            </span>
          </span>
        </label>

        <label className="flex cursor-pointer items-center gap-3">
          <input
            checked={reminders.reminder_30min}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={disabled}
            type="checkbox"
            onChange={(e) => handleChange('reminder_30min', e.target.checked)}
          />
          <span className="text-sm text-gray-700">
            <span className="font-medium">30 minut przed</span>
            <span className="ml-1 text-gray-500">
              - Przypomnienie na pół godziny przed wydarzeniem
            </span>
          </span>
        </label>
      </div>

      {!reminders.reminder_24h && !reminders.reminder_2h && !reminders.reminder_30min && (
        <p className="text-xs italic text-gray-500">
          Nie wybrano żadnych przypomnień. Włącz co najmniej jedno przypomnienie, aby otrzymywać
          powiadomienia.
        </p>
      )}
    </div>
  )
}

export default ReminderConfig
