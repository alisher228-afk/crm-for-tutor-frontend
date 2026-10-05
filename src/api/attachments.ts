import { apiClient } from './client'
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

  downloadAttachment: async (id: string, fallbackFileName = 'download'): Promise<void> => {
    const response = await apiClient.get(`/api/v1/attachments/${id}/download`, {
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
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(blobUrl)
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
