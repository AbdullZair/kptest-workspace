import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthTokens, AuthUser } from '../lib/auth.types'
import { authApiSlice } from '../api/authApi'

/**
 * Auth state interface
 */
export interface AuthState {
  user: AuthUser | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  requires2FA: boolean
  loginSessionId: string | null
}

/**
 * Initial auth state
 */
const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  isRefreshing: false,
  error: null,
  requires2FA: false,
  loginSessionId: null,
}

/**
 * Auth slice
 * Manages authentication state in Redux store
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Clear auth state on logout
     */
    logout: (state) => {
      state.user = null
      state.tokens = null
      state.isAuthenticated = false
      state.error = null
      state.requires2FA = false
      state.loginSessionId = null
    },

    /**
     * Clear error state
     */
    clearError: (state) => {
      state.error = null
    },

    /**
     * Set tokens manually (used for token refresh)
     */
    setTokens: (state, action: PayloadAction<AuthTokens>) => {
      state.tokens = action.payload
    },

    /**
     * Set 2FA required state
     */
    setRequires2FA: (state, action: PayloadAction<{ requires2FA: boolean; sessionId: string }>) => {
      state.requires2FA = action.payload.requires2FA
      state.loginSessionId = action.payload.sessionId
    },

    /**
     * Clear 2FA state after successful verification
     */
    clear2FAState: (state) => {
      state.requires2FA = false
      state.loginSessionId = null
    },

    /**
     * Set refreshing state
     */
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.isRefreshing = action.payload
    },

    /**
     * Update user data (used after profile update)
     */
    updateUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // ==================== LOGIN ====================
      .addMatcher(authApiSlice.endpoints.login.matchPending, (state) => {
        state.isLoading = true
        state.error = null
        state.requires2FA = false
        state.loginSessionId = null
      })
      .addMatcher(authApiSlice.endpoints.login.matchFulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.tokens = action.payload.tokens
        state.error = null
        state.requires2FA = action.payload.requires2FA ?? false
      })
      .addMatcher(authApiSlice.endpoints.login.matchRejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Login failed'
      })

      // ==================== REGISTER ====================
      .addMatcher(authApiSlice.endpoints.register.matchPending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addMatcher(authApiSlice.endpoints.register.matchFulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.tokens = action.payload.tokens
        state.error = null
      })
      .addMatcher(authApiSlice.endpoints.register.matchRejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Registration failed'
      })

      // ==================== VERIFY 2FA ====================
      .addMatcher(authApiSlice.endpoints.verify2fa.matchPending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addMatcher(authApiSlice.endpoints.verify2fa.matchFulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.tokens = action.payload.tokens
        state.requires2FA = false
        state.loginSessionId = null
        state.error = null
      })
      .addMatcher(authApiSlice.endpoints.verify2fa.matchRejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Invalid 2FA code'
      })

      // ==================== LOGOUT ====================
      .addMatcher(authApiSlice.endpoints.logout.matchFulfilled, (state) => {
        state.user = null
        state.tokens = null
        state.isAuthenticated = false
        state.error = null
        state.requires2FA = false
        state.loginSessionId = null
      })

      // ==================== GET CURRENT USER ====================
      .addMatcher(authApiSlice.endpoints.getCurrentUser.matchPending, (state) => {
        state.isLoading = true
      })
      .addMatcher(authApiSlice.endpoints.getCurrentUser.matchFulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload as AuthUser
        state.isAuthenticated = true
      })
      .addMatcher(authApiSlice.endpoints.getCurrentUser.matchRejected, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.tokens = null
      })

      // ==================== REFRESH TOKEN ====================
      .addMatcher(authApiSlice.endpoints.refreshToken.matchPending, (state) => {
        state.isRefreshing = true
      })
      .addMatcher(authApiSlice.endpoints.refreshToken.matchFulfilled, (state, action) => {
        state.isRefreshing = false
        state.tokens = action.payload
      })
      .addMatcher(authApiSlice.endpoints.refreshToken.matchRejected, (state) => {
        state.isRefreshing = false
        state.isAuthenticated = false
        state.user = null
        state.tokens = null
      })

      // ==================== ENABLE 2FA ====================
      .addMatcher(authApiSlice.endpoints.enable2fa.matchFulfilled, (state) => {
        if (state.user) {
          state.user.is2FAEnabled = true
        }
      })

      // ==================== DISABLE 2FA ====================
      .addMatcher(authApiSlice.endpoints.disable2fa.matchFulfilled, (state) => {
        if (state.user) {
          state.user.is2FAEnabled = false
        }
      })
  },
})

/**
 * Actions
 */
export const {
  logout,
  clearError,
  setTokens,
  setRequires2FA,
  clear2FAState,
  setRefreshing,
  updateUser,
} = authSlice.actions

/**
 * Selectors
 */
export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectTokens = (state: { auth: AuthState }) => state.auth.tokens
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading
export const selectIsRefreshing = (state: { auth: AuthState }) => state.auth.isRefreshing
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error
export const selectRequires2FA = (state: { auth: AuthState }) => state.auth.requires2FA
export const selectLoginSessionId = (state: { auth: AuthState }) => state.auth.loginSessionId
export const selectIs2FAEnabled = (state: { auth: AuthState }) =>
  state.auth.user?.is2FAEnabled ?? false

/**
 * Reducer
 */
export const authReducer = authSlice.reducer

export default authSlice
