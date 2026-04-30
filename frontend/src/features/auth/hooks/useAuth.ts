import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@app/store'
import {
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
  selectRequires2FA,
  selectLoginSessionId,
  logout as logoutAction,
  clearError,
  setRequires2FA as setRequires2FAAction,
  clear2FAState,
  setTokens,
} from '../slices/authSlice'
import {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useVerify2faMutation,
  useEnable2faMutation,
  useConfirm2faMutation,
  useDisable2faMutation,
  useRefreshTokenMutation,
} from '../api/authApi'
import { AUTH_STORAGE_KEYS } from '../lib/auth.types'
import type { LoginRequest, RegisterRequest } from '../lib/auth.types'

/**
 * Token storage utilities
 */
const tokenStorage = {
  /**
   * Save tokens to localStorage
   */
  saveTokens: (
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    rememberMe?: boolean
  ) => {
    const expiresAt = Date.now() + expiresIn * 1000
    localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken)
    localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRY, expiresAt.toString())

    if (rememberMe) {
      localStorage.setItem('auth_remember_me', 'true')
    }
  },

  /**
   * Get access token from localStorage
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
  },

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken: (): string | null => {
    return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
  },

  /**
   * Get token expiry timestamp
   */
  getTokenExpiry: (): number | null => {
    const expiry = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRY)
    return expiry ? parseInt(expiry, 10) : null
  },

  /**
   * Check if access token is expired
   */
  isTokenExpired: (): boolean => {
    const expiry = tokenStorage.getTokenExpiry()
    if (!expiry) return true
    // Consider token expired 30 seconds before actual expiry
    return Date.now() >= expiry - 30000
  },

  /**
   * Check if refresh token is expired
   */
  isRefreshTokenExpired: (): boolean => {
    const expiry = tokenStorage.getTokenExpiry()
    if (!expiry) return true
    return Date.now() >= expiry
  },

  /**
   * Clear all tokens from localStorage
   */
  clearTokens: () => {
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRY)
    localStorage.removeItem('auth_remember_me')
  },
}

/**
 * useAuth Hook
 * Centralized hook for authentication operations
 *
 * @example
 * ```tsx
 * const { user, isAuthenticated, login, logout } = useAuth()
 *
 * const handleLogin = async (credentials) => {
 *   const result = await login(credentials)
 *   if (result.success) {
 *     navigate('/dashboard')
 *   }
 * }
 * ```
 */
export const useAuth = () => {
  const dispatch = useAppDispatch()

  // State from Redux
  const user = useAppSelector(selectUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isLoading = useAppSelector(selectIsLoading)
  const error = useAppSelector(selectAuthError)
  const requires2FA = useAppSelector(selectRequires2FA)
  const loginSessionId = useAppSelector(selectLoginSessionId)

  // RTK Query mutations and queries
  const [loginMutation, loginResult] = useLoginMutation()
  const [registerMutation, registerResult] = useRegisterMutation()
  const [logoutMutation] = useLogoutMutation()
  const { refetch: refetchUser } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated,
  })
  const [verify2faMutation] = useVerify2faMutation()
  const [enable2faMutation] = useEnable2faMutation()
  const [confirm2faMutation] = useConfirm2faMutation()
  const [disable2faMutation] = useDisable2faMutation()
  const [refreshTokenMutation] = useRefreshTokenMutation()

  /**
   * Login user with credentials
   * Handles 2FA flow if enabled
   */
  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        const result = await loginMutation(credentials).unwrap()

        // Check if 2FA is required
        if (result.requires2FA) {
          dispatch(setRequires2FAAction({ requires2FA: true, sessionId: '' }))
          return {
            success: false,
            requires2FA: true,
            message: 'Two-factor authentication required',
          }
        }

        // Store tokens in localStorage
        if (result.tokens) {
          tokenStorage.saveTokens(
            result.tokens.accessToken,
            result.tokens.refreshToken,
            result.tokens.expiresIn,
            credentials.rememberMe
          )
        }

        // Fetch current user after successful login
        await refetchUser()

        return { success: true, data: result }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Login failed',
        }
      }
    },
    [loginMutation, dispatch, refetchUser]
  )

  /**
   * Verify 2FA code after login
   */
  const verify2FA = useCallback(
    async (code: string) => {
      if (!loginSessionId) {
        return {
          success: false,
          error: 'No active login session',
        }
      }

      try {
        const result = await verify2faMutation({ sessionId: loginSessionId, code }).unwrap()

        // Store tokens in localStorage
        if (result.tokens) {
          tokenStorage.saveTokens(
            result.tokens.accessToken,
            result.tokens.refreshToken,
            result.tokens.expiresIn
          )
        }

        dispatch(clear2FAState())

        return { success: true, data: result }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Invalid 2FA code',
        }
      }
    },
    [verify2faMutation, loginSessionId, dispatch]
  )

  /**
   * Register new user
   */
  const register = useCallback(
    async (data: RegisterRequest) => {
      try {
        const result = await registerMutation(data).unwrap()

        // Store tokens in localStorage
        if (result.tokens) {
          tokenStorage.saveTokens(
            result.tokens.accessToken,
            result.tokens.refreshToken,
            result.tokens.expiresIn
          )
        }

        return { success: true, data: result }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Registration failed',
        }
      }
    },
    [registerMutation]
  )

  /**
   * Logout user
   * Clears tokens from localStorage and Redux state
   */
  const logout = useCallback(async () => {
    try {
      const refreshToken = tokenStorage.getRefreshToken()
      const logoutBody: { refreshToken?: string } = {}
      if (refreshToken) {
        logoutBody.refreshToken = refreshToken
      }
      await logoutMutation(logoutBody).unwrap()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Always clear tokens and state
      tokenStorage.clearTokens()
      dispatch(logoutAction())
    }
  }, [logoutMutation, dispatch])

  /**
   * Enable 2FA for current user
   * Returns QR code URL and backup codes
   */
  const enable2FA = useCallback(async () => {
    try {
      const result = await enable2faMutation({ enabled: true }).unwrap()
      return { success: true, data: result }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to enable 2FA',
      }
    }
  }, [enable2faMutation])

  /**
   * Confirm 2FA setup with verification code
   */
  const confirm2FA = useCallback(
    async (code: string) => {
      try {
        const result = await confirm2faMutation({ code }).unwrap()
        return { success: true, data: result }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Invalid verification code',
        }
      }
    },
    [confirm2faMutation]
  )

  /**
   * Disable 2FA for current user
   */
  const disable2FA = useCallback(
    async (code: string) => {
      try {
        const result = await disable2faMutation({ code }).unwrap()
        return { success: true, data: result }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to disable 2FA',
        }
      }
    },
    [disable2faMutation]
  )

  /**
   * Refresh access token
   * Called automatically by interceptor when token is expired
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    const refreshTkn = tokenStorage.getRefreshToken()

    if (!refreshTkn) {
      return false
    }

    try {
      const result = await refreshTokenMutation().unwrap()

      // Save new tokens
      tokenStorage.saveTokens(
        result.accessToken,
        result.refreshToken ?? refreshTkn,
        result.expiresIn
      )

      // Update Redux state
      dispatch(setTokens(result))

      return true
    } catch (err) {
      console.error('Token refresh failed:', err)
      // Clear auth on refresh failure
      tokenStorage.clearTokens()
      dispatch(logoutAction())
      return false
    }
  }, [refreshTokenMutation, dispatch])

  /**
   * Clear error state
   */
  const clearAuthError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  /**
   * Check if user needs to re-authenticate
   */
  const needsReauthentication = useCallback(() => {
    return !tokenStorage.getRefreshToken() || tokenStorage.isRefreshTokenExpired()
  }, [])

  /**
   * Stub for password reset request — backend endpoint not yet wired.
   * Returns a Promise<{ success: boolean; error?: string }>.
   */
  const requestPasswordReset = useCallback(async (_email: string) => {
    return { success: true as const }
  }, [])

  /**
   * Stub for password reset confirmation — backend endpoint not yet wired.
   */
  const resetPassword = useCallback(async (_token: string, _newPassword: string) => {
    return { success: true as const }
  }, [])

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    requires2FA,
    loginSessionId,

    // Actions
    login,
    verify2FA,
    // Alias (older callsites use camelCase verifyTwoFa)
    verifyTwoFa: verify2FA,
    register,
    logout,
    refetchUser,
    enable2FA,
    confirm2FA,
    disable2FA,
    refreshToken,
    clearAuthError,
    // Alias (older callsites use clearAuth)
    clearAuth: clearAuthError,
    needsReauthentication,
    requestPasswordReset,
    resetPassword,

    // Token storage utilities (exposed for interceptor)
    tokenStorage,

    // Mutation results
    loginResult,
    registerResult,
  }
}

/**
 * Export token storage for use in interceptors
 */
export { tokenStorage }

export default useAuth
