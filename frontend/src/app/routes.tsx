import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'
import { Suspense, lazy } from 'react'

// Layouts
import { AuthLayout } from '@widgets/layouts/AuthLayout'
import { MainLayout } from '@widgets/layout/MainLayout'

// Route guards
import { ProtectedRoute, PublicRoute } from '@shared/components'

// Loading components
import { PageLoader } from '@shared/components/PageLoader'

/**
 * Public pages (no auth required)
 */
const LoginPage = lazy(() => import('@pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@pages/auth/ResetPasswordPage'))
const TwoFaPage = lazy(() => import('@pages/auth/TwoFaPage'))

/**
 * Protected pages (auth required)
 */
const DashboardPage = lazy(() => import('@pages/dashboard/DashboardPage'))
const PatientsPage = lazy(() => import('@pages/patients/PatientsPage'))
const PatientDetailPage = lazy(() => import('@pages/patients/PatientDetailPage'))
const AppointmentsPage = lazy(() => import('@pages/appointments/AppointmentsPage'))
const SettingsPage = lazy(() => import('@pages/settings/SettingsPage'))
const ProfilePage = lazy(() => import('@pages/profile/ProfilePage'))

/**
 * Route configuration
 */
export const routes: RouteObject[] = [
  // Public routes
  {
    path: '/',
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'login',
        element: (
          <Suspense fallback={<PageLoader />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: 'register',
        element: (
          <Suspense fallback={<PageLoader />}>
            <RegisterPage />
          </Suspense>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ForgotPasswordPage />
          </Suspense>
        ),
      },
      {
        path: 'reset-password/:token',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ResetPasswordPage />
          </Suspense>
        ),
      },
      {
        path: '2fa',
        element: (
          <Suspense fallback={<PageLoader />}>
            <TwoFaPage />
          </Suspense>
        ),
      },
    ],
  },
  // Protected routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<PageLoader />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'patients',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PatientsPage />
          </Suspense>
        ),
      },
      {
        path: 'patients/:id',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PatientDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'appointments',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AppointmentsPage />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SettingsPage />
          </Suspense>
        ),
      },
      {
        path: 'profile',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProfilePage />
          </Suspense>
        ),
      },
    ],
  },
  // 404 route
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]

/**
 * Router instance
 */
export const router = createBrowserRouter(routes, {
  basename: '/',
})
