import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { AuthResponse } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export const ACCESS_TOKEN_KEY = 'accessToken'
export const REFRESH_TOKEN_KEY = 'refreshToken'
export const USER_ROLE_KEY = 'userRole'
export const USER_EMAIL_KEY = 'userEmail'

export const getStoredAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY)
export const getStoredRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY)

export const setStoredTokens = (data: {
  accessToken: string
  refreshToken: string
  role?: string
  email?: string
}) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
  if (data.role) {
    const normalizedRole = data.role.replace(/^ROLE_/, '')
    localStorage.setItem(USER_ROLE_KEY, normalizedRole)
  }
  if (data.email) {
    localStorage.setItem(USER_EMAIL_KEY, data.email)
  }
}

export const clearStoredTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_ROLE_KEY)
  localStorage.removeItem(USER_EMAIL_KEY)
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

// Request Interceptor: attach Bearer token and handle FormData boundary
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredAccessToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // When sending FormData, delete Content-Type so browser sets multipart/form-data with the correct boundary!
    if (config.data instanceof FormData && config.headers) {
      if (typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type')
        config.headers.delete('content-type')
      } else {
        delete config.headers['Content-Type']
        delete (config.headers as Record<string, unknown>)['content-type']
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response Interceptor: handle 401 and refresh token queue
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else if (token) {
      promise.resolve(token)
    }
  })
  failedQueue = []
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined

    if (!originalRequest) {
      return Promise.reject(error)
    }

    const isAuthEndpoint =
      originalRequest.url?.includes('/api/v1/auth/refresh') ||
      originalRequest.url?.includes('/api/v1/auth/login') ||
      originalRequest.url?.includes('/api/v1/auth/register') ||
      originalRequest.url?.includes('/api/v1/auth/telegram-webapp')

    const status = error.response?.status
    const isAuthError = status === 401 || (status === 403 && !!getStoredRefreshToken())

    if (isAuthError && !originalRequest._retry && !isAuthEndpoint) {
      const refreshToken = getStoredRefreshToken()

      if (!refreshToken) {
        clearStoredTokens()
        const isTg = typeof window !== 'undefined' && !!window.Telegram?.WebApp?.initData
        if (!isTg && window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const cleanBaseUrl = (API_BASE_URL || '').replace(/\/+$/, '')
        const refreshUrl = cleanBaseUrl ? `${cleanBaseUrl}/api/v1/auth/refresh` : '/api/v1/auth/refresh'

        const response = await axios.post<AuthResponse>(
          refreshUrl,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        )

        const { accessToken, refreshToken: newRefreshToken, role } = response.data
        setStoredTokens({
          accessToken,
          refreshToken: newRefreshToken || refreshToken,
          role,
        })

        apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`
        processQueue(null, accessToken)

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
        }

        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearStoredTokens()
        const isTg = typeof window !== 'undefined' && !!window.Telegram?.WebApp?.initData
        if (!isTg && window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)
