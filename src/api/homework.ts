import { apiClient } from './client'
import type {
  Homework,
  HomeworkCreateRequest,
  HomeworkStatus,
  HomeworkStatsResponse,
} from '@/types'

export const homeworkApi = {
  createHomework: async (data: HomeworkCreateRequest): Promise<Homework> => {
    const response = await apiClient.post<Homework>('/api/v1/homework', data)
    return response.data
  },

  createGroupHomework: async (data: HomeworkCreateRequest): Promise<Homework[]> => {
    const response = await apiClient.post<Homework[]>('/api/v1/homework/group', data)
    return response.data
  },

  getHomeworkById: async (id: string): Promise<Homework> => {
    const response = await apiClient.get<Homework>(`/api/v1/homework/${id}`)
    return response.data
  },

  getHomeworkByStudent: async (studentId: string): Promise<Homework[]> => {
    const response = await apiClient.get<any>(
      `/api/v1/homework/student/${studentId}`,
    )
    if (Array.isArray(response.data)) {
      return response.data
    }
    return response.data?.content || []
  },

  getHomeworkByGroup: async (groupName: string): Promise<Homework[]> => {
    const response = await apiClient.get<any>('/api/v1/homework/group', {
      params: { groupName },
    })
    if (Array.isArray(response.data)) {
      return response.data
    }
    return response.data?.content || []
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

  deleteHomework: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/homework/${id}`)
  },

  getTutorHomeworkStats: async (): Promise<HomeworkStatsResponse> => {
    const response = await apiClient.get<HomeworkStatsResponse>('/api/v1/homework/stats')
    return response.data
  },

  // Student self endpoints
  getMyHomework: async (): Promise<Homework[]> => {
    const response = await apiClient.get<any>('/api/v1/me/homework')
    if (Array.isArray(response.data)) {
      return response.data
    }
    return response.data?.content || []
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
