import { useMemo, useState } from 'react'
import {
  useGetAdminUsersQuery,
  useGetAuditLogsQuery,
  useUpdateUserStatusMutation,
} from '../api/adminApi'
import type { UserAdmin, UserFilters, UserRole } from '../types'
import { clsx } from 'clsx'
import { UserRoleBadge } from '../components'

/**
 * Inactivity threshold for the access review (US-A-04).
 * Accounts whose last_login_at is older than this are flagged as INACTIVE
 * and become candidates for deactivation.
 */
const INACTIVITY_DAYS = 90
const INACTIVITY_MS = INACTIVITY_DAYS * 24 * 60 * 60 * 1000

/**
 * All staff roles eligible for the access review filter.
 */
const REVIEWABLE_ROLES: ReadonlyArray<UserRole | 'ALL'> = [
  'ALL',
  'ADMIN',
  'COORDINATOR',
  'DOCTOR',
  'THERAPIST',
  'NURSE',
] as const

/**
 * Compute whether a user counts as "inactive" for access review purposes.
 */
const isInactive = (user: UserAdmin): boolean => {
  if (!user.last_login_at) return true
  const last = new Date(user.last_login_at).getTime()
  if (Number.isNaN(last)) return true
  return Date.now() - last > INACTIVITY_MS
}

/**
 * Format last login as a friendly Polish relative date or "Nigdy".
 */
const formatLastLogin = (iso?: string): string => {
  if (!iso) return 'Nigdy'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('pl-PL')
}

/**
 * AdminAccessReviewPage Component (US-A-04)
 *
 * Admin-facing periodic review of staff accounts: who has which role and
 * when they last logged in. Flags inactive accounts (>90 days since last
 * login) and lets the admin drill into recent audit logs or deactivate the
 * account directly.
 */
export function AdminAccessReviewPage() {
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL')
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)
  const [deactivateError, setDeactivateError] = useState<string | null>(null)

  const filters: UserFilters = useMemo(
    () => ({
      role: roleFilter === 'ALL' ? undefined : roleFilter,
      page: 0,
      size: 100,
    }),
    [roleFilter]
  )

  const { data, isLoading, error, refetch } = useGetAdminUsersQuery(filters)
  const [updateUserStatus, { isLoading: isDeactivating }] = useUpdateUserStatusMutation()

  /**
   * Sorted list: most-recent login first; "never logged in" goes last.
   */
  const sortedUsers = useMemo<UserAdmin[]>(() => {
    if (!data?.content) return []
    return [...data.content].sort((a, b) => {
      const aT = a.last_login_at ? new Date(a.last_login_at).getTime() : 0
      const bT = b.last_login_at ? new Date(b.last_login_at).getTime() : 0
      return bT - aT
    })
  }, [data])

  const handleDeactivate = async (user: UserAdmin) => {
    setDeactivateError(null)
    try {
      await updateUserStatus({
        userId: user.user_id,
        body: { new_status: 'DEACTIVATED' },
      }).unwrap()
      refetch()
    } catch (e) {
      const message =
        typeof e === 'object' && e && 'data' in e
          ? `Nie udało się wyłączyć konta: ${JSON.stringify((e as { data: unknown }).data)}`
          : 'Nie udało się wyłączyć konta'
      setDeactivateError(message)
    }
  }

  return (
    <div className="space-y-6" data-testid="admin-access-review-page">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Przegląd dostępu personelu</h1>
        <p className="mt-1 text-sm text-neutral-500">
          US-A-04: Sprawdź kto ma jakie uprawnienia i kiedy ostatnio się logował. Konta nieaktywne
          przez ponad {INACTIVITY_DAYS} dni są oznaczone jako nieaktywne i mogą zostać wyłączone.
        </p>
      </div>

      {/* Role filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-neutral-700">Rola:</span>
        {REVIEWABLE_ROLES.map((role) => (
          <button
            type="button"
            key={role}
            onClick={() => setRoleFilter(role)}
            className={clsx(
              'rounded-full px-3 py-1 text-sm transition-colors',
              roleFilter === role
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            )}
            data-testid={`access-review-role-${role}`}
          >
            {role === 'ALL' ? 'Wszystkie' : role}
          </button>
        ))}
      </div>

      {deactivateError ? (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {deactivateError}
        </div>
      ) : null}

      {error ? (
        <div className="py-12 text-center">
          <p className="text-red-600">Nie udało się załadować listy użytkowników</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 font-medium text-primary-600 hover:text-primary-700"
          >
            Spróbuj ponownie
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Rola
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Ostatnie logowanie
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Stan
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-neutral-500">
                    Ładowanie...
                  </td>
                </tr>
              ) : sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-neutral-500">
                    Brak użytkowników do przeglądu
                  </td>
                </tr>
              ) : (
                sortedUsers.map((user) => {
                  const inactive = isInactive(user)
                  const expanded = expandedUserId === user.user_id
                  return (
                    <AccessReviewRow
                      key={user.user_id}
                      user={user}
                      inactive={inactive}
                      expanded={expanded}
                      isDeactivating={isDeactivating}
                      onToggle={() =>
                        setExpandedUserId((prev) => (prev === user.user_id ? null : user.user_id))
                      }
                      onDeactivate={() => handleDeactivate(user)}
                    />
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

interface AccessReviewRowProps {
  user: UserAdmin
  inactive: boolean
  expanded: boolean
  isDeactivating: boolean
  onToggle: () => void
  onDeactivate: () => void
}

/**
 * Single row in the access-review table. Renders the user summary plus an
 * inline expandable panel with the latest 10 audit logs scoped to that user.
 */
const AccessReviewRow: React.FC<AccessReviewRowProps> = ({
  user,
  inactive,
  expanded,
  isDeactivating,
  onToggle,
  onDeactivate,
}) => {
  const canDeactivate = inactive && user.status !== 'DEACTIVATED'

  return (
    <>
      <tr
        className={clsx('cursor-pointer hover:bg-neutral-50', expanded && 'bg-primary-50/40')}
        onClick={onToggle}
        data-testid={`access-review-row-${user.user_id}`}
      >
        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-neutral-900">
          {user.email}
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-sm">
          <UserRoleBadge role={user.role} />
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-700">
          {formatLastLogin(user.last_login_at)}
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-sm">
          <span
            className={clsx(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              inactive
                ? 'bg-amber-100 text-amber-800'
                : 'bg-green-100 text-green-800'
            )}
            data-testid={`access-review-status-${user.user_id}`}
          >
            {inactive ? 'INACTIVE' : 'DOTACTIVE'}
          </span>
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
          {canDeactivate ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDeactivate()
              }}
              disabled={isDeactivating}
              className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
              data-testid={`access-review-deactivate-${user.user_id}`}
            >
              {isDeactivating ? 'Wyłączanie...' : 'Wyłącz konto'}
            </button>
          ) : (
            <span className="text-xs text-neutral-400">—</span>
          )}
        </td>
      </tr>
      {expanded ? (
        <tr>
          <td colSpan={5} className="bg-neutral-50 px-4 py-4">
            <UserAuditLogPreview userId={user.user_id} />
          </td>
        </tr>
      ) : null}
    </>
  )
}

interface UserAuditLogPreviewProps {
  userId: string
}

/**
 * Inline component that loads the latest 10 audit log entries for a given
 * user (US-A-04 drilldown). Kept small and dedicated so it only fires the
 * /admin/audit-logs query when the row is actually expanded.
 */
const UserAuditLogPreview: React.FC<UserAuditLogPreviewProps> = ({ userId }) => {
  const { data, isLoading, error } = useGetAuditLogsQuery({
    user_id: userId,
    page: 0,
    size: 10,
  })

  if (isLoading) {
    return <p className="text-sm text-neutral-500">Ładowanie historii audytu...</p>
  }
  if (error) {
    return <p className="text-sm text-red-600">Nie udało się pobrać logów audytu</p>
  }
  if (!data || data.content.length === 0) {
    return <p className="text-sm text-neutral-500">Brak wpisów audytu dla tego użytkownika</p>
  }

  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-neutral-700">
        Ostatnie 10 wpisów audytu
      </h4>
      <ul className="space-y-1 text-sm">
        {data.content.map((entry) => (
          <li
            key={entry.log_id}
            className="flex items-center justify-between rounded border border-neutral-200 bg-white px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                {entry.action}
              </span>
              <span className="text-neutral-700">{entry.entity_type}</span>
              {entry.entity_id ? (
                <span className="font-mono text-xs text-neutral-500">{entry.entity_id}</span>
              ) : null}
            </div>
            <span className="text-xs text-neutral-500">
              {new Date(entry.created_at).toLocaleString('pl-PL')}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AdminAccessReviewPage
