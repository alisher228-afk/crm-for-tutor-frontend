import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lessonsApi, type GetLessonsParams } from '@/api/lessons'
import type { LessonCreateRequest, LessonUpdateRequest, LessonStatus } from '@/types'

export const lessonKeys = {
  all: ['lessons'] as const,
  lists: () => [...lessonKeys.all, 'list'] as const,
  list: (params?: GetLessonsParams) => [...lessonKeys.lists(), params] as const,
  my: (params?: GetLessonsParams) => [...lessonKeys.all, 'my', params] as const,
  details: () => [...lessonKeys.all, 'detail'] as const,
  detail: (id: string) => [...lessonKeys.details(), id] as const,
}

export function useLessons(params?: GetLessonsParams) {
  return useQuery({
    queryKey: lessonKeys.list(params),
    queryFn: () => lessonsApi.getLessons(params),
  })
}

export function useLesson(id: string | null | undefined) {
  return useQuery({
    queryKey: lessonKeys.detail(id || ''),
    queryFn: () => lessonsApi.getLessonById(id!),
    enabled: !!id,
  })
}

export function useCreateLesson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LessonCreateRequest) => lessonsApi.createLesson(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.all })
    },
  })
}

export function useUpdateLesson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LessonUpdateRequest }) =>
      lessonsApi.updateLesson(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.all })
      queryClient.invalidateQueries({ queryKey: lessonKeys.detail(id) })
    },
  })
}

export function useUpdateLessonStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LessonStatus }) =>
      lessonsApi.updateLessonStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.all })
      queryClient.invalidateQueries({ queryKey: lessonKeys.detail(id) })
    },
  })
}

export function useDeleteLesson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => lessonsApi.deleteLesson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.all })
    },
  })
}

export function useMyLessons(params?: GetLessonsParams) {
  return useQuery({
    queryKey: lessonKeys.my(params),
    queryFn: () => lessonsApi.getMyLessons(params),
  })
}

export function useCancelMyLesson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      lessonsApi.cancelMyLesson(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.all })
      queryClient.invalidateQueries({ queryKey: lessonKeys.my() })
    },
  })
}

