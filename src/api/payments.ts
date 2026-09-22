import { apiClient } from './client'
import type {
  Payment,
  PaymentCreateRequest,
  PaymentUpdateRequest,
  IncomeAnalytics,
} from '@/types'

export const paymentsApi = {
  createPayment: async (data: PaymentCreateRequest): Promise<Payment> => {
    const response = await apiClient.post<Payment>('/api/v1/payments', data)
    return response.data
  },

  getStudentPayments: async (studentId: string): Promise<Payment[]> => {
    const response = await apiClient.get<Payment[]>(
      `/api/v1/payments/student/${studentId}`,
    )
    return response.data
  },

  updatePayment: async (
    id: string,
    data: PaymentUpdateRequest,
  ): Promise<Payment> => {
    const response = await apiClient.put<Payment>(`/api/v1/payments/${id}`, data)
    return response.data
  },

  deletePayment: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/payments/${id}`)
  },

  getIncomeAnalytics: async (
    month: number,
    year: number,
  ): Promise<IncomeAnalytics> => {
    const response = await apiClient.get<IncomeAnalytics>(
      '/api/v1/analytics/income',
      {
        params: { month, year },
      },
    )
    return response.data
  },

  // Student self endpoint
  getMyPayments: async (): Promise<Payment[]> => {
    const response = await apiClient.get<Payment[]>('/api/v1/me/payments')
    return response.data
  },
}
