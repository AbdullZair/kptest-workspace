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
      <label className="block text-sm font-medium text-gray-700">Powiadomienia i przypomnienia</label>

      <div className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={reminders.reminder_24h}
            onChange={(e) => handleChange('reminder_24h', e.target.checked)}
            disabled={disabled}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            <span className="font-medium">24 godziny przed</span>
            <span className="text-gray-500 ml-1">- Przypomnienie na dzień przed wydarzeniem</span>
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={reminders.reminder_2h}
            onChange={(e) => handleChange('reminder_2h', e.target.checked)}
            disabled={disabled}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            <span className="font-medium">2 godziny przed</span>
            <span className="text-gray-500 ml-1">- Przypomnienie na 2 godziny przed wydarzeniem</span>
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={reminders.reminder_30min}
            onChange={(e) => handleChange('reminder_30min', e.target.checked)}
            disabled={disabled}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            <span className="font-medium">30 minut przed</span>
            <span className="text-gray-500 ml-1">- Przypomnienie na pół godziny przed wydarzeniem</span>
          </span>
        </label>
      </div>

      {!reminders.reminder_24h && !reminders.reminder_2h && !reminders.reminder_30min && (
        <p className="text-xs text-gray-500 italic">
          Nie wybrano żadnych przypomnień. Włącz co najmniej jedno przypomnienie, aby otrzymywać powiadomienia.
        </p>
      )}
    </div>
  )
}

export default ReminderConfig
