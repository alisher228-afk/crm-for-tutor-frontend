import { apiClient } from './client'
import type {
  Homework,
  HomeworkCreateRequest,
  HomeworkStatus,
} from '@/types'

export const homeworkApi = {
  createHomework: async (data: HomeworkCreateRequest): Promise<Homework> => {
    const response = await apiClient.post<Homework>('/api/v1/homework', data)
    return response.data
  },

  getHomeworkById: async (id: string): Promise<Homework> => {
    const response = await apiClient.get<Homework>(`/api/v1/homework/${id}`)
    return response.data
  },

  getHomeworkByStudent: async (studentId: string): Promise<Homework[]> => {
    const response = await apiClient.get<Homework[]>(
      `/api/v1/homework/student/${studentId}`,
    )
    return response.data
  },

  updateHomeworkStatus: async (
    id: string,
    status: HomeworkStatus,
  ): Promise<Homework> => {
    const response = await apiClient.patch<Homework>(
      `/api/v1/homework/${id}/status`,
      { status },
      {
        params: { status }, // Support both body and query param depending on backend binding
      },
    )
    return response.data
  },

  // Student self endpoints
  getMyHomework: async (): Promise<Homework[]> => {
    const response = await apiClient.get<Homework[]>('/api/v1/me/homework')
    return response.data
  },

  submitHomework: async (
    id: string,
    studentNotes?: string,
  ): Promise<Homework> => {
    const response = await apiClient.patch<Homework>(
      `/api/v1/me/homework/${id}/submit`,
      { studentNotes },
    )
    return response.data
  },
}
