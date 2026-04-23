// Shared hooks barrel export
export { useDebounce } from './useDebounce'
export { useLocalStorage } from './useLocalStorage'
export { useMediaQuery, useIsMobile, useIsDarkMode, useIsReducedMotion } from './useMediaQuery'

// Auth hooks (re-exported for convenience)
export { useAuth, tokenStorage } from '@features/auth/hooks/useAuth'

// Typed Redux hooks
export type { RootState, AppDispatch } from '@app/store'
export { useAppDispatch, useAppSelector } from '@app/store'

// Auth query hooks
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
} from '@features/auth/api/authApi'
