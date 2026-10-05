import { apiClient } from './client'
import type {
  Lesson,
  LessonCreateRequest,
  LessonUpdateRequest,
  LessonStatus,
} from '@/types'

export interface GetLessonsParams {
  from?: string
  to?: string
}

export const lessonsApi = {
  getLessons: async (params?: GetLessonsParams): Promise<Lesson[]> => {
    const response = await apiClient.get<Lesson[]>('/api/v1/lessons', {
      params: {
        from: params?.from || undefined,
        to: params?.to || undefined,
      },
    })
    return response.data
  },

  getLessonById: async (id: string): Promise<Lesson> => {
    const response = await apiClient.get<Lesson>(`/api/v1/lessons/${id}`)
    return response.data
  },

  createLesson: async (data: LessonCreateRequest): Promise<Lesson> => {
    const response = await apiClient.post<Lesson>('/api/v1/lessons', data)
    return response.data
  },

  updateLesson: async (id: string, data: LessonUpdateRequest): Promise<Lesson> => {
    const response = await apiClient.put<Lesson>(`/api/v1/lessons/${id}`, data)
    return response.data
  },

  updateLessonStatus: async (id: string, status: LessonStatus): Promise<Lesson> => {
    const response = await apiClient.put<Lesson>(
      `/api/v1/lessons/${id}/status`,
      { status },
      {
        params: { status }, // Support both body and query param depending on backend binding
      },
    )
    return response.data
  },

  deleteLesson: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/lessons/${id}`)
  },

  getMyLessons: async (params?: GetLessonsParams): Promise<Lesson[]> => {
    const response = await apiClient.get<Lesson[]>('/api/v1/me/lessons', {
      params: {
        from: params?.from || undefined,
        to: params?.to || undefined,
      },
    })
    return response.data
  },

  cancelMyLesson: async (id: string, reason?: string): Promise<Lesson> => {
    const response = await apiClient.patch<Lesson>(`/api/v1/me/lessons/${id}/cancel`, {
      reason,
    })
    return response.data
  },
}
