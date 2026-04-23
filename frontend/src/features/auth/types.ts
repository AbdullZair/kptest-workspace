/**
 * Authentication Types
 * Core TypeScript interfaces for authentication flow
 */

import type { User } from '@shared/types'

/**
 * User entity with authentication context
 */
export interface AuthUser extends User {
  is2FAEnabled: boolean
  emailVerified: boolean
  phoneVerified: boolean
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

/**
 * Login response with tokens and user data
 */
export interface LoginResponse {
  user: AuthUser
  tokens: AuthTokens
  requires2FA?: boolean
  sessionId?: string
}

/**
 * Register request payload
 */
export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  acceptTerms: boolean
}

/**
 * Register response with tokens and user data
 */
export interface RegisterResponse {
  user: AuthUser
  tokens: AuthTokens
}

/**
 * Two-factor authentication verification request
 */
export interface Verify2FARequest {
  code: string
}

/**
 * Two-factor authentication verification response
 */
export interface Verify2FAResponse {
  user: AuthUser
  tokens: AuthTokens
}

/**
 * Enable 2FA request
 */
export interface Enable2FARequest {
  enabled: boolean
}

/**
 * Enable 2FA response with QR code for setup
 */
export interface Enable2FAResponse {
  qrCodeUrl: string
  secret: string
  backupCodes: string[]
}

/**
 * Confirm 2FA setup request
 */
export interface Confirm2FARequest {
  code: string
}

/**
 * Confirm 2FA setup response
 */
export interface Confirm2FAResponse {
  success: boolean
  message: string
}

/**
 * Authentication tokens
 */
export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: 'Bearer'
}

/**
 * Logout request
 */
export interface LogoutRequest {
  refreshToken?: string
}

/**
 * Logout response
 */
export interface LogoutResponse {
  success: boolean
  message?: string
}

/**
 * Auth storage keys for localStorage
 */
export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  TOKEN_EXPIRY: 'auth_token_expiry',
  USER: 'auth_user',
} as const

/**
 * Auth API error response
 */
export interface AuthApiError {
  status: number
  code: string
  message: string
  details?: Record<string, string[]>
  timestamp: string
}

/**
 * Auth error codes
 */
export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_EXISTS: 'EMAIL_EXISTS',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  INVALID_2FA_CODE: 'INVALID_2FA_CODE',
  TWO_FA_REQUIRED: 'TWO_FA_REQUIRED',
  TWO_FA_ALREADY_ENABLED: 'TWO_FA_ALREADY_ENABLED',
  TWO_FA_NOT_ENABLED: 'TWO_FA_NOT_ENABLED',
  REFRESH_TOKEN_EXPIRED: 'REFRESH_TOKEN_EXPIRED',
  REFRESH_TOKEN_INVALID: 'REFRESH_TOKEN_INVALID',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN: 'UNKNOWN',
} as const

/**
 * Auth error type
 */
export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES]

/**
 * Auth error with code
 */
export interface AuthError {
  code: AuthErrorCode
  message: string
  status?: number
  details?: Record<string, string[]>
}

/**
 * Auth hook return types
 */
export interface AuthHookReturn {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  requires2FA: boolean
  login: (credentials: LoginRequest) => Promise<LoginResult>
  verify2FA: (code: string) => Promise<Verify2FAResult>
  register: (data: RegisterRequest) => Promise<RegisterResult>
  logout: () => Promise<void>
  enable2FA: () => Promise<Enable2FAResult>
  confirm2FA: (code: string) => Promise<Confirm2FAResult>
  disable2FA: (code: string) => Promise<Disable2FAResult>
  refreshToken: () => Promise<boolean>
}

/**
 * Result types for auth operations
 */
export type LoginResult =
  | { success: true; data: LoginResponse }
  | { success: false; requires2FA: true; message: string }
  | { success: false; error: string }

export type Verify2FAResult =
  | { success: true; data: Verify2FAResponse }
  | { success: false; error: string }

export type RegisterResult =
  | { success: true; data: RegisterResponse }
  | { success: false; error: string }

export type Enable2FAResult =
  | { success: true; data: Enable2FAResponse }
  | { success: false; error: string }

export type Confirm2FAResult =
  | { success: true; data: Confirm2FAResponse }
  | { success: false; error: string }

export type Disable2FAResult =
  | { success: true; data: { success: boolean; message: string } }
  | { success: false; error: string }
