import { memo, useState, useCallback } from 'react'
import { Input, Button } from '@shared/components'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * PatientSearch component props
 */
export interface PatientSearchProps {
  /** Search query value */
  value?: string
  /** Change handler */
  onChange?: (value: string) => void
  /** Submit handler */
  onSubmit?: (value: string) => void
  /** Placeholder text */
  placeholder?: string
  /** Disabled state */
  disabled?: boolean
  /** Full width */
  fullWidth?: boolean
  /** Compact mode */
  compact?: boolean
  /** Additional class names */
  className?: string
}

/**
 * PatientSearch Component
 *
 * Search input for finding patients by PESEL, name, or HIS ID
 *
 * @example
 * ```tsx
 * <PatientSearch
 *   value={searchQuery}
 *   onChange={setQuery}
 *   onSubmit={handleSearch}
 * />
 *
 * <PatientSearch compact placeholder="Szukaj pacjenta..." />
 * ```
 */
export const PatientSearch = memo(function PatientSearch({
  value = '',
  onChange,
  onSubmit,
  placeholder = 'Szukaj po PESEL, imieniu, nazwisku lub HIS ID...',
  disabled = false,
  fullWidth = true,
  compact = false,
  className,
}: PatientSearchProps) {
  const [localValue, setLocalValue] = useState(value)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setLocalValue(newValue)
      onChange?.(newValue)
    },
    [onChange]
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      onSubmit?.(localValue)
    },
    [onSubmit, localValue]
  )

  const handleClear = useCallback(() => {
    setLocalValue('')
    onChange?.('')
    onSubmit?.('')
  }, [onChange, onSubmit])

  const baseStyles = clsx(
    'flex gap-2',
    compact ? 'flex-row' : 'flex-col sm:flex-row',
    fullWidth && 'w-full',
    className
  )

  const hasValue = localValue.trim().length > 0

  return (
    <form onSubmit={handleSubmit} className={twMerge(baseStyles)}>
      <div className={clsx('flex-1', fullWidth && 'w-full')}>
        <Input
          type="text"
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          fullWidth
          leftIcon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          }
          rightIcon={
            hasValue && (
              <button
                type="button"
                onClick={handleClear}
                className="hover:text-neutral-600 transition-colors"
                aria-label="Wyczyść wyszukiwanie"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )
          }
          aria-label="Wyszukaj pacjenta"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={disabled || !localValue.trim()}
        size={compact ? 'sm' : 'md'}
        className={compact ? '' : 'sm:self-end'}
      >
        Szukaj
      </Button>
    </form>
  )
})

export default PatientSearch
