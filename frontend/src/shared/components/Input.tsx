import {
  type InputHTMLAttributes,
  type ReactNode,
  forwardRef,
  memo,
  useId,
} from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Input variant types
 */
export type InputVariant = 'default' | 'error' | 'success'

/**
 * Input size types
 */
export type InputSize = 'sm' | 'md' | 'lg'

/**
 * Input props interface
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Input label */
  label?: string
  /** Input placeholder */
  placeholder?: string
  /** Input variant for validation states */
  variant?: InputVariant
  /** Input size */
  size?: InputSize
  /** Helper text below input */
  helperText?: string
  /** Error message */
  errorMessage?: string
  /** Left icon */
  leftIcon?: ReactNode
  /** Right icon */
  rightIcon?: ReactNode
  /** Full width input */
  fullWidth?: boolean
  /** Required field indicator */
  required?: boolean
  /** Disable the input */
  disabled?: boolean
  /** Read-only state */
  readOnly?: boolean
}

/**
 * Size styles mapping
 */
const sizeStyles: Record<InputSize, string> = {
  sm: 'px-2.5 py-1.5 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2.5 text-base',
}

/**
 * Input Component
 *
 * Medical-grade input component with accessibility support
 * and validation states
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   required
 * />
 *
 * <Input
 *   label="Password"
 *   type="password"
 *   variant="error"
 *   errorMessage="Password is required"
 * />
 *
 * <Input
 *   label="Search"
 *   leftIcon={<SearchIcon />}
 *   placeholder="Search patients..."
 * />
 * ```
 */
export const Input = memo(
  forwardRef<HTMLInputElement, InputProps>(function Input(
    {
      label,
      placeholder,
      variant = 'default',
      size = 'md',
      helperText,
      errorMessage,
      leftIcon,
      rightIcon,
      fullWidth = false,
      required = false,
      disabled = false,
      readOnly = false,
      className,
      id: providedId,
      type = 'text',
      ...props
    },
    ref
  ) {
    const generatedId = useId()
    const inputId = providedId || generatedId
    const helperId = `${inputId}-helper`
    const errorId = `${inputId}-error`

    const isInvalid = variant === 'error' || !!errorMessage

    const baseStyles = clsx(
      'block',
      'border rounded-md',
      'transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:bg-neutral-100 disabled:cursor-not-allowed',
      'read-only:bg-neutral-50',
      'placeholder:text-neutral-400',
      sizeStyles[size],
      variant === 'default' &&
        clsx(
          'border-neutral-300',
          'focus:border-primary-500 focus:ring-primary-500/20',
          'hover:border-neutral-400'
        ),
      variant === 'error' &&
        clsx(
          'border-error-500',
          'focus:border-error-500 focus:ring-error-500/20',
          'hover:border-error-600'
        ),
      variant === 'success' &&
        clsx(
          'border-success-500',
          'focus:border-success-500 focus:ring-success-500/20',
          'hover:border-success-600'
        ),
      fullWidth && 'w-full',
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
      className
    )

    return (
      <div className={clsx(fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className={clsx(
              'block text-sm font-medium text-neutral-700',
              'mb-1',
              required && 'after:content-["*"] after:ml-0.5 after:text-error-500'
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            className={twMerge(baseStyles)}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            aria-invalid={isInvalid}
            aria-describedby={clsx(
              helperText && helperId,
              isInvalid && errorId
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400">
              {rightIcon}
            </div>
          )}
        </div>

        {helperText && !isInvalid && (
          <p
            id={helperId}
            className="mt-1 text-sm text-neutral-500"
          >
            {helperText}
          </p>
        )}

        {isInvalid && errorMessage && (
          <p
            id={errorId}
            className="mt-1 text-sm text-error-600 flex items-center gap-1"
            role="alert"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errorMessage}
          </p>
        )}
      </div>
    )
  })
)

export default Input
