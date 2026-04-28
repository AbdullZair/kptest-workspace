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
const ProjectsPage = lazy(() => import('@features/projects/ui/ProjectsPage'))
const ProjectDetailPage = lazy(() => import('@features/projects/ui/ProjectDetailPage'))
const ProjectPatientsPage = lazy(() => import('@features/projects/ui/ProjectPatientsPage'))
const ProjectStatisticsPage = lazy(() => import('@features/projects/ui/ProjectStatisticsPage'))

/**
 * Messages pages
 */
const MessagesPage = lazy(() => import('@features/messages/ui/MessagesPage'))
const ConversationPage = lazy(() => import('@features/messages/ui/ConversationPage'))

/**
 * Calendar pages
 */
const CalendarPage = lazy(() => import('@features/calendar/ui/CalendarPage'))

/**
 * Materials pages
 */
const MaterialsPage = lazy(() => import('@features/materials/ui/MaterialsPage'))
const MaterialDetailPage = lazy(() => import('@features/materials/ui/MaterialDetailPage'))
const MaterialAdminPage = lazy(() => import('@features/materials/ui/MaterialAdminPage'))

/**
 * Reports pages
 */
const ReportsPage = lazy(() => import('@features/reports/ui/ReportsPage'))
const ReportDetailPage = lazy(() => import('@features/reports/ui/ReportDetailPage'))
const ComplianceDashboard = lazy(() => import('@features/reports/ui/ComplianceDashboard'))

/**
 * Admin pages
 */
const AdminDashboard = lazy(() => import('@features/admin/ui/AdminDashboard'))
const AdminUsersPage = lazy(() => import('@features/admin/ui/AdminUsersPage'))
const AdminAuditLogsPage = lazy(() => import('@features/admin/ui/AdminAuditLogsPage'))
const AdminSystemPage = lazy(() => import('@features/admin/ui/AdminSystemPage'))
const AdminSystemLogsPage = lazy(() => import('@features/admin/ui/AdminSystemLogsPage'))
const PatientDataAdminPage = lazy(() => import('@features/admin/ui/PatientDataAdminPage'))
const RodoPanelPage = lazy(() => import('@features/admin/ui/RodoPanelPage'))
const DataProcessingActivitiesPage = lazy(
  () => import('@features/admin/ui/DataProcessingActivitiesPage')
)

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
      {
        path: 'projects',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProjectsPage />
          </Suspense>
        ),
      },
      {
        path: 'projects/:id',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProjectDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'projects/:id/patients',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProjectPatientsPage />
          </Suspense>
        ),
      },
      {
        path: 'messages',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MessagesPage />
          </Suspense>
        ),
      },
      {
        path: 'messages/:threadId',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ConversationPage />
          </Suspense>
        ),
      },
      {
        path: 'calendar',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CalendarPage />
          </Suspense>
        ),
      },
      {
        path: 'materials',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MaterialsPage />
          </Suspense>
        ),
      },
      {
        path: 'materials/:id',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MaterialDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'materials/admin',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MaterialAdminPage />
          </Suspense>
        ),
      },
      {
        path: 'reports',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ReportsPage />
          </Suspense>
        ),
      },
      {
        path: 'reports/:id',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ReportDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'compliance',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ComplianceDashboard />
          </Suspense>
        ),
      },
      {
        path: 'projects/:id/statistics',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProjectStatisticsPage />
          </Suspense>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Suspense fallback={<PageLoader />}>
              <AdminDashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Suspense fallback={<PageLoader />}>
              <AdminUsersPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/audit-logs',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Suspense fallback={<PageLoader />}>
              <AdminAuditLogsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/system',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Suspense fallback={<PageLoader />}>
              <AdminSystemPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/system/logs',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Suspense fallback={<PageLoader />}>
              <AdminSystemLogsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/patients/:id/data',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Suspense fallback={<PageLoader />}>
              <PatientDataAdminPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/rodo',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Suspense fallback={<PageLoader />}>
              <RodoPanelPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/data-processing-activities',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Suspense fallback={<PageLoader />}>
              <DataProcessingActivitiesPage />
            </Suspense>
          </ProtectedRoute>
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
