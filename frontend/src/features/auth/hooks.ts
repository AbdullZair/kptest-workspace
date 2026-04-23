/**
 * Auth Hooks Barrel Export
 * All authentication-related hooks in one place
 */

// Typed Redux hooks
export { useAppDispatch, useAppSelector } from '@app/store'
export type { RootState, AppDispatch } from '@app/store'

// Main auth hook
export { useAuth, tokenStorage } from './hooks/useAuth'
export type { AuthHookReturn } from './types'

// RTK Query hooks
export {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  useVerify2faMutation,
  useEnable2faMutation,
  useConfirm2faMutation,
  useDisable2faMutation,
  useRefreshTokenMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useResendVerificationEmailMutation,
  useVerifyEmailMutation,
} from './api/authApi'

// Selector hooks
export {
  selectUser,
  selectTokens,
  selectIsAuthenticated,
  selectIsLoading,
  selectIsRefreshing,
  selectAuthError,
  selectRequires2FA,
  selectLoginSessionId,
  selectIs2FAEnabled,
} from './slices/authSlice'
