import { type HTMLAttributes, type ReactNode, forwardRef, memo } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Card size types
 */
export type CardSize = 'sm' | 'md' | 'lg'

/**
 * Card variant types
 */
export type CardVariant = 'default' | 'elevated' | 'outlined' | 'interactive'

/**
 * Card props interface
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card content */
  children: ReactNode
  /** Card header */
  header?: ReactNode
  /** Card footer */
  footer?: ReactNode
  /** Card size */
  size?: CardSize
  /** Card variant */
  variant?: CardVariant
  /** Remove padding from card body */
  noPadding?: boolean
  /** Full width card */
  fullWidth?: boolean
  /** Hoverable card (for interactive variant) */
  hoverable?: boolean
  /** Click handler for interactive cards */
  onClick?: () => void
}

/**
 * Size styles mapping
 */
const sizeStyles: Record<CardSize, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

/**
 * Variant styles mapping
 */
const variantStyles: Record<CardVariant, string> = {
  default: clsx('bg-white', 'border border-neutral-200', 'shadow-card'),
  elevated: clsx('bg-white', 'border border-neutral-200', 'shadow-lg'),
  outlined: clsx('bg-white', 'border-2 border-neutral-300', 'shadow-none'),
  interactive: clsx(
    'bg-white',
    'border border-neutral-200',
    'shadow-card',
    'cursor-pointer',
    'transition-all duration-200',
    'hover:shadow-lg hover:border-primary-300 hover:-translate-y-0.5',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
  ),
}

/**
 * Card Component
 *
 * Medical-grade card component for grouping related content
 * with multiple variants for different contexts
 *
 * @example
 * ```tsx
 * <Card>
 *   <Card.Header>
 *     <h3>Patient Information</h3>
 *   </Card.Header>
 *   <Card.Body>
 *     <p>Content goes here...</p>
 *   </Card.Body>
 *   <Card.Footer>
 *     <Button>View Details</Button>
 *   </Card.Footer>
 * </Card>
 *
 * <Card variant="elevated" size="lg">
 *   <p>Elevated card with large padding</p>
 * </Card>
 *
 * <Card variant="interactive" onClick={handleClick}>
 *   <p>Clickable card</p>
 * </Card>
 * ```
 */
const CardBase = memo(
  forwardRef<HTMLDivElement, CardProps>(
    (
      {
        children,
        header,
        footer,
        size = 'md',
        variant = 'default',
        noPadding = false,
        fullWidth = false,
        hoverable = false,
        onClick,
        className,
        ...props
      },
      ref
    ) => {
      const baseStyles = clsx(
        'rounded-xl',
        'transition-all duration-200',
        variantStyles[variant],
        !noPadding && sizeStyles[size],
        fullWidth && 'w-full',
        hoverable && variant !== 'interactive' && 'hover:shadow-lg',
        className
      )

      return (
        <div
          ref={ref}
          className={twMerge(baseStyles)}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          onClick={onClick}
          onKeyDown={
            onClick
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onClick()
                  }
                }
              : undefined
          }
          {...props}
        >
          {header ? <div className="mb-4 border-b border-neutral-200 pb-4">{header}</div> : null}

          <div className={clsx(header && 'mt-2', footer && 'mb-4')}>{children}</div>

          {footer ? <div className="mt-4 border-t border-neutral-200 pt-4">{footer}</div> : null}
        </div>
      )
    }
  )
)

/**
 * Card Header Component
 */
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

const CardHeader = memo(
  forwardRef<HTMLDivElement, CardHeaderProps>(({ children, className, ...props }, ref) => {
    const baseStyles = clsx(
      'flex items-center justify-between',
      'mb-4 pb-4 border-b border-neutral-200',
      className
    )

    return (
      <div ref={ref} className={twMerge(baseStyles)} {...props}>
        {children}
      </div>
    )
  })
)

/**
 * Card Body Component
 */
interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  noPadding?: boolean
}

const CardBody = memo(
  forwardRef<HTMLDivElement, CardBodyProps>(
    ({ children, noPadding = false, className, ...props }, ref) => {
      const baseStyles = clsx(!noPadding && 'py-2', className)

      return (
        <div ref={ref} className={twMerge(baseStyles)} {...props}>
          {children}
        </div>
      )
    }
  )
)

/**
 * Card Footer Component
 */
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

const CardFooter = memo(
  forwardRef<HTMLDivElement, CardFooterProps>(({ children, className, ...props }, ref) => {
    const baseStyles = clsx(
      'mt-4 pt-4 border-t border-neutral-200',
      'flex items-center justify-between',
      className
    )

    return (
      <div ref={ref} className={twMerge(baseStyles)} {...props}>
        {children}
      </div>
    )
  })
)

// Attach sub-components to Card with proper typing
type CardComponent = typeof CardBase & {
  Header: typeof CardHeader
  Body: typeof CardBody
  Footer: typeof CardFooter
}

export const Card = CardBase as CardComponent
Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter

export type { CardHeaderProps, CardBodyProps, CardFooterProps }

// Export Card with sub-components type (alias for backward compat)
export const CardWithSubcomponents = Card

export default Card
