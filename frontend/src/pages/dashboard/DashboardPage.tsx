import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@features/auth'
import { Card, Button } from '@shared/components'
import type { UserRole } from '@shared/components'

/**
 * Stat card props
 */
interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'primary' | 'secondary' | 'warning' | 'success'
  trend?: {
    value: number
    isPositive: boolean
  }
}

/**
 * StatCard Component
 */
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => {
  const { t } = useTranslation()
  const colorStyles = {
    primary: 'bg-primary-100 text-primary-700',
    secondary: 'bg-secondary-100 text-secondary-700',
    warning: 'bg-warning-100 text-warning-800',
    success: 'bg-success-100 text-success-700',
  }

  return (
    <Card className="p-6" variant="elevated">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{value}</p>
          {trend ? (
            <div className="mt-2 flex items-center gap-1">
              <svg
                className={`h-4 w-4 ${trend.isPositive ? 'text-success-600' : 'text-error-600'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {trend.isPositive ? (
                  <path
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                ) : (
                  <path
                    d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                )}
              </svg>
              <span
                className={`text-sm font-medium ${trend.isPositive ? 'text-success-600' : 'text-error-600'}`}
              >
                {trend.isPositive ? '+' : '-'}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-sm text-neutral-700">{t('dashboard.lastMonth')}</span>
            </div>
          ) : null}
        </div>
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-xl ${colorStyles[color]}`}
        >
          {icon}
        </div>
      </div>
    </Card>
  )
}

/**
 * Quick action card props
 */
interface QuickActionProps {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: 'primary' | 'secondary' | 'warning' | 'success'
}

/**
 * QuickAction Component
 */
const QuickAction: React.FC<QuickActionProps> = ({ title, description, icon, href, color }) => {
  const colorStyles = {
    primary: 'bg-primary-50 hover:bg-primary-100 border-primary-200',
    secondary: 'bg-secondary-50 hover:bg-secondary-100 border-secondary-200',
    warning: 'bg-warning-50 hover:bg-warning-100 border-warning-200',
    success: 'bg-success-50 hover:bg-success-100 border-success-200',
  }

  const iconColorStyles = {
    primary: 'text-primary-700',
    secondary: 'text-secondary-700',
    warning: 'text-warning-800',
    success: 'text-success-700',
  }

  return (
    <Link
      className={`block rounded-xl border p-4 transition-all duration-200 ${colorStyles[color]} hover:-translate-y-0.5 hover:shadow-md`}
      to={href}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconColorStyles[color]}`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
          <p className="mt-1 text-sm text-neutral-600">{description}</p>
        </div>
        <svg
          className="h-5 w-5 text-neutral-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        </svg>
      </div>
    </Link>
  )
}

/**
 * DashboardPage Component
 *
 * Main dashboard with:
 * - Welcome message with user info
 * - Stats cards based on user role
 * - Quick actions for common tasks
 * - Recent activity section
 *
 * Role-based content:
 * - ADMIN: Full access to all stats and actions
 * - DOCTOR: Patient and appointment focused
 * - PATIENT: Personal health data focused
 * - COORDINATOR: Overview and management focused
 */
export const DashboardPage = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const userRole = user?.role as UserRole | undefined

  const getWelcomeMessage = () => {
    const hour = new Date().getHours()
    if (hour < 12) return t('dashboard.welcome.goodMorning')
    if (hour < 18) return t('dashboard.welcome.goodMorning')
    return t('dashboard.welcome.goodEvening')
  }

  const getRoleSpecificStats = () => {
    switch (userRole) {
      case 'ADMIN':
        return [
          {
            title: t('dashboard.stats.allPatients'),
            value: '2,543',
            icon: (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            color: 'primary' as const,
            trend: { value: 12.5, isPositive: true },
          },
          {
            title: t('dashboard.stats.todaysAppointments'),
            value: '48',
            icon: (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            color: 'secondary' as const,
            trend: { value: 8.2, isPositive: true },
          },
          {
            title: t('dashboard.stats.doctorsOnDuty'),
            value: '12',
            icon: (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            color: 'warning' as const,
          },
          {
            title: t('dashboard.stats.completedAppointments'),
            value: '1,234',
            icon: (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            color: 'success' as const,
            trend: { value: 5.3, isPositive: true },
          },
        ]
      case 'DOCTOR':
        return [
          {
            title: t('dashboard.stats.myPatients'),
            value: '156',
            icon: (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            color: 'primary' as const,
            trend: { value: 3.2, isPositive: true },
          },
          {
            title: t('dashboard.stats.todaysAppointments'),
            value: '8',
            icon: (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            color: 'secondary' as const,
          },
          {
            title: t('dashboard.stats.pendingResults'),
            value: '5',
            icon: (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            color: 'warning' as const,
          },
          {
            title: t('dashboard.stats.completedToday'),
            value: '3',
            icon: (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            color: 'success' as const,
          },
        ]
      case 'PATIENT':
        return [
          {
            title: t('dashboard.stats.nextAppointment'),
            value: t('dashboard.stats.days', { count: 2 }),
            icon: (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            color: 'primary' as const,
          },
          {
            title: t('dashboard.stats.myPrescriptions'),
            value: t('dashboard.stats.active', { count: 2 }),
            icon: (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            color: 'secondary' as const,
          },
          {
            title: t('dashboard.stats.testResults'),
            value: t('dashboard.stats.new', { count: 3 }),
            icon: (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            color: 'warning' as const,
          },
          {
            title: t('dashboard.stats.appointmentsThisYear'),
            value: '7',
            icon: (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            color: 'success' as const,
          },
        ]
      default:
        return [
          {
            title: t('dashboard.stats.patients'),
            value: '0',
            icon: (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            color: 'primary' as const,
          },
          {
            title: t('dashboard.stats.todaysAppointments'),
            value: '0',
            icon: (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            color: 'secondary' as const,
          },
          {
            title: t('dashboard.stats.pending'),
            value: '0',
            icon: (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            color: 'warning' as const,
          },
          {
            title: t('dashboard.stats.completed'),
            value: '0',
            icon: (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            color: 'success' as const,
          },
        ]
    }
  }

  const getRoleSpecificActions = () => {
    switch (userRole) {
      case 'ADMIN':
        return [
          {
            title: t('dashboard.quickActions.addPatient'),
            description: t('dashboard.quickActions.addPatientDesc'),
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            href: '/patients/new',
            color: 'primary' as const,
          },
          {
            title: t('dashboard.quickActions.schedule'),
            description: t('dashboard.quickActions.scheduleDesc'),
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            href: '/schedule',
            color: 'secondary' as const,
          },
          {
            title: t('dashboard.quickActions.reports'),
            description: t('dashboard.quickActions.reportsDesc'),
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            href: '/reports',
            color: 'warning' as const,
          },
          {
            title: t('dashboard.quickActions.users'),
            description: t('dashboard.quickActions.usersDesc'),
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            href: '/users',
            color: 'success' as const,
          },
        ]
      case 'DOCTOR':
        return [
          {
            title: t('dashboard.quickActions.newAppointment'),
            description: t('dashboard.quickActions.newAppointmentDesc'),
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            href: '/appointments/new',
            color: 'primary' as const,
          },
          {
            title: t('dashboard.quickActions.myPatientsList'),
            description: t('dashboard.quickActions.myPatientsListDesc'),
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            href: '/patients',
            color: 'secondary' as const,
          },
          {
            title: t('dashboard.quickActions.labResults'),
            description: t('dashboard.quickActions.labResultsDesc'),
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            href: '/lab-results',
            color: 'warning' as const,
          },
          {
            title: t('dashboard.quickActions.writePrescription'),
            description: t('dashboard.quickActions.writePrescriptionDesc'),
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            href: '/prescriptions/new',
            color: 'success' as const,
          },
        ]
      case 'PATIENT':
        return [
          {
            title: t('dashboard.quickActions.bookAppointment'),
            description: t('dashboard.quickActions.bookAppointmentDesc'),
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            href: '/appointments/new',
            color: 'primary' as const,
          },
          {
            title: t('dashboard.quickActions.myAppointments'),
            description: t('dashboard.quickActions.myAppointmentsDesc'),
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            href: '/appointments',
            color: 'secondary' as const,
          },
          {
            title: t('dashboard.quickActions.myTestResults'),
            description: t('dashboard.quickActions.myTestResultsDesc'),
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            href: '/lab-results',
            color: 'warning' as const,
          },
          {
            title: t('dashboard.quickActions.myPrescriptions'),
            description: t('dashboard.quickActions.myPrescriptionsDesc'),
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            href: '/prescriptions',
            color: 'success' as const,
          },
        ]
      default:
        return [
          {
            title: t('dashboard.quickActions.addPatient'),
            description: t('dashboard.quickActions.addPatientDesc'),
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            href: '/patients/new',
            color: 'primary' as const,
          },
          {
            title: t('dashboard.quickActions.newAppointment'),
            description: t('dashboard.quickActions.newAppointmentDesc'),
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            href: '/appointments/new',
            color: 'secondary' as const,
          },
          {
            title: t('dashboard.quickActions.viewPatients'),
            description: t('dashboard.quickActions.viewPatientsDesc'),
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            href: '/patients',
            color: 'warning' as const,
          },
          {
            title: t('dashboard.quickActions.settings'),
            description: t('dashboard.quickActions.settingsDesc'),
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
                <path
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ),
            href: '/settings',
            color: 'success' as const,
          },
        ]
    }
  }

  const stats = getRoleSpecificStats()
  const actions = getRoleSpecificActions()

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            {getWelcomeMessage()}, {user?.firstName || t('common.user')}!
          </h1>
          <p className="mt-1 text-neutral-600">{t('dashboard.welcome.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="md" variant="outline">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            {t('common.export')}
          </Button>
          <Button size="md" variant="primary">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            {t('common.quickAction')}
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">
          {t('dashboard.quickActions.title')}
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {actions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <Card variant="elevated">
        <Card.Header>
          <h2 className="text-lg font-semibold text-neutral-900">
            {t('dashboard.recentActivity.title')}
          </h2>
          <Button size="sm" variant="ghost">
            {t('common.seeAll')}
            <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </Button>
        </Card.Header>
        <Card.Body>
          <div className="py-12 text-center text-neutral-500">
            <svg
              className="mx-auto mb-4 h-16 w-16 text-neutral-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
              />
            </svg>
            <p>{t('common.noData')}</p>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default DashboardPage
