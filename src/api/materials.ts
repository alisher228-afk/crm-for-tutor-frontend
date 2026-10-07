import { apiClient } from './client'
import { triggerFileDownload, isTelegramWebApp } from '@/lib/fileUtils'
import type {
  TeachingMaterial,
  MaterialCreatePayload,
  MaterialUpdatePayload,
  Attachment,
} from '@/types'

export const materialsApi = {
  getMaterials: async (search?: string, category?: string): Promise<TeachingMaterial[]> => {
    const params = new URLSearchParams()
    if (search && search.trim()) params.append('search', search.trim())
    if (category && category.trim() && category !== 'ALL') params.append('category', category.trim())

    const response = await apiClient.get<TeachingMaterial[]>('/api/v1/materials', { params })
    return response.data
  },

  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/api/v1/materials/categories')
    return response.data
  },

  getMaterialById: async (id: string): Promise<TeachingMaterial> => {
    const response = await apiClient.get<TeachingMaterial>(`/api/v1/materials/${id}`)
    return response.data
  },

  createMaterial: async (payload: MaterialCreatePayload): Promise<TeachingMaterial> => {
    const formData = new FormData()
    formData.append('title', payload.title)
    if (payload.category?.trim()) formData.append('category', payload.category.trim())
    if (payload.description?.trim()) formData.append('description', payload.description.trim())
    formData.append('file', payload.file)

    const response = await apiClient.post<TeachingMaterial>('/api/v1/materials', formData)
    return response.data
  },

  updateMaterial: async (
    id: string,
    payload: MaterialUpdatePayload,
  ): Promise<TeachingMaterial> => {
    const response = await apiClient.put<TeachingMaterial>(`/api/v1/materials/${id}`, payload)
    return response.data
  },

  deleteMaterial: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/materials/${id}`)
  },

  fetchMaterialBlob: async (
    id: string,
  ): Promise<{ blob: Blob; blobUrl: string; contentType: string; fileName?: string }> => {
    const response = await apiClient.get(`/api/v1/materials/${id}/download?inline=true`, {
      responseType: 'blob',
    })
    const rawContentType = response.headers['content-type']
    const contentType = typeof rawContentType === 'string' ? rawContentType : 'application/octet-stream'

    let fileName: string | undefined
    const disposition = response.headers['content-disposition']
    if (typeof disposition === 'string' && disposition.includes('filename=')) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (match && match[1]) {
        fileName = match[1].replace(/['"]/g, '').trim()
      }
    }

    const blob = new Blob([response.data], { type: contentType })
    const blobUrl = window.URL.createObjectURL(blob)
    return { blob, blobUrl, contentType, fileName }
  },

  openMaterial: async (id: string): Promise<void> => {
    const response = await apiClient.get(`/api/v1/materials/${id}/download?inline=true`, {
      responseType: 'blob',
    })
    const rawContentType = response.headers['content-type']
    const contentType = typeof rawContentType === 'string' ? rawContentType : 'application/octet-stream'
    const blob = new Blob([response.data], { type: contentType })
    const blobUrl = window.URL.createObjectURL(blob)
    window.open(blobUrl, '_blank')
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl)
    }, 60000)
  },

  downloadMaterial: async (id: string, fallbackFileName = 'material'): Promise<void> => {
    const apiPath = `/api/v1/materials/${id}/download`
    if (isTelegramWebApp() && window.Telegram?.WebApp?.openLink) {
      await triggerFileDownload({ fileName: fallbackFileName, apiPath })
      return
    }

    const response = await apiClient.get(apiPath, {
      responseType: 'blob',
    })

    let fileName = fallbackFileName
    const disposition = response.headers['content-disposition']
    if (typeof disposition === 'string' && disposition.includes('filename=')) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (match && match[1]) {
        fileName = match[1].replace(/['"]/g, '').trim()
      }
    }

    const contentType = response.headers['content-type']
    const blob = new Blob([response.data], {
      type: typeof contentType === 'string' ? contentType : 'application/octet-stream',
    })
    await triggerFileDownload({ blob, fileName, apiPath })
  },

  attachToHomework: async (homeworkId: string, materialId: string): Promise<Attachment> => {
    const response = await apiClient.post<Attachment>(
      `/api/v1/homework/${homeworkId}/attachments/from-material/${materialId}`,
    )
    return response.data
  },

  // Student self endpoints
  getMyMaterials: async (search?: string, category?: string): Promise<TeachingMaterial[]> => {
    const params = new URLSearchParams()
    if (search && search.trim()) params.append('search', search.trim())
    if (category && category.trim() && category !== 'ALL') params.append('category', category.trim())

    const response = await apiClient.get<TeachingMaterial[]>('/api/v1/me/materials', { params })
    return response.data
  },

  getMyCategories: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/api/v1/me/materials/categories')
    return response.data
  },

  fetchMyMaterialBlob: async (
    id: string,
  ): Promise<{ blob: Blob; blobUrl: string; contentType: string; fileName?: string }> => {
    const response = await apiClient.get(`/api/v1/me/materials/${id}/download?inline=true`, {
      responseType: 'blob',
    })
    const rawContentType = response.headers['content-type']
    const contentType = typeof rawContentType === 'string' ? rawContentType : 'application/octet-stream'

    let fileName: string | undefined
    const disposition = response.headers['content-disposition']
    if (typeof disposition === 'string' && disposition.includes('filename=')) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (match && match[1]) {
        fileName = match[1].replace(/['"]/g, '').trim()
      }
    }

    const blob = new Blob([response.data], { type: contentType })
    const blobUrl = window.URL.createObjectURL(blob)
    return { blob, blobUrl, contentType, fileName }
  },

  openMyMaterial: async (id: string): Promise<void> => {
    const response = await apiClient.get(`/api/v1/me/materials/${id}/download?inline=true`, {
      responseType: 'blob',
    })
    const rawContentType = response.headers['content-type']
    const contentType = typeof rawContentType === 'string' ? rawContentType : 'application/octet-stream'
    const blob = new Blob([response.data], { type: contentType })
    const blobUrl = window.URL.createObjectURL(blob)
    window.open(blobUrl, '_blank')
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl)
    }, 60000)
  },

  downloadMyMaterial: async (id: string, fallbackFileName = 'material'): Promise<void> => {
    const apiPath = `/api/v1/me/materials/${id}/download`
    if (isTelegramWebApp() && window.Telegram?.WebApp?.openLink) {
      await triggerFileDownload({ fileName: fallbackFileName, apiPath })
      return
    }

    const response = await apiClient.get(apiPath, {
      responseType: 'blob',
    })

    let fileName = fallbackFileName
    const disposition = response.headers['content-disposition']
    if (typeof disposition === 'string' && disposition.includes('filename=')) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (match && match[1]) {
        fileName = match[1].replace(/['"]/g, '').trim()
      }
    }

    const contentType = response.headers['content-type']
    const blob = new Blob([response.data], {
      type: typeof contentType === 'string' ? contentType : 'application/octet-stream',
    })
    await triggerFileDownload({ blob, fileName, apiPath })
  },
}
