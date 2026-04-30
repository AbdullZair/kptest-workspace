import { Link } from 'react-router-dom'
import { Card } from '@shared/components'
import { clsx } from 'clsx'

/**
 * Admin dashboard card props
 */
interface AdminCardProps {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: 'primary' | 'secondary' | 'warning' | 'success' | 'danger'
  badge?: string
}

/**
 * AdminCard Component
 */
const AdminCard: React.FC<AdminCardProps> = ({ title, description, icon, href, color, badge }) => {
  const colorStyles = {
    primary: 'bg-primary-50 hover:bg-primary-100 border-primary-200',
    secondary: 'bg-secondary-50 hover:bg-secondary-100 border-secondary-200',
    warning: 'bg-warning-50 hover:bg-warning-100 border-warning-200',
    success: 'bg-success-50 hover:bg-success-100 border-success-200',
    danger: 'bg-error-50 hover:bg-error-100 border-error-200',
  }

  const iconColorStyles = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    warning: 'text-warning-600',
    success: 'text-success-600',
    danger: 'text-error-600',
  }

  return (
    <Link
      to={href}
      className={clsx(
        'block rounded-xl border p-6 transition-all duration-200',
        colorStyles[color],
        'hover:-translate-y-1 hover:shadow-lg'
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={clsx(
            'flex h-12 w-12 items-center justify-center rounded-xl',
            iconColorStyles[color]
          )}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
            {badge ? (
              <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                {badge}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-neutral-600">{description}</p>
        </div>
        <svg
          className="h-5 w-5 text-neutral-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}

/**
 * AdminDashboard Component
 *
 * Main admin dashboard with navigation to all admin subpages
 */
export const AdminDashboard = () => {
  const adminCards: AdminCardProps[] = [
    {
      title: 'Zarządzanie użytkownikami',
      description: 'Przeglądaj, edytuj i zarządzaj kontami użytkowników systemu',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      href: '/admin/users',
      color: 'primary',
    },
    {
      title: 'Przegląd dostępu personelu',
      description: 'Periodyczny przegląd uprawnień i nieaktywnych kont (US-A-04)',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      href: '/admin/access-review',
      color: 'warning',
    },
    {
      title: 'Audit Logs',
      description: 'Przeglądaj logi audytowe wszystkich operacji w systemie',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      href: '/admin/audit-logs',
      color: 'secondary',
    },
    {
      title: 'Monitoring systemu',
      description: 'Status serwerów, wykorzystanie zasobów i health check',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      href: '/admin/system',
      color: 'success',
    },
    {
      title: 'Logi systemowe',
      description: 'Szczegółowe logi aplikacyjne i błędy systemu',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
      href: '/admin/system/logs',
      color: 'warning',
    },
    {
      title: 'Backupy',
      description: 'Zarządzanie kopiami zapasowymi i przywracanie danych',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
          />
        </svg>
      ),
      href: '/admin/backups',
      color: 'primary',
    },
    {
      title: 'Konfiguracja systemu',
      description: 'Ustawienia globalne, polityki haseł i powiadomień',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      href: '/admin/settings',
      color: 'secondary',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Panel Administratora</h1>
        <p className="mt-1 text-neutral-600">
          Zarządzaj użytkownikami, monitoruj system i przeglądaj logi audytowe
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          title="Użytkownicy"
          value="2,543"
          trend="+12%"
          trendPositive={true}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        />
        <StatCard
          title="Logi dzisiaj"
          value="15,234"
          trend="+8%"
          trendPositive={true}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        />
        <StatCard
          title="Status systemu"
          value="99.9%"
          trend="-0.1%"
          trendPositive={false}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          isStatus={true}
        />
        <StatCard
          title="Ostatni backup"
          value="2h temu"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          }
        />
      </div>

      {/* Admin Cards */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">Zarządzanie systemem</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {adminCards.map((card) => (
            <AdminCard key={card.href} {...card} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card variant="elevated">
        <div className="flex items-center justify-between border-b border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Ostatnia aktywność administratorów
          </h2>
          <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
            Zobacz wszystkie
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b border-neutral-100 py-3 last:border-0"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                  <svg
                    className="h-5 w-5 text-primary-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">
                    Administrator {i} zmienił status użytkownika
                  </p>
                  <p className="text-xs text-neutral-500">{i * 2}h temu</p>
                </div>
                <span className="text-xs text-neutral-500">Audit Log</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

/**
 * StatCard Component
 */
interface StatCardProps {
  title: string
  value: string
  trend?: string
  trendPositive?: boolean
  icon: React.ReactNode
  isStatus?: boolean
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  trendPositive,
  icon,
  isStatus,
}) => {
  return (
    <Card variant="elevated" className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600">{title}</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">{value}</p>
          {trend ? (
            <div className="mt-2 flex items-center gap-1">
              <svg
                className={clsx('h-3 w-3', trendPositive ? 'text-success-600' : 'text-error-600')}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {trendPositive ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                  />
                )}
              </svg>
              <span
                className={clsx(
                  'text-xs font-medium',
                  trendPositive ? 'text-success-600' : 'text-error-600'
                )}
              >
                {trend}
              </span>
              <span className="text-xs text-neutral-500">vs ostatni tydzień</span>
            </div>
          ) : null}
          {isStatus ? (
            <div className="mt-2">
              <span className="inline-flex items-center rounded-full bg-success-100 px-2 py-1 text-xs font-medium text-success-700">
                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-success-600" />
                Działający
              </span>
            </div>
          ) : null}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
          {icon}
        </div>
      </div>
    </Card>
  )
}

export default AdminDashboard
