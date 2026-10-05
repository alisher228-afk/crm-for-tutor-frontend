import { apiClient } from './client'
import type { UserProfile, UserProfileUpdateRequest, ChangePasswordRequest } from '@/types'

export const profileApi = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('/api/v1/profile')
    return response.data
  },

  updateProfile: async (data: UserProfileUpdateRequest): Promise<UserProfile> => {
    const response = await apiClient.put<UserProfile>('/api/v1/profile', data)
    return response.data
  },

  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/api/v1/profile/change-password', data)
    return response.data
  },
}
