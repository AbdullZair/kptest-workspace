import { type ButtonHTMLAttributes, type ReactNode, forwardRef, memo } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * IconButton variant types
 */
export type IconButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'

/**
 * IconButton size types
 */
export type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg'

/**
 * IconButton props interface.
 *
 * IMPORTANT: `aria-label` is REQUIRED for accessibility (WCAG 2.1 button-name).
 * Icon-only buttons must have an accessible name for screen readers.
 */
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required accessible label for screen readers (icon-only buttons must have one) */
  'aria-label': string
  /** Icon node (typically an svg) */
  icon: ReactNode
  /** Visual variant */
  variant?: IconButtonVariant
  /** Button size */
  size?: IconButtonSize
}

const variantStyles: Record<IconButtonVariant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
  secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
  outline: 'border-2 border-primary-200 bg-transparent text-primary-600 hover:bg-primary-50',
  ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100',
  danger: 'border-2 border-rose-200 bg-transparent text-rose-600 hover:bg-rose-50',
  success: 'bg-success-600 text-white hover:bg-success-700',
}

const sizeStyles: Record<IconButtonSize, string> = {
  xs: 'p-1 rounded',
  sm: 'p-1.5 rounded-md',
  md: 'p-2 rounded-md',
  lg: 'p-2.5 rounded-lg',
}

/**
 * IconButton Component
 *
 * Accessible icon-only button with required `aria-label` enforced by TypeScript.
 *
 * @example
 * ```tsx
 * <IconButton
 *   aria-label="Edytuj projekt"
 *   icon={<EditIcon className="h-4 w-4" />}
 *   onClick={handleEdit}
 * />
 * ```
 */
export const IconButton = memo(
  forwardRef<HTMLButtonElement, IconButtonProps>(
    (
      {
        icon,
        variant = 'ghost',
        size = 'sm',
        className,
        type = 'button',
        ...props
      },
      ref
    ) => {
      const baseStyles = clsx(
        'inline-flex items-center justify-center transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variantStyles[variant],
        sizeStyles[size],
        className
      )

      return (
        <button ref={ref} type={type} className={twMerge(baseStyles)} {...props}>
          {icon}
        </button>
      )
    }
  )
)

export default IconButton
