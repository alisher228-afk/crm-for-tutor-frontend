import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { testsApi, type GetTestsParams } from '@/api/tests'
import type { TestCreateRequest, TestUpdateRequest, TestSubmissionRequest, TestType } from '@/types'

export const testKeys = {
  all: ['tests'] as const,
  lists: () => [...testKeys.all, 'list'] as const,
  list: (params?: GetTestsParams) => [...testKeys.lists(), params] as const,
  allList: () => [...testKeys.all, 'all'] as const,
  details: () => [...testKeys.all, 'detail'] as const,
  detail: (id: string) => [...testKeys.details(), id] as const,
  submissions: (id: string) => [...testKeys.all, 'submissions', id] as const,
  myTests: (params?: { search?: string; type?: TestType }) =>
    [...testKeys.all, 'my-tests', params] as const,
  myDetail: (id: string) => [...testKeys.all, 'my-detail', id] as const,
}

export function useTests(params?: GetTestsParams) {
  return useQuery({
    queryKey: testKeys.list(params),
    queryFn: () => testsApi.getTests(params),
  })
}

export function useAllTests() {
  return useQuery({
    queryKey: testKeys.allList(),
    queryFn: () => testsApi.getAllTests(),
  })
}

export function useTest(id: string | null | undefined) {
  return useQuery({
    queryKey: testKeys.detail(id || ''),
    queryFn: () => testsApi.getTestById(id!),
    enabled: !!id,
  })
}

export function useCreateTest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TestCreateRequest) => testsApi.createTest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testKeys.all })
    },
  })
}

export function useUpdateTest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TestUpdateRequest }) =>
      testsApi.updateTest(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: testKeys.all })
      queryClient.invalidateQueries({ queryKey: testKeys.detail(id) })
    },
  })
}

export function useDeleteTest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => testsApi.deleteTest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testKeys.all })
    },
  })
}

export function useTestSubmissions(testId: string | null | undefined) {
  return useQuery({
    queryKey: testKeys.submissions(testId || ''),
    queryFn: () => testsApi.getTestSubmissions(testId!),
    enabled: !!testId,
  })
}

// Student Hooks
export function useMyTests(params?: { search?: string; type?: TestType }) {
  return useQuery({
    queryKey: testKeys.myTests(params),
    queryFn: () => testsApi.getMyTests(params),
  })
}

export function useMyTest(id: string | null | undefined) {
  return useQuery({
    queryKey: testKeys.myDetail(id || ''),
    queryFn: () => testsApi.getMyTestById(id!),
    enabled: !!id,
  })
}

export function useSubmitMyTest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TestSubmissionRequest }) =>
      testsApi.submitMyTest(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: testKeys.myTests() })
      queryClient.invalidateQueries({ queryKey: testKeys.myDetail(id) })
      queryClient.invalidateQueries({ queryKey: testKeys.all })
    },
  })
}
