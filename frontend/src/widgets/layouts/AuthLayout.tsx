import { Outlet } from 'react-router-dom'

/**
 * AuthLayout Component
 *
 * Layout for authentication pages (login, register, etc.)
 * Uses Outlet to render child routes
 */
export const AuthLayout = () => {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  )
}

export default AuthLayout
