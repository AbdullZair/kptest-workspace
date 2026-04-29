import { type ComponentType, type ErrorInfo, type PropsWithChildren, Component } from 'react'
import { Button } from './Button'
import { Card } from './Card'

/**
 * Error Boundary props interface
 */
export interface ErrorBoundaryProps extends PropsWithChildren {
  /** Custom fallback component */
  fallback?: ComponentType<{ error: Error; resetError: () => void }>
  /** Error message to display */
  errorMessage?: string
  /** Callback when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /** Whether to show reset button */
  showResetButton?: boolean
  /** Reset button text */
  resetButtonText?: string
}

/**
 * Error Boundary state
 */
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * ErrorBoundary Component
 *
 * React Error Boundary for catching and handling errors
 * in component trees with graceful degradation
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <PatientList />
 * </ErrorBoundary>
 *
 * <ErrorBoundary
 *   errorMessage="Something went wrong with this section"
 *   onError={(error, info) => logError(error, info)}
 * >
 *   <Dashboard />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  /**
   * Static getDerivedStateFromError
   * Updates state so the next render shows the fallback UI
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  /**
   * componentDidCatch
   * Logs error information to error reporting service
   */
  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo })

    // Call onError callback if provided
    this.props.onError?.(error, errorInfo)

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Caught error:', error, errorInfo)
    }

    // TODO: Send to error reporting service (Sentry, etc.)
    // logErrorToService(error, errorInfo)
  }

  /**
   * Reset error state
   */
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  /**
   * Render fallback UI or children
   */
  override render(): React.ReactNode {
    const { hasError, error } = this.state
    const {
      children,
      fallback: Fallback,
      errorMessage = 'Something went wrong',
      showResetButton = true,
      resetButtonText = 'Try again',
    } = this.props

    if (hasError) {
      // Render custom fallback component
      if (Fallback && error) {
        return <Fallback error={error} resetError={this.resetError} />
      }

      // Render default error UI
      return (
        <Card variant="outlined" className="mx-auto my-8 max-w-md">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error-100">
              <svg
                className="h-6 w-6 text-error-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            <h3 className="mb-2 text-lg font-medium text-neutral-900">{errorMessage}</h3>

            {import.meta.env.DEV && error ? (
              <pre className="mt-4 max-h-48 overflow-auto rounded-md bg-neutral-100 p-4 text-left text-sm">
                <code>{error.message}</code>
              </pre>
            ) : null}

            {showResetButton ? (
              <div className="mt-6">
                <Button onClick={this.resetError} variant="primary">
                  {resetButtonText}
                </Button>
              </div>
            ) : null}
          </div>
        </Card>
      )
    }

    return children
  }
}

export default ErrorBoundary
