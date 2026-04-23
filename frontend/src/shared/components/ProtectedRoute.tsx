import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@features/auth'
import { PageLoader } from './PageLoader'

/**
 * User roles for access control
 */
export type UserRole = 'ADMIN' | 'COORDINATOR' | 'DOCTOR' | 'PATIENT'

/**
 * ProtectedRoute props
 */
interface ProtectedRouteProps {
  children: React.ReactNode
  /** Allowed roles for this route. If not specified, all authenticated users can access */
  allowedRoles?: UserRole[]
}

/**
 * ProtectedRoute Component
 * 
 * Route guard that checks authentication and optional role-based access
 * - Redirects to /login if user is not authenticated
 * - Shows loading state while checking authentication
 * - Optionally restricts access to specific user roles
 * 
 * @example
 * ```tsx
 * // Basic protected route (any authenticated user)
 * <ProtectedRoute>
 *   <DashboardPage />
 * </ProtectedRoute>
 * 
 * // Role-based access (only admins)
 * <ProtectedRoute allowedRoles={['ADMIN']}>
 *   <AdminPanel />
 * </ProtectedRoute>
 * 
 * // Multiple roles
 * <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR']}>
 *   <MedicalRecords />
 * </ProtectedRoute>
 * ```
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  // Show loading state while checking authentication
  if (isLoading) {
    return <PageLoader />
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Check role-based access if roles are specified
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role as UserRole | undefined
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Redirect to unauthorized page or dashboard
      return <Navigate to="/dashboard" replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute
