import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileApi } from '@/api/profile'
import type { UserProfileUpdateRequest, ChangePasswordRequest } from '@/types'

export const profileKeys = {
  profile: () => ['profile'] as const,
}

export function useUserProfile() {
  return useQuery({
    queryKey: profileKeys.profile(),
    queryFn: () => profileApi.getProfile(),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UserProfileUpdateRequest) => profileApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.profile() })
      queryClient.invalidateQueries({ queryKey: ['me', 'profile'] })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => profileApi.changePassword(data),
  })
}
