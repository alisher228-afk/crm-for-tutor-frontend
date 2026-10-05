import { apiClient } from './client'
import type {
  AuthResponse,
  LoginRequest,
  RegisterTutorRequest,
  RegisterStudentRequest,
  RefreshTokenRequest,
} from '@/types'

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', data)
    return response.data
  },

  registerTutor: async (data: RegisterTutorRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/register', data)
    return response.data
  },

  registerStudent: async (data: RegisterStudentRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/register-student', data)
    return response.data
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/refresh', data)
    return response.data
  },

  loginWithTelegramWebApp: async (data: { initData: string; linkCode?: string }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/telegram-webapp', data)
    return response.data
  },
}
