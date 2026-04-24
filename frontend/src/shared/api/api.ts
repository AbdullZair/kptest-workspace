import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs } from '@reduxjs/toolkit/query/react'
import type { ApiError } from './httpClient'
import { AUTH_STORAGE_KEYS } from '@features/auth/lib/auth.types'

/**
 * Base URL for API requests
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

/**
 * Token refresh state to prevent concurrent refresh requests
 */
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []
let refreshFailedSubscribers: Array<() => void> = []

/**
 * Subscribe to token refresh success
 */
function subscribeTokenRefresh(cb: (token: string) => void): void {
  refreshSubscribers.push(cb)
}

/**
 * Subscribe to token refresh failure
 */
function subscribeTokenRefreshFailed(cb: () => void): void {
  refreshFailedSubscribers.push(cb)
}

/**
 * Execute all refresh subscribers
 */
function onTokenRefreshed(token: string): void {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

/**
 * Execute all refresh failed subscribers
 */
function onRefreshTokenFailed(): void {
  refreshFailedSubscribers.forEach((cb) => cb())
  refreshFailedSubscribers = []
}

/**
 * Get access token from localStorage
 */
function getAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
}

/**
 * Get refresh token from localStorage
 */
function getRefreshToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
}

/**
 * Check if token is expired (with 30 second buffer)
 */
function isTokenExpired(): boolean {
  if (typeof window === 'undefined') {
    return true
  }
  const expiry = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRY)
  if (!expiry) return true
  return Date.now() >= parseInt(expiry, 10) - 30000
}

/**
 * Clear all auth tokens
 */
function clearAuthTokens(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRY)
  }
}

/**
 * Dispatch logout event
 */
function dispatchLogout(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:unauthorized'))
  }
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    return null
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      throw new Error('Token refresh failed')
    }

    const data = await response.json()
    const { accessToken, refreshToken: newRefreshToken, expiresIn } = data.data || data

    // Store new tokens
    if (accessToken) {
      const expiresAt = Date.now() + expiresIn * 1000
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken)
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken || refreshToken)
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRY, expiresAt.toString())
    }

    return accessToken
  } catch (error) {
    console.error('[Token Refresh Error]', error)
    clearAuthTokens()
    dispatchLogout()
    return null
  }
}

/**
 * Custom base query function with error handling and auto token refresh
 */
export const customBaseQuery = async (
  args: string | FetchArgs,
  api: {
    dispatch: (action: unknown) => void
    getState: () => unknown
    extra: unknown
    endpoint: string
    type: 'query' | 'mutation'
    abort: () => void
    signal: AbortSignal
    queryFulfilled: Promise<unknown> | undefined
  },
  extraOptions: {
    baseUrl?: string
  } = {}
): Promise<{ data: unknown } | { error: ApiError }> => {
  const baseQuery = fetchBaseQuery({
    baseUrl: extraOptions.baseUrl || API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Get token from localStorage
      const token = getAccessToken()

      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }

      headers.set('accept', 'application/json')
      headers.set('content-type', 'application/json')

      return headers
    },
  })

  try {
    let result = await baseQuery(args, api, extraOptions)

    // Handle 401 - unauthorized (token might be expired)
    if ((result as { error?: { status?: number } }).error?.status === 401) {
      // Skip refresh for auth endpoints to prevent infinite loops
      const url = typeof args === 'string' ? args : (args as FetchArgs).url
      const isAuthEndpoint = url.includes('/auth/')

      if (!isAuthEndpoint && !isRefreshing) {
        isRefreshing = true

        try {
          const newToken = await refreshAccessToken()

          if (newToken) {
            // Retry the original request with new token
            if (typeof args === 'string') {
              result = await baseQuery(args, api, extraOptions)
            } else {
              const fetchArgs = args as FetchArgs
              result = await baseQuery(
                {
                  ...fetchArgs,
                  headers: new Headers(fetchArgs.headers).set('authorization', `Bearer ${newToken}`),
                },
                api,
                extraOptions
              )
            }

            // Notify all waiting requests that token was refreshed
            onTokenRefreshed(newToken)
          } else {
            // Token refresh failed
            onRefreshTokenFailed()
            clearAuthTokens()
            dispatchLogout()
            return {
              error: {
                status: 401,
                message: 'Authentication required',
                code: 'UNAUTHORIZED',
                timestamp: new Date().toISOString(),
              },
            }
          }
        } catch (refreshError) {
          console.error('[Token Refresh Error]', refreshError)
          onRefreshTokenFailed()
          clearAuthTokens()
          dispatchLogout()
          return {
            error: {
              status: 401,
              message: 'Authentication failed',
              code: 'UNAUTHORIZED',
              timestamp: new Date().toISOString(),
            },
          }
        } finally {
          isRefreshing = false
        }
      } else if (isAuthEndpoint) {
        // For auth endpoints, just clear tokens and dispatch logout
        clearAuthTokens()
        dispatchLogout()
      }
    }

    // Handle other HTTP errors
    if ((result as { error?: { status?: number; data?: ApiError } }).error) {
      const error = (result as { error: { status: number; data?: ApiError } }).error

      return {
        error: {
          status: error.status,
          message: error.data?.message || 'An error occurred',
          code: error.data?.code,
          details: error.data?.details,
          timestamp: error.data?.timestamp || new Date().toISOString(),
        },
      }
    }

    return result
  } catch (error) {
    return {
      error: {
        status: 0,
        message: error instanceof Error ? error.message : 'Network error',
        code: 'NETWORK_ERROR',
        timestamp: new Date().toISOString(),
      },
    }
  }
}

/**
 * Base API configuration for RTK Query
 */
export const api = createApi({
  reducerPath: 'api',
  baseQuery: customBaseQuery as BaseQueryFn<string | FetchArgs, unknown, ApiError>,
  tagTypes: [
    'User',
    'Patient',
    'Appointment',
    'MedicalRecord',
    'Prescription',
    'LabResult',
    'Document',
    'Notification',
    'Settings',
    'Message',
    'MessageThread',
    'CalendarEvent',
    'Project',
    'ProjectStatistics',
    'PatientProject',
    'ProjectTeam',
    'Material',
    'MaterialProgress',
    'AdminUser',
    'AuditLog',
    'SystemLog',
    'SystemHealth',
    'SystemMetrics',
  ],
  endpoints: () => ({}),
})

/**
 * Inject new endpoints into the API
 */
export const injectApiEndpoints = <T extends Record<string, unknown>>(
  endpoints: T
): void => {
  api.injectEndpoints({
    endpoints: () => endpoints,
    overrideExisting: false,
  })
}

export default api
