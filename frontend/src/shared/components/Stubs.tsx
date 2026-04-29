/**
 * Lightweight UI primitives used across feature pages that have not been
 * promoted to fully designed components yet. They render minimally styled
 * elements so the application keeps working until proper UI Kit equivalents
 * are added. Intentionally permissive on props.
 */
import {
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  forwardRef,
  memo,
} from 'react'

/* -------------------------------------------------------------------------- */
/*  Modal                                                                     */
/* -------------------------------------------------------------------------- */
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: ReactNode
  children?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  footer?: ReactNode
}

export const Modal = memo(({ isOpen, onClose, title, children, footer, className }: ModalProps) => {
  if (!isOpen) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
    >
      <div className={`mx-4 w-full max-w-2xl rounded-lg bg-white shadow-xl ${className ?? ''}`}>
        {title ? (
          <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700"
              aria-label="Zamknij"
            >
              ×
            </button>
          </div>
        ) : null}
        <div className="px-6 py-4">{children}</div>
        {footer ? (
          <div className="flex justify-end gap-2 border-t border-neutral-200 px-6 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
})
Modal.displayName = 'Modal'

/* -------------------------------------------------------------------------- */
/*  Select                                                                    */
/* -------------------------------------------------------------------------- */
export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  options?: SelectOption[]
  errorMessage?: string
  helperText?: string
  fullWidth?: boolean
  /** Placeholder option label rendered before any user choice. */
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, options, errorMessage, helperText, fullWidth, className, children, placeholder, ...rest },
    ref
  ) => (
    <label className={`flex flex-col gap-1 ${fullWidth ? 'w-full' : ''}`}>
      {label ? <span className="text-sm font-medium text-neutral-700">{label}</span> : null}
      <select
        ref={ref}
        className={`rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 ${className ?? ''}`}
        {...rest}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      {errorMessage ? (
        <span className="text-xs text-red-600">{errorMessage}</span>
      ) : helperText ? (
        <span className="text-xs text-neutral-500">{helperText}</span>
      ) : null}
    </label>
  )
)
Select.displayName = 'Select'

/* -------------------------------------------------------------------------- */
/*  Textarea                                                                  */
/* -------------------------------------------------------------------------- */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  errorMessage?: string
  helperText?: string
  fullWidth?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, errorMessage, helperText, fullWidth, className, ...rest }, ref) => (
    <label className={`flex flex-col gap-1 ${fullWidth ? 'w-full' : ''}`}>
      {label ? <span className="text-sm font-medium text-neutral-700">{label}</span> : null}
      <textarea
        ref={ref}
        className={`rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 ${className ?? ''}`}
        {...rest}
      />
      {errorMessage ? (
        <span className="text-xs text-red-600">{errorMessage}</span>
      ) : helperText ? (
        <span className="text-xs text-neutral-500">{helperText}</span>
      ) : null}
    </label>
  )
)
Textarea.displayName = 'Textarea'

/* -------------------------------------------------------------------------- */
/*  Checkbox                                                                  */
/* -------------------------------------------------------------------------- */
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, ...rest }, ref) => (
    <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
      <input
        ref={ref}
        type="checkbox"
        className={`h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 ${className ?? ''}`}
        {...rest}
      />
      {label}
    </label>
  )
)
Checkbox.displayName = 'Checkbox'

/* -------------------------------------------------------------------------- */
/*  Radio                                                                     */
/* -------------------------------------------------------------------------- */
export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, className, ...rest }, ref) => (
    <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
      <input
        ref={ref}
        type="radio"
        className={`h-4 w-4 border-neutral-300 text-primary-600 focus:ring-primary-500 ${className ?? ''}`}
        {...rest}
      />
      {label}
    </label>
  )
)
Radio.displayName = 'Radio'

/* -------------------------------------------------------------------------- */
/*  Alert                                                                     */
/* -------------------------------------------------------------------------- */
export type AlertVariant = 'info' | 'success' | 'warning' | 'error'
export interface AlertProps {
  variant?: AlertVariant
  title?: ReactNode
  children?: ReactNode
  className?: string
  onClose?: () => void
}

const ALERT_STYLES: Record<AlertVariant, string> = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  error: 'bg-red-50 border-red-200 text-red-800',
}

export const Alert = memo(({ variant = 'info', title, children, className, onClose }: AlertProps) => (
  <div
    role="alert"
    className={`flex items-start gap-2 rounded-md border px-4 py-3 text-sm ${ALERT_STYLES[variant]} ${className ?? ''}`}
  >
    <div className="flex-1">
      {title ? <p className="font-semibold">{title}</p> : null}
      {children}
    </div>
    {onClose ? (
      <button
        type="button"
        onClick={onClose}
        className="text-current opacity-70 hover:opacity-100"
        aria-label="Zamknij"
      >
        ×
      </button>
    ) : null}
  </div>
))
Alert.displayName = 'Alert'

/* -------------------------------------------------------------------------- */
/*  ProgressBar                                                               */
/* -------------------------------------------------------------------------- */
export interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  variant?: 'primary' | 'success' | 'warning' | 'error'
  /** Alias for variant used by older callsites */
  color?: 'primary' | 'success' | 'warning' | 'error' | string
  showLabel?: boolean
}

export const ProgressBar = memo(
  ({ value, max = 100, className, variant = 'primary', showLabel }: ProgressBarProps) => {
    const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)))
    const colorClass: Record<NonNullable<ProgressBarProps['variant']>, string> = {
      primary: 'bg-primary-500',
      success: 'bg-green-500',
      warning: 'bg-amber-500',
      error: 'bg-red-500',
    }
    return (
      <div className={`flex items-center gap-2 ${className ?? ''}`}>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200">
          <div
            className={`h-full ${colorClass[variant]} transition-all`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {showLabel ? <span className="text-xs text-neutral-600">{pct}%</span> : null}
      </div>
    )
  }
)
ProgressBar.displayName = 'ProgressBar'

/* -------------------------------------------------------------------------- */
/*  Tabs                                                                      */
/* -------------------------------------------------------------------------- */
export interface TabItem {
  id: string
  label: ReactNode
  content?: ReactNode
}

export interface TabsProps {
  items?: TabItem[]
  /** Alias for items used by older callsites */
  tabs?: TabItem[]
  value?: string
  /** Alias for value used by older callsites */
  activeTab?: string
  onChange?: (id: string) => void
  /** Alias for onChange used by older callsites */
  onTabChange?: (id: string) => void
  className?: string
}

export const Tabs = memo(({ items, tabs, value, activeTab, onChange, onTabChange, className }: TabsProps) => {
  const list = items ?? tabs ?? []
  const activeId = value ?? activeTab ?? list[0]?.id
  const active = list.find((i) => i.id === activeId)
  const handleChange = (id: string) => {
    onChange?.(id)
    onTabChange?.(id)
  }
  return (
    <div className={className}>
      <div role="tablist" className="flex gap-1 border-b border-neutral-200">
        {list.map((item) => {
          const isActive = item.id === activeId
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleChange(item.id)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
                isActive
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-600 hover:text-neutral-800'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      {active?.content ? <div className="pt-4">{active.content}</div> : null}
    </div>
  )
})
Tabs.displayName = 'Tabs'

/* Generic button-with-loading wrapper occasionally referenced. */
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode
}
