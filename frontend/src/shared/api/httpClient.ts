import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  type AxiosError,
} from 'axios'

/**
 * API Response type
 */
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  status: number
  timestamp: string
}

/**
 * API Error type
 */
export interface ApiError {
  status: number
  message: string
  code?: string
  details?: Record<string, string[]>
  timestamp: string
}

/**
 * HTTP Client Configuration
 */
interface HttpClientConfig {
  baseURL: string
  timeout: number
  headers?: Record<string, string>
}

/**
 * HTTP Client Class
 * Centralized HTTP client with interceptors for auth, error handling, and logging
 */
class HttpClient {
  private instance: AxiosInstance

  constructor(config: HttpClientConfig) {
    this.instance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    })

    this.setupInterceptors()
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add auth token if available
        const token = this.getAuthToken()
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // Add request timestamp for logging
        config.headers['X-Request-ID'] = this.generateRequestId()

        return config
      },
      (error: AxiosError) => {
        console.error('[HTTP Request Error]', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response
      },
      (error: AxiosError<ApiError>) => {
        return this.handleError(error)
      }
    )
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: AxiosError<ApiError>): Promise<never> {
    const apiError: ApiError = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      code: error.response?.data?.code,
      details: error.response?.data?.details,
      timestamp: error.response?.data?.timestamp || new Date().toISOString(),
    }

    // Handle specific error codes
    switch (apiError.status) {
      case 401:
        // Dispatch logout event or redirect to login
        this.handleUnauthorized()
        break
      case 403:
        // Handle forbidden - maybe show access denied page
        break
      case 404:
        // Handle not found
        break
      case 422:
        // Handle validation errors
        break
      case 429:
        // Handle rate limiting
        break
      default:
        // Log unexpected errors
        console.error('[HTTP Error]', apiError)
    }

    // Wrap ApiError so it satisfies prefer-promise-reject-errors (Error instance);
    // original payload is preserved on .cause for callers that inspect it.
    const rejection = Object.assign(new Error(apiError.message ?? 'API error'), apiError, {
      cause: apiError,
    })
    return Promise.reject(rejection)
  }

  /**
   * Handle unauthorized requests
   */
  private handleUnauthorized(): void {
    // Clear auth token
    this.clearAuthToken()

    // Dispatch custom event for auth state change
    window.dispatchEvent(new CustomEvent('auth:unauthorized'))

    // Optionally redirect to login
    // window.location.href = '/login'
  }

  /**
   * Get auth token from storage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') {
      return null
    }
    return localStorage.getItem('auth_token')
  }

  /**
   * Clear auth token from storage
   */
  private clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
    }
  }

  /**
   * Generate unique request ID for tracing
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  /**
   * Set auth token
   */
  public setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  /**
   * Set refresh token
   */
  public setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', token)
    }
  }

  /**
   * Get refresh token
   */
  public getRefreshToken(): string | null {
    if (typeof window === 'undefined') {
      return null
    }
    return localStorage.getItem('refresh_token')
  }

  /**
   * Clear all auth tokens
   */
  public clearAuth(): void {
    this.clearAuthToken()
    this.clearRefreshToken()
  }

  /**
   * Clear refresh token
   */
  private clearRefreshToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refresh_token')
    }
  }

  /**
   * GET request
   */
  public async get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.get<ApiResponse<T>>(url, config)
  }

  /**
   * POST request
   */
  public async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.post<ApiResponse<T>>(url, data, config)
  }

  /**
   * PUT request
   */
  public async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.put<ApiResponse<T>>(url, data, config)
  }

  /**
   * PATCH request
   */
  public async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.patch<ApiResponse<T>>(url, data, config)
  }

  /**
   * DELETE request
   */
  public async delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.delete<ApiResponse<T>>(url, config)
  }

  /**
   * Download file
   */
  public async download(url: string, config?: AxiosRequestConfig): Promise<Blob> {
    const response = await this.instance.get(url, {
      ...config,
      responseType: 'blob',
    })
    return response.data as Blob
  }

  /**
   * Upload file
   */
  public async upload<T = unknown>(
    url: string,
    file: File | FormData,
    onProgress?: (progress: number) => void
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    const formData =
      file instanceof FormData
        ? file
        : (() => {
            const fd = new FormData()
            fd.append('file', file)
            return fd
          })()

    return this.instance.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
  }

  /**
   * Get the underlying axios instance
   */
  public getInstance(): AxiosInstance {
    return this.instance
  }
}

/**
 * Create HTTP client instance with default configuration
 */
const httpClient = new HttpClient({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 30000,
  headers: {
    Accept: 'application/json',
  },
})

export { httpClient }
export default httpClient
