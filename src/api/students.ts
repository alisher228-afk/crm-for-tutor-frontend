import { apiClient } from './client'
import type {
  StudentProfile,
  StudentCreateRequest,
  StudentUpdateRequest,
  StudentPageResponse,
  InviteTokenResponse,
  TelegramLinkCodeResponse,
} from '@/types'

export interface GetStudentsParams {
  page?: number
  size?: number
  search?: string
}

export const studentsApi = {
  getStudents: async (params?: GetStudentsParams): Promise<StudentPageResponse> => {
    const response = await apiClient.get<StudentPageResponse>('/api/v1/students', {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 10,
        search: params?.search || undefined,
      },
    })
    return response.data
  },

  getStudentById: async (id: string): Promise<StudentProfile> => {
    const response = await apiClient.get<StudentProfile>(`/api/v1/students/${id}`)
    return response.data
  },

  createStudent: async (data: StudentCreateRequest): Promise<StudentProfile> => {
    const response = await apiClient.post<StudentProfile>('/api/v1/students', data)
    return response.data
  },

  updateStudent: async (id: string, data: StudentUpdateRequest): Promise<StudentProfile> => {
    const response = await apiClient.put<StudentProfile>(`/api/v1/students/${id}`, data)
    return response.data
  },

  archiveStudent: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/students/${id}`)
  },

  generateInviteToken: async (id: string): Promise<string> => {
    const response = await apiClient.post<InviteTokenResponse | string>(
      `/api/v1/students/${id}/invite`,
    )
    if (typeof response.data === 'string') {
      return response.data
    }
    return response.data.inviteToken || response.data.token || ''
  },

  generateTelegramLinkCode: async (id: string): Promise<string> => {
    const response = await apiClient.post<TelegramLinkCodeResponse | string>(
      `/api/v1/students/${id}/telegram-link-code`,
    )
    if (typeof response.data === 'string') {
      return response.data
    }
    return response.data.code || response.data.telegramLinkCode || ''
  },

  getMyProfile: async (): Promise<StudentProfile> => {
    const response = await apiClient.get<StudentProfile>('/api/v1/me/profile')
    return response.data
  },
}
