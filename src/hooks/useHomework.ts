import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { homeworkApi } from '@/api/homework'
import type { HomeworkCreateRequest, HomeworkStatus } from '@/types'

export const homeworkKeys = {
  all: ['homework'] as const,
  student: (studentId: string) => [...homeworkKeys.all, 'student', studentId] as const,
  group: (groupName: string) => [...homeworkKeys.all, 'group', groupName] as const,
  detail: (id: string) => [...homeworkKeys.all, 'detail', id] as const,
  my: () => [...homeworkKeys.all, 'my'] as const,
  tutorStats: () => [...homeworkKeys.all, 'stats'] as const,
}

export function useStudentHomework(studentId: string | null | undefined) {
  return useQuery({
    queryKey: homeworkKeys.student(studentId || ''),
    queryFn: () => homeworkApi.getHomeworkByStudent(studentId!),
    enabled: !!studentId,
  })
}

export function useGroupHomework(groupName: string | null | undefined) {
  return useQuery({
    queryKey: homeworkKeys.group(groupName || ''),
    queryFn: () => homeworkApi.getHomeworkByGroup(groupName!),
    enabled: !!groupName,
  })
}

export function useHomework(id: string | null | undefined) {
  return useQuery({
    queryKey: homeworkKeys.detail(id || ''),
    queryFn: () => homeworkApi.getHomeworkById(id!),
    enabled: !!id,
  })
}

export function useCreateHomework() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: HomeworkCreateRequest) => homeworkApi.createHomework(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: homeworkKeys.all })
      if (variables.studentId) {
        queryClient.invalidateQueries({
          queryKey: homeworkKeys.student(variables.studentId),
        })
      }
    },
  })
}

export function useCreateGroupHomework() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: HomeworkCreateRequest) => homeworkApi.createGroupHomework(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: homeworkKeys.all })
      if (variables.groupName) {
        queryClient.invalidateQueries({
          queryKey: homeworkKeys.group(variables.groupName),
        })
      }
    },
  })
}

export function useUpdateHomeworkStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: HomeworkStatus }) =>
      homeworkApi.updateHomeworkStatus(id, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: homeworkKeys.all })
      if (updated?.id) {
        queryClient.invalidateQueries({
          queryKey: homeworkKeys.detail(updated.id),
        })
      }
      if (updated?.studentId) {
        queryClient.invalidateQueries({
          queryKey: homeworkKeys.student(updated.studentId),
        })
      }
    },
  })
}

export function useMyHomework() {
  return useQuery({
    queryKey: homeworkKeys.my(),
    queryFn: () => homeworkApi.getMyHomework(),
  })
}

export function useSubmitHomework() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, studentNotes }: { id: string; studentNotes?: string }) =>
      homeworkApi.submitHomework(id, studentNotes),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: homeworkKeys.all })
      queryClient.invalidateQueries({ queryKey: homeworkKeys.my() })
      if (updated?.id) {
        queryClient.invalidateQueries({
          queryKey: homeworkKeys.detail(updated.id),
        })
      }
      if (updated?.studentId) {
        queryClient.invalidateQueries({
          queryKey: homeworkKeys.student(updated.studentId),
        })
      }
    },
  })
}

export function useDeleteHomework() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => homeworkApi.deleteHomework(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homeworkKeys.all })
    },
  })
}

export function useTutorHomeworkStats() {
  return useQuery({
    queryKey: homeworkKeys.tutorStats(),
    queryFn: () => homeworkApi.getTutorHomeworkStats(),
  })
}

