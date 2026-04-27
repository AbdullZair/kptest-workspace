import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { LoginRequest, LoginResponse, RegisterRequest, AuthState } from './types';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.kptest.com',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as { auth?: { token?: string } };
      if (state?.auth?.token) {
        headers.set('Authorization', `Bearer ${state.auth.token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    // Login
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Register
    register: builder.mutation<LoginResponse, RegisterRequest>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Verify 2FA
    verify2FA: builder.mutation<LoginResponse, { tempToken: string; code: string }>({
      query: (data) => ({
        url: '/auth/verify-2fa',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Send 2FA code
    send2FA: builder.mutation<{ success: boolean }, { email: string }>({
      query: (data) => ({
        url: '/auth/send-2fa',
        method: 'POST',
        body: data,
      }),
    }),

    // Reset password request
    resetPassword: builder.mutation<{ success: boolean }, { email: string }>({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),

    // Confirm password reset
    confirmPasswordReset: builder.mutation<
      LoginResponse,
      { token: string; newPassword: string }
    >({
      query: (data) => ({
        url: '/auth/confirm-reset-password',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Logout
    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

    // Get current user
    getCurrentUser: builder.query<AuthState['user'], void>({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
      providesTags: ['Auth'],
    }),

    // Refresh token
    refreshToken: builder.mutation<LoginResponse, { refreshToken: string }>({
      query: (data) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerify2FAMutation,
  useSend2FAMutation,
  useResetPasswordMutation,
  useConfirmPasswordResetMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useRefreshTokenMutation,
} = authApi;

export default authApi;
