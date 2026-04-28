import { api } from '@shared/api'
import type {
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
} from '../lib/auth.types'
import type { User } from '@shared/types'

/**
 * Auth API slice using RTK Query
 * Handles all authentication-related endpoints
 */
export const authApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Register new user account
     * @mutation
     */
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    /**
     * Login user with credentials
     * @mutation
     */
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: {
          identifier: credentials.email,
          password: credentials.password,
        },
      }),
      transformResponse: (response: {
        access_token: string
        refresh_token: string
        token_type: string
        expires_in: number
        requires2fa: boolean
      }) => {
        // Transform backend response to frontend format
        return {
          tokens: {
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            tokenType: response.token_type as 'Bearer',
            expiresIn: response.expires_in,
          },
          requires2FA: response.requires2fa,
          user: null as any, // User will be fetched separately via getCurrentUser
        }
      },
      invalidatesTags: ['User'],
    }),

    /**
     * Verify two-factor authentication code during login
     * @mutation
     */
    verify2fa: builder.mutation<Verify2FAResponse, Verify2FARequest & { sessionId: string }>({
      query: ({ sessionId, ...body }) => ({
        url: `/auth/2fa/verify/${sessionId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    /**
     * Enable two-factor authentication for current user
     * @mutation
     */
    enable2fa: builder.mutation<Enable2FAResponse, Enable2FARequest>({
      query: (body) => ({
        url: '/auth/2fa/enable',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    /**
     * Confirm two-factor authentication setup with code
     * @mutation
     */
    confirm2fa: builder.mutation<Confirm2FAResponse, Confirm2FARequest>({
      query: (body) => ({
        url: '/auth/2fa/confirm',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    /**
     * Disable two-factor authentication
     * @mutation
     */
    disable2fa: builder.mutation<{ success: boolean; message: string }, Verify2FARequest>({
      query: (body) => ({
        url: '/auth/2fa/disable',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    /**
     * Refresh access token using refresh token
     * @mutation
     */
    refreshToken: builder.mutation<AuthTokens, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
      // Don't invalidate tags - this is a silent operation
    }),

    /**
     * Get current authenticated user profile
     * @query
     */
    getCurrentUser: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),

    /**
     * Logout current user
     * @mutation
     */
    logout: builder.mutation<LogoutResponse, LogoutRequest>({
      query: (body) => ({
        url: '/auth/logout',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    /**
     * Request password reset email
     * @mutation
     */
    requestPasswordReset: builder.mutation<void, { email: string }>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),

    /**
     * Reset password with token from email
     * @mutation
     */
    resetPassword: builder.mutation<
      void,
      { token: string; password: string; confirmPassword: string }
    >({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),

    /**
     * Change password for authenticated user
     * @mutation
     */
    changePassword: builder.mutation<void, { currentPassword: string; newPassword: string }>({
      query: (body) => ({
        url: '/auth/change-password',
        method: 'POST',
        body,
      }),
    }),

    /**
     * Resend verification email
     * @mutation
     */
    resendVerificationEmail: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/resend-verification',
        method: 'POST',
      }),
    }),

    /**
     * Verify email with token
     * @mutation
     */
    verifyEmail: builder.mutation<void, { token: string }>({
      query: (body) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
  }),
  overrideExisting: false,
})

/**
 * Export auto-generated hooks for use in components
 */
export const {
  useRegisterMutation,
  useLoginMutation,
  useVerify2faMutation,
  useEnable2faMutation,
  useConfirm2faMutation,
  useDisable2faMutation,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  useLogoutMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useResendVerificationEmailMutation,
  useVerifyEmailMutation,
} = authApiSlice

export default authApiSlice
