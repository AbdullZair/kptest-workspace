import { memo, type ChangeEvent } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * PreferenceToggle props
 */
export interface PreferenceToggleProps {
  /** Toggle label */
  label: string
  /** Toggle description/help text */
  description?: string
  /** Checked state */
  checked: boolean
  /** Disabled state */
  disabled?: boolean
  /** Loading state */
  loading?: boolean
  /** onChange handler */
  onChange: (checked: boolean) => void
  /** Custom className */
  className?: string
  /** Toggle size */
  size?: 'sm' | 'md' | 'lg'
}

/**
 * PreferenceToggle Component
 *
 * Toggle switch for notification preferences with label and description
 *
 * @example
 * ```tsx
 * <PreferenceToggle
 *   label="Powiadomienia o wiadomościach"
 *   description="Otrzymuj powiadomienia o nowych wiadomościach"
 *   checked={preferences.message_notifications}
 *   onChange={(checked) => updatePreferences({ message_notifications: checked })}
 * />
 * ```
 */
export const PreferenceToggle = memo(
  ({
    label,
    description,
    checked,
    disabled = false,
    loading = false,
    onChange,
    className,
    size = 'md',
  }: PreferenceToggleProps) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.checked)
    }

    const sizeStyles = {
      sm: 'w-9 h-5',
      md: 'w-11 h-6',
      lg: 'w-14 h-7',
    }

    const knobSizeStyles = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    }

    const translateStyles = {
      sm: 'translate-x-4',
      md: 'translate-x-5',
      lg: 'translate-x-7',
    }

    const baseStyles = clsx(
      'flex items-center justify-between',
      'py-3 px-4 rounded-lg',
      'transition-colors duration-200',
      disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50',
      className
    )

    return (
      <div className={twMerge(baseStyles)}>
        <div className="min-w-0 flex-1">
          <label
            htmlFor={label}
            className={clsx(
              'font-medium',
              disabled ? 'text-gray-400' : 'text-gray-900',
              size === 'lg' ? 'text-base' : 'text-sm'
            )}
          >
            {label}
          </label>
          {description ? (
            <p
              className={clsx(
                'mt-0.5',
                disabled ? 'text-gray-300' : 'text-gray-500',
                size === 'lg' ? 'text-sm' : 'text-xs'
              )}
            >
              {description}
            </p>
          ) : null}
        </div>

        <label className="relative inline-flex cursor-pointer items-center">
          <input
            id={label}
            type="checkbox"
            className="peer sr-only"
            checked={checked}
            onChange={handleChange}
            disabled={disabled || loading}
            aria-describedby={description ? `${label}-description` : undefined}
          />

          {/* Toggle track */}
          <div
            className={clsx(
              'relative rounded-full transition-colors duration-200 ease-in-out',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              sizeStyles[size],
              checked ? 'bg-primary-600' : 'bg-gray-300',
              (disabled || loading) && 'cursor-not-allowed opacity-50'
            )}
            role="switch"
            aria-checked={checked}
            aria-disabled={disabled || loading}
          >
            {/* Toggle knob */}
            <div
              className={clsx(
                'absolute left-0.5 top-0.5',
                'rounded-full bg-white shadow-md',
                'transform transition-transform duration-200 ease-in-out',
                knobSizeStyles[size],
                checked && translateStyles[size]
              )}
            >
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="h-3 w-3 animate-spin text-primary-600" viewBox="0 0 24 24">
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
              ) : null}
            </div>
          </div>
        </label>
      </div>
    )
  }
)

export default PreferenceToggle
