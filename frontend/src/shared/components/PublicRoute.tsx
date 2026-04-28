import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@features/auth'

/**
 * PublicRoute props
 */
interface PublicRouteProps {
  children: React.ReactNode
}

/**
 * PublicRoute Component
 *
 * Route guard for public pages (login, register, forgot password, etc.)
 * - Redirects to /dashboard if user is already authenticated
 * - Shows loading state while checking authentication
 *
 * @example
 * ```tsx
 * // Login page (redirects to dashboard if already logged in)
 * <PublicRoute>
 *   <LoginPage />
 * </PublicRoute>
 *
 * // Register page
 * <PublicRoute>
 *   <RegisterPage />
 * </PublicRoute>
 * ```
 */
export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  // Don't gate behind a global loader — that would unmount forms (login,
  // register) every time their own mutation flips isLoading=true and lose
  // their local state. Auth status comes from a synchronous selector.
  if (isAuthenticated) {
    const from = (location.state as { from?: Location })?.from || { pathname: '/dashboard' }
    return <Navigate to={from} replace />
  }

  return <>{children}</>
}

export default PublicRoute
