import { apiClient } from './client'
import type {
  TestItem,
  TestCreateRequest,
  TestUpdateRequest,
  TestPageResponse,
  TestType,
  TestTargetType,
  TestSubmission,
  TestSubmissionRequest,
} from '@/types'

export interface GetTestsParams {
  page?: number
  size?: number
  search?: string
  type?: TestType
  targetType?: TestTargetType
  groupName?: string
  studentId?: string | number
}

export const testsApi = {
  getTests: async (params?: GetTestsParams): Promise<TestPageResponse> => {
    const response = await apiClient.get<TestPageResponse>('/api/v1/tests', {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 12,
        search: params?.search || undefined,
        type: params?.type || undefined,
        targetType: params?.targetType || undefined,
        groupName: params?.groupName || undefined,
        studentId: params?.studentId || undefined,
      },
    })
    return response.data
  },

  getAllTests: async (): Promise<TestItem[]> => {
    const response = await apiClient.get<TestItem[]>('/api/v1/tests/all')
    return response.data
  },

  getTestById: async (id: string): Promise<TestItem> => {
    const response = await apiClient.get<TestItem>(`/api/v1/tests/${id}`)
    return response.data
  },

  createTest: async (data: TestCreateRequest): Promise<TestItem> => {
    const response = await apiClient.post<TestItem>('/api/v1/tests', data)
    return response.data
  },

  updateTest: async (id: string, data: TestUpdateRequest): Promise<TestItem> => {
    const response = await apiClient.put<TestItem>(`/api/v1/tests/${id}`, data)
    return response.data
  },

  deleteTest: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/tests/${id}`)
  },

  getTestSubmissions: async (testId: string): Promise<TestSubmission[]> => {
    const response = await apiClient.get<TestSubmission[]>(`/api/v1/tests/${testId}/submissions`)
    return response.data
  },

  // Student methods
  getMyTests: async (params?: { search?: string; type?: TestType }): Promise<TestItem[]> => {
    const response = await apiClient.get<TestItem[]>('/api/v1/me/tests', {
      params: {
        search: params?.search || undefined,
        type: params?.type || undefined,
      },
    })
    return response.data
  },

  getMyTestById: async (id: string): Promise<TestItem> => {
    const response = await apiClient.get<TestItem>(`/api/v1/me/tests/${id}`)
    return response.data
  },

  submitMyTest: async (id: string, data: TestSubmissionRequest): Promise<TestSubmission> => {
    const response = await apiClient.post<TestSubmission>(`/api/v1/me/tests/${id}/submit`, data)
    return response.data
  },
}
