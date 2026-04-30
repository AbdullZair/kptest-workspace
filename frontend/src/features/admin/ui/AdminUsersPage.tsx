import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useGetAdminUsersQuery,
  useUpdateUserStatusMutation,
  useResetUserPasswordMutation,
  useDeleteUserMutation,
} from '../api/adminApi'
import { UserTable, CreateStaffModal } from '../components'
import type { UserAdmin, UserFilters, UserRole, AccountStatus } from '../types'
import { clsx } from 'clsx'

/**
 * AdminUsersPage Component
 *
 * Main page for user management in the admin panel
 */
export function AdminUsersPage() {
  const { t } = useTranslation()
  const [filters, setFilters] = useState<UserFilters>({
    page: 0,
    size: 20,
  })
  const [selectedUser, setSelectedUser] = useState<UserAdmin | null>(null)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCreateStaffModal, setShowCreateStaffModal] = useState(false)
  const [createStaffSuccess, setCreateStaffSuccess] = useState(false)

  const { data, isLoading, error, refetch } = useGetAdminUsersQuery(filters)
  const [updateUserStatus] = useUpdateUserStatusMutation()
  const [resetUserPassword] = useResetUserPasswordMutation()
  const [deleteUser] = useDeleteUserMutation()

  const [resetPasswordResult, setResetPasswordResult] = useState<{
    userId: string
    temporaryPassword: string
  } | null>(null)

  const handleSortChange = (_field: string, _order: 'asc' | 'desc') => {
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

  const _handleResetPassword = async (user: UserAdmin) => {
    setSelectedUser(user)
    setShowResetModal(true)
  }
  void _handleResetPassword

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

  const roles: (UserRole | 'ALL')[] = [
    'ALL',
    'ADMIN',
    'COORDINATOR',
    'DOCTOR',
    'THERAPIST',
    'NURSE',
    'PATIENT',
  ]
  const statuses: (AccountStatus | 'ALL')[] = [
    'ALL',
    'ACTIVE',
    'BLOCKED',
    'PENDING_VERIFICATION',
    'REJECTED',
    'DEACTIVATED',
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{t('admin.users.title')}</h1>
          <p className="mt-1 text-sm text-neutral-500">{t('admin.users.subtitle')}</p>
        </div>
        <button
          className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          data-testid="admin-add-staff-button"
          type="button"
          onClick={() => setShowCreateStaffModal(true)}
        >
          Dodaj pracownika
        </button>
      </div>

      {/* Create staff success banner */}
      {createStaffSuccess ? (
        <div
          className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800"
          data-testid="admin-create-staff-success"
          role="status"
        >
          Pracownik dodany
        </div>
      ) : null}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-700">{t('admin.users.role')}:</span>
          <div className="flex flex-wrap gap-1">
            {roles.map((role) => (
              <button
                key={role}
                className={clsx(
                  'rounded-full px-3 py-1 text-sm transition-colors',
                  filters.role === role || (role === 'ALL' && !filters.role)
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                )}
                onClick={() => handleRoleFilter(role)}
              >
                {role === 'ALL' ? t('admin.users.allRoles') : t(`roles.${role}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-700">{t('admin.users.status')}:</span>
          <div className="flex flex-wrap gap-1">
            {statuses.map((status) => (
              <button
                key={status}
                className={clsx(
                  'rounded-full px-3 py-1 text-sm transition-colors',
                  filters.status === status || (status === 'ALL' && !filters.status)
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                )}
                onClick={() => handleStatusFilter(status)}
              >
                {status === 'ALL' ? t('admin.users.all') : t(`accountStatus.${status}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User Table */}
      {error ? (
        <div className="py-12 text-center">
          <p className="text-red-600">{t('admin.users.errorLoading')}</p>
          <button
            className="mt-4 font-medium text-primary-600 hover:text-primary-700"
            onClick={() => refetch()}
          >
            {t('admin.users.retry')}
          </button>
        </div>
      ) : (
        <>
          <UserTable
            isLoading={isLoading}
            sortField="email"
            sortOrder="asc"
            users={data?.content || []}
            onDelete={handleDeleteUser}
            onEdit={handleEditUser}
            onSortChange={handleSortChange}
            onStatusChange={handleStatusChange}
            onUserClick={setSelectedUser}
          />

          {/* Pagination */}
          {data && data.totalPages > 1 ? (
            <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3">
              <div className="text-sm text-neutral-700">
                {t('admin.users.page')} {data.pageNumber + 1} {t('admin.users.of')}{' '}
                {data.totalPages} ({t('admin.users.users', { count: data.totalElements })})
              </div>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={data.isFirst}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: Math.max(0, prev.page! - 1) }))
                  }
                >
                  {t('admin.users.previous')}
                </button>
                <button
                  className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={data.isLast}
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))}
                >
                  {t('admin.users.next')}
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* Create Staff Modal */}
      <CreateStaffModal
        isOpen={showCreateStaffModal}
        onClose={() => setShowCreateStaffModal(false)}
        onSuccess={() => {
          setCreateStaffSuccess(true)
          refetch()
          window.setTimeout(() => setCreateStaffSuccess(false), 4000)
        }}
      />

      {/* Reset Password Modal */}
      {showResetModal && selectedUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-neutral-900">
                {t('admin.users.resetPassword.title')}
              </h3>
              <p className="mb-4 text-sm text-neutral-600">
                {t('admin.users.resetPassword.confirmText')} <strong>{selectedUser.email}</strong>?
              </p>
              <p className="mb-4 rounded bg-amber-50 p-3 text-sm text-amber-600">
                {t('admin.users.resetPassword.warning')}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  onClick={() => setShowResetModal(false)}
                >
                  {t('common.cancel')}
                </button>
                <button
                  className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                  onClick={confirmResetPassword}
                >
                  {t('admin.users.resetPassword.submit')}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-neutral-900">
                {t('admin.users.deleteUser.title')}
              </h3>
              <p className="mb-4 text-sm text-neutral-600">
                {t('admin.users.deleteUser.confirmText')} <strong>{selectedUser.email}</strong>?
              </p>
              <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
                {t('admin.users.deleteUser.warning')}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  onClick={() => setShowDeleteModal(false)}
                >
                  {t('common.cancel')}
                </button>
                <button
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  onClick={confirmDeleteUser}
                >
                  {t('admin.users.deleteUser.submit')}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Reset Password Result Modal */}
      {resetPasswordResult ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-green-600">
                {t('admin.users.passwordResetSuccess')}
              </h3>
              <p className="mb-4 text-sm text-neutral-600">{t('admin.users.tempPassword')}</p>
              <div className="mb-4 rounded-lg bg-neutral-100 p-4">
                <code className="font-mono text-lg text-neutral-900">
                  {resetPasswordResult.temporaryPassword}
                </code>
              </div>
              <p className="mb-4 rounded bg-amber-50 p-3 text-sm text-amber-600">
                {t('admin.users.tempPasswordWarning')}
              </p>
              <button
                className="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                onClick={() => setResetPasswordResult(null)}
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default AdminUsersPage
