import { apiClient } from './client'
import { triggerFileDownload, isTelegramWebApp } from '@/lib/fileUtils'
import type { Attachment } from '@/types'

export const attachmentsApi = {
  getHomeworkAttachments: async (homeworkId: string): Promise<Attachment[]> => {
    const response = await apiClient.get<Attachment[]>(
      `/api/v1/homework/${homeworkId}/attachments`,
    )
    return response.data
  },

  uploadAttachment: async (homeworkId: string, file: File): Promise<Attachment> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<Attachment>(
      `/api/v1/homework/${homeworkId}/attachments`,
      formData,
    )
    return response.data
  },

  fetchAttachmentBlob: async (
    id: string,
  ): Promise<{ blob: Blob; blobUrl: string; contentType: string; fileName?: string }> => {
    const response = await apiClient.get(`/api/v1/attachments/${id}/download?inline=true`, {
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

  downloadAttachment: async (id: string, fallbackFileName = 'download'): Promise<void> => {
    const apiPath = `/api/v1/attachments/${id}/download`
    if (isTelegramWebApp() && window.Telegram?.WebApp?.openLink) {
      await triggerFileDownload({ fileName: fallbackFileName, apiPath })
      return
    }

    const response = await apiClient.get(apiPath, {
      responseType: 'blob',
    })

    // Extract filename from Content-Disposition header if available
    let fileName = fallbackFileName
    const disposition = response.headers['content-disposition']
    if (typeof disposition === 'string' && disposition.includes('filename=')) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (match && match[1]) {
        fileName = match[1].replace(/['"]/g, '').trim()
      }
    }

    // Create download link from Blob
    const contentType = response.headers['content-type']
    const blob = new Blob([response.data], {
      type: typeof contentType === 'string' ? contentType : 'application/octet-stream',
    })
    await triggerFileDownload({ blob, fileName, apiPath })
  },

  openAttachment: async (id: string): Promise<void> => {
    const response = await apiClient.get(`/api/v1/attachments/${id}/download?inline=true`, {
      responseType: 'blob',
    })

    const contentType = response.headers['content-type']
    const blob = new Blob([response.data], {
      type: typeof contentType === 'string' ? contentType : 'application/octet-stream',
    })
    const blobUrl = window.URL.createObjectURL(blob)
    window.open(blobUrl, '_blank')
    // Give browser time to load blob in new tab before revoking
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl)
    }, 60000)
  },

  deleteAttachment: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/attachments/${id}`)
  },
}
