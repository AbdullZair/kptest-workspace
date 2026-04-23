import { type ButtonHTMLAttributes, type ReactNode, forwardRef, memo } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Button variant types
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'

/**
 * Button size types
 */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Button props interface
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant for different contexts */
  variant?: ButtonVariant
  /** Button size */
  size?: ButtonSize
  /** Button content */
  children: ReactNode
  /** Loading state */
  loading?: boolean
  /** Full width button */
  fullWidth?: boolean
  /** Left icon */
  leftIcon?: ReactNode
  /** Right icon */
  rightIcon?: ReactNode
  /** Disabled state */
  disabled?: boolean
}

/**
 * Variant styles mapping
 */
const variantStyles: Record<ButtonVariant, string> = {
  primary: clsx(
    'bg-primary-600 text-white',
    'hover:bg-primary-700 active:bg-primary-800',
    'focus:ring-primary-500 focus:ring-offset-2',
    'disabled:bg-primary-300 disabled:cursor-not-allowed'
  ),
  secondary: clsx(
    'bg-secondary-600 text-white',
    'hover:bg-secondary-700 active:bg-secondary-800',
    'focus:ring-secondary-500 focus:ring-offset-2',
    'disabled:bg-secondary-300 disabled:cursor-not-allowed'
  ),
  outline: clsx(
    'bg-transparent border-2 border-primary-600 text-primary-600',
    'hover:bg-primary-50 active:bg-primary-100',
    'focus:ring-primary-500 focus:ring-offset-2',
    'disabled:border-primary-300 disabled:text-primary-300 disabled:cursor-not-allowed'
  ),
  ghost: clsx(
    'bg-transparent text-primary-600',
    'hover:bg-primary-50 active:bg-primary-100',
    'focus:ring-primary-500 focus:ring-offset-2',
    'disabled:text-primary-300 disabled:cursor-not-allowed'
  ),
  danger: clsx(
    'bg-error-600 text-white',
    'hover:bg-error-700 active:bg-error-800',
    'focus:ring-error-500 focus:ring-offset-2',
    'disabled:bg-error-300 disabled:cursor-not-allowed'
  ),
  success: clsx(
    'bg-success-600 text-white',
    'hover:bg-success-700 active:bg-success-800',
    'focus:ring-success-500 focus:ring-offset-2',
    'disabled:bg-success-300 disabled:cursor-not-allowed'
  ),
}

/**
 * Size styles mapping
 */
const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1.5 text-xs font-medium rounded',
  sm: 'px-3 py-2 text-sm font-medium rounded-md',
  md: 'px-4 py-2 text-sm font-medium rounded-md',
  lg: 'px-4 py-2.5 text-base font-medium rounded-md',
  xl: 'px-6 py-3 text-base font-medium rounded-lg',
}

/**
 * Button Component
 *
 * Medical-grade button component with accessibility support
 * and multiple variants for different contexts
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleClick}>
 *   Save Changes
 * </Button>
 *
 * <Button variant="outline" loading={isLoading}>
 *   Loading...
 * </Button>
 *
 * <Button leftIcon={<PlusIcon />} variant="secondary">
 *   Add Patient
 * </Button>
 * ```
 */
export const Button = memo(
  forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    {
      variant = 'primary',
      size = 'md',
      children,
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled = false,
      className,
      type = 'button',
      ...props
    },
    ref
  ) {
    const isDisabled = disabled || loading

    const baseStyles = clsx(
      'inline-flex items-center justify-center',
      'font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:cursor-not-allowed',
      'medical:ring-3 medical:ring-offset-2',
      variantStyles[variant],
      sizeStyles[size],
      fullWidth && 'w-full',
      className
    )

    return (
      <button
        ref={ref}
        type={type}
        className={twMerge(baseStyles)}
        disabled={isDisabled}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {!loading && leftIcon && <span className="mr-2 -ml-1">{leftIcon}</span>}

        {children}

        {!loading && rightIcon && <span className="ml-2 -mr-1">{rightIcon}</span>}
      </button>
    )
  })
)

export default Button
