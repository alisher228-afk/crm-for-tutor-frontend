import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { attachmentsApi } from '@/api/attachments'

export const attachmentKeys = {
  all: ['attachments'] as const,
  homework: (homeworkId: string) => [...attachmentKeys.all, 'homework', homeworkId] as const,
}

export function useHomeworkAttachments(homeworkId: string | null | undefined) {
  return useQuery({
    queryKey: attachmentKeys.homework(homeworkId || ''),
    queryFn: () => attachmentsApi.getHomeworkAttachments(homeworkId!),
    enabled: !!homeworkId,
  })
}

export function useUploadAttachment(homeworkId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => attachmentsApi.uploadAttachment(homeworkId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.homework(homeworkId) })
    },
  })
}

export function useDeleteAttachment(homeworkId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (attachmentId: string) => attachmentsApi.deleteAttachment(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.homework(homeworkId) })
    },
  })
}
