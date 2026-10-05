import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentsApi, type GetStudentsParams } from '@/api/students'
import type { StudentCreateRequest, StudentUpdateRequest } from '@/types'

export const studentKeys = {
  all: ['students'] as const,
  lists: () => [...studentKeys.all, 'list'] as const,
  list: (params?: GetStudentsParams) => [...studentKeys.lists(), params] as const,
  groups: () => [...studentKeys.all, 'groups'] as const,
  groupStudents: (groupName: string) => [...studentKeys.all, 'group', groupName] as const,
  details: () => [...studentKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentKeys.details(), id] as const,
}

export function useStudents(params?: GetStudentsParams) {
  return useQuery({
    queryKey: studentKeys.list(params),
    queryFn: () => studentsApi.getStudents(params),
  })
}

export function useStudentGroups() {
  return useQuery({
    queryKey: studentKeys.groups(),
    queryFn: () => studentsApi.getGroups(),
  })
}

export function useStudentsByGroup(groupName: string | null | undefined) {
  return useQuery({
    queryKey: studentKeys.groupStudents(groupName || ''),
    queryFn: () => studentsApi.getStudentsByGroup(groupName!),
    enabled: !!groupName,
  })
}

export function useStudent(id: string | null | undefined) {
  return useQuery({
    queryKey: studentKeys.detail(id || ''),
    queryFn: () => studentsApi.getStudentById(id!),
    enabled: !!id,
  })
}


export function useCreateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: StudentCreateRequest) => studentsApi.createStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
    },
  })
}

export function useUpdateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StudentUpdateRequest }) =>
      studentsApi.updateStudent(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(id) })
    },
  })
}

export function useArchiveStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => studentsApi.archiveStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
    },
  })
}

export function useGenerateInvite() {
  return useMutation({
    mutationFn: (id: string) => studentsApi.generateInviteToken(id),
  })
}

export function useGenerateTelegramCode() {
  return useMutation({
    mutationFn: (id: string) => studentsApi.generateTelegramLinkCode(id),
  })
}

export function useMyProfile() {
  return useQuery({
    queryKey: ['me', 'profile'] as const,
    queryFn: () => studentsApi.getMyProfile(),
  })
}
