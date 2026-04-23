// Auth feature barrel export

// API
export { authApiSlice as authApi } from './api/authApi'

// Hooks
export { useAuth, tokenStorage } from './hooks/useAuth'
export * from './hooks'

// Slice
export {
  logout,
  clearError,
  setTokens,
  setRequires2FA,
  clear2FAState,
  setRefreshing,
  updateUser,
  selectUser,
  selectTokens,
  selectIsAuthenticated,
  selectIsLoading,
  selectIsRefreshing,
  selectAuthError,
  selectRequires2FA,
  selectLoginSessionId,
  selectIs2FAEnabled,
  authReducer,
} from './slices/authSlice'

// Types
export type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  Verify2FARequest,
  Verify2FAResponse,
  Enable2FARequest,
  Enable2FAResponse,
  Confirm2FARequest,
  Confirm2FAResponse,
  AuthTokens,
  LogoutRequest,
  LogoutResponse,
  AuthApiError,
  AuthError,
  AuthErrorCode,
  LoginResult,
  Verify2FAResult,
  RegisterResult,
  Enable2FAResult,
  Confirm2FAResult,
  Disable2FAResult,
  AuthHookReturn,
} from './types'

export { AUTH_STORAGE_KEYS, AUTH_ERROR_CODES } from './types'

// Form schemas
export {
  loginSchema,
  registerSchema,
  passwordResetSchema,
  newPasswordSchema,
  changePasswordSchema,
  twoFaSchema,
} from './types/schemas'

export type {
  LoginFormData,
  RegisterFormData,
  PasswordResetFormData,
  NewPasswordFormData,
  ChangePasswordFormData,
  TwoFaFormData,
} from './types/schemas'
