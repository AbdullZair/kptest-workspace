import { useState, useMemo } from 'react'
import {
  useGetAdminUsersQuery,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useResetUserPasswordMutation,
  useDeleteUserMutation,
} from '../api/adminApi'
import { UserTable, UserRoleBadge, LogViewer } from '../components'
import type { UserAdmin, UserFilters, UserRole, AccountStatus } from '../types'
import { clsx } from 'clsx'

/**
 * AdminUsersPage Component
 *
 * Main page for user management in the admin panel
 */
export function AdminUsersPage() {
  const [filters, setFilters] = useState<UserFilters>({
    page: 0,
    size: 20,
  })
  const [selectedUser, setSelectedUser] = useState<UserAdmin | null>(null)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data, isLoading, error, refetch } = useGetAdminUsersQuery(filters)
  const [updateUserRole] = useUpdateUserRoleMutation()
  const [updateUserStatus] = useUpdateUserStatusMutation()
  const [resetUserPassword] = useResetUserPasswordMutation()
  const [deleteUser] = useDeleteUserMutation()

  const [resetPasswordResult, setResetPasswordResult] = useState<{
    userId: string
    temporaryPassword: string
  } | null>(null)

  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    setFilters((prev) => ({ ...prev, page: 0 }))
  }

  const handleRoleFilter = (role: UserRole | 'ALL') => {
    setFilters((prev) => ({
      ...prev,
      role: role === 'ALL' ? undefined : role,
      page: 0,
    }))
  }

  const handleStatusFilter = (status: AccountStatus | 'ALL') => {
    setFilters((prev) => ({
      ...prev,
      status: status === 'ALL' ? undefined : status,
      page: 0,
    }))
  }

  const handleStatusChange = async (userId: string, newStatus: AccountStatus) => {
    try {
      await updateUserStatus({ userId, body: { new_status: newStatus } }).unwrap()
    } catch (error) {
      console.error('Failed to update user status:', error)
    }
  }

  const handleEditUser = (user: UserAdmin) => {
    setSelectedUser(user)
  }

  const handleDeleteUser = (user: UserAdmin) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const handleResetPassword = async (user: UserAdmin) => {
    setSelectedUser(user)
    setShowResetModal(true)
  }

  const confirmResetPassword = async () => {
    if (!selectedUser) return

    try {
      const result = await resetUserPassword(selectedUser.user_id).unwrap()
      setResetPasswordResult({
        userId: selectedUser.user_id,
        temporaryPassword: result.temporary_password,
      })
      setShowResetModal(false)
    } catch (error) {
      console.error('Failed to reset password:', error)
    }
  }

  const confirmDeleteUser = async () => {
    if (!selectedUser) return

    try {
      await deleteUser(selectedUser.user_id).unwrap()
      setShowDeleteModal(false)
      setSelectedUser(null)
      refetch()
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  const roles: (UserRole | 'ALL')[] = ['ALL', 'ADMIN', 'COORDINATOR', 'DOCTOR', 'THERAPIST', 'NURSE', 'PATIENT']
  const statuses: (AccountStatus | 'ALL')[] = ['ALL', 'ACTIVE', 'BLOCKED', 'PENDING_VERIFICATION', 'REJECTED', 'DEACTIVATED']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Zarządzanie użytkownikami</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Przeglądaj i zarządzaj wszystkimi użytkownikami systemu
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-700">Rola:</span>
          <div className="flex flex-wrap gap-1">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => handleRoleFilter(role)}
                className={clsx(
                  'px-3 py-1 text-sm rounded-full transition-colors',
                  filters.role === role || (role === 'ALL' && !filters.role)
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                )}
              >
                {role === 'ALL' ? 'Wszystkie' : role}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-700">Status:</span>
          <div className="flex flex-wrap gap-1">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={clsx(
                  'px-3 py-1 text-sm rounded-full transition-colors',
                  filters.status === status || (status === 'ALL' && !filters.status)
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                )}
              >
                {status === 'ALL' ? 'Wszystkie' : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User Table */}
      {error ? (
        <div className="text-center py-12">
          <p className="text-red-600">Wystąpił błąd podczas ładowania użytkowników</p>
          <button
            onClick={() => refetch()}
            className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
          >
            Spróbuj ponownie
          </button>
        </div>
      ) : (
        <>
          <UserTable
            users={data?.content || []}
            isLoading={isLoading}
            onUserClick={setSelectedUser}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onStatusChange={handleStatusChange}
            sortField="email"
            sortOrder="asc"
            onSortChange={handleSortChange}
          />

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-white border border-neutral-200 rounded-lg">
              <div className="text-sm text-neutral-700">
                Strona {data.pageNumber + 1} z {data.totalPages} ({data.totalElements} użytkowników)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(0, prev.page! - 1) }))}
                  disabled={data.isFirst}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Poprzednia
                </button>
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))}
                  disabled={data.isLast}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Następna
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Reset Password Modal */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Resetowanie hasła
              </h3>
              <p className="text-sm text-neutral-600 mb-4">
                Czy na pewno chcesz zresetować hasło dla użytkownika <strong>{selectedUser.email}</strong>?
              </p>
              <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded mb-4">
                Nowe tymczasowe hasło zostanie wygenerowane i wyświetlone po potwierdzeniu.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50"
                >
                  Anuluj
                </button>
                <button
                  onClick={confirmResetPassword}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
                  Resetuj hasło
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Usuwanie użytkownika
              </h3>
              <p className="text-sm text-neutral-600 mb-4">
                Czy na pewno chcesz usunąć użytkownika <strong>{selectedUser.email}</strong>?
              </p>
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded mb-4">
                Ta operacja jest nieodwracalna. Użytkownik zostanie trwale usunięty z systemu.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50"
                >
                  Anuluj
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Usuń
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Result Modal */}
      {resetPasswordResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-green-600 mb-4">
                Hasło zostało zresetowane
              </h3>
              <p className="text-sm text-neutral-600 mb-4">
                Tymczasowe hasło dla użytkownika:
              </p>
              <div className="bg-neutral-100 p-4 rounded-lg mb-4">
                <code className="text-lg font-mono text-neutral-900">
                  {resetPasswordResult.temporaryPassword}
                </code>
              </div>
              <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded mb-4">
                Przekaż to hasło użytkownikowi. Zalecane jest natychmiastowe zmienienie hasła po zalogowaniu.
              </p>
              <button
                onClick={() => setResetPasswordResult(null)}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsersPage
