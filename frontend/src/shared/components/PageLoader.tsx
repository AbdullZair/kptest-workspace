import { type HTMLAttributes, forwardRef, memo } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * PageLoader size types
 */
export type PageLoaderSize = 'sm' | 'md' | 'lg'

/**
 * PageLoader props interface
 */
export interface PageLoaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Loader size */
  size?: PageLoaderSize
  /** Loading text */
  text?: string
  /** Show overlay background */
  overlay?: boolean
}

/**
 * Size styles mapping
 */
const sizeStyles: Record<PageLoaderSize, { spinner: string; text: string }> = {
  sm: { spinner: 'h-8 w-8', text: 'text-sm' },
  md: { spinner: 'h-12 w-12', text: 'text-base' },
  lg: { spinner: 'h-16 w-16', text: 'text-lg' },
}

/**
 * PageLoader Component
 *
 * Full-page loading indicator for medical application
 *
 * @example
 * ```tsx
 * <PageLoader />
 * <PageLoader size="lg" text="Loading patient data..." />
 * <PageLoader overlay />
 * ```
 */
export const PageLoader = memo(
  forwardRef<HTMLDivElement, PageLoaderProps>(function PageLoader(
    {
      size = 'md',
      text = 'Loading...',
      overlay = false,
      className,
      ...props
    },
    ref
  ) {
    const baseStyles = clsx(
      'flex flex-col items-center justify-center',
      'text-neutral-600',
      overlay && 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50',
      className
    )

    return (
      <div ref={ref} className={twMerge(baseStyles)} {...props}>
        <svg
          className={clsx(
            'animate-spin',
            'text-primary-600',
            sizeStyles[size].spinner
          )}
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

        {text && (
          <p
            className={clsx(
              'mt-4 font-medium',
              sizeStyles[size].text
            )}
          >
            {text}
          </p>
        )}
      </div>
    )
  })
)

export default PageLoader
