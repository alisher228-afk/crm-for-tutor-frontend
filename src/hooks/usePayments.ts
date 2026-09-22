import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentsApi } from '@/api/payments'
import { studentKeys } from './useStudents'
import type { PaymentCreateRequest, PaymentUpdateRequest } from '@/types'

export const paymentKeys = {
  all: ['payments'] as const,
  student: (studentId: string) => [...paymentKeys.all, 'student', studentId] as const,
  my: () => [...paymentKeys.all, 'my'] as const,
  analytics: (month: number, year: number) =>
    ['analytics', 'income', year, month] as const,
  analyticsAll: () => ['analytics', 'income'] as const,
}

export function useStudentPayments(studentId: string | null | undefined) {
  return useQuery({
    queryKey: paymentKeys.student(studentId || ''),
    queryFn: () => paymentsApi.getStudentPayments(studentId!),
    enabled: !!studentId,
  })
}

export function useMyPayments() {
  return useQuery({
    queryKey: paymentKeys.my(),
    queryFn: () => paymentsApi.getMyPayments(),
  })
}

export function useIncomeAnalytics(month: number, year: number) {
  return useQuery({
    queryKey: paymentKeys.analytics(month, year),
    queryFn: () => paymentsApi.getIncomeAnalytics(month, year),
    enabled: !!month && !!year,
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PaymentCreateRequest) => paymentsApi.createPayment(data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all })
      queryClient.invalidateQueries({ queryKey: paymentKeys.analyticsAll() })
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
      if (variables.studentId) {
        queryClient.invalidateQueries({
          queryKey: paymentKeys.student(variables.studentId),
        })
        queryClient.invalidateQueries({
          queryKey: studentKeys.detail(variables.studentId),
        })
      }
      return result
    },
  })
}

export function useUpdatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PaymentUpdateRequest }) =>
      paymentsApi.updatePayment(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all })
      queryClient.invalidateQueries({ queryKey: paymentKeys.analyticsAll() })
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
      if (updated?.studentId) {
        queryClient.invalidateQueries({
          queryKey: paymentKeys.student(updated.studentId),
        })
        queryClient.invalidateQueries({
          queryKey: studentKeys.detail(updated.studentId),
        })
      }
    },
  })
}

export function useDeletePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string; studentId?: string }) =>
      paymentsApi.deletePayment(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all })
      queryClient.invalidateQueries({ queryKey: paymentKeys.analyticsAll() })
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
      if (variables?.studentId) {
        queryClient.invalidateQueries({
          queryKey: paymentKeys.student(variables.studentId),
        })
        queryClient.invalidateQueries({
          queryKey: studentKeys.detail(variables.studentId),
        })
      }
    },
  })
}
