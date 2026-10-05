import { useState, useRef, type ChangeEvent, type DragEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useHomeworkAttachments,
  useUploadAttachment,
  useDeleteAttachment,
} from '@/hooks/useAttachments'
import { attachmentsApi } from '@/api/attachments'
import { toast } from 'sonner'
import {
  Paperclip,
  UploadCloud,
  Download,
  ExternalLink,
  Trash2,
  File,
  FileImage,
  FileText,
  FileArchive,
  FileCode,
  Loader2,
  HardDrive,
  FolderKanban,
} from 'lucide-react'
import { SelectMaterialDialog } from '@/components/SelectMaterialDialog'
import { useAttachMaterialToHomework } from '@/hooks/useMaterials'
import type { Attachment, TeachingMaterial } from '@/types'
import type { AxiosError } from 'axios'

interface HomeworkAttachmentsProps {
  homeworkId: string
  readOnly?: boolean
  className?: string
}

function formatBytes(bytes?: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 Б'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function formatDate(isoStr?: string): string {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getFileIcon(fileName?: string, contentType?: string) {
  const ext = fileName ? fileName.split('.').pop()?.toLowerCase() : ''

  if (
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '') ||
    contentType?.startsWith('image/')
  ) {
    return <FileImage className="h-5 w-5 text-purple-500 shrink-0" />
  }

  if (ext === 'pdf' || contentType === 'application/pdf') {
    return <FileText className="h-5 w-5 text-rose-500 shrink-0" />
  }

  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) {
    return <FileArchive className="h-5 w-5 text-amber-500 shrink-0" />
  }

  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'py', 'java'].includes(ext || '')) {
    return <FileCode className="h-5 w-5 text-sky-500 shrink-0" />
  }

  return <File className="h-5 w-5 text-muted-foreground shrink-0" />
}

export function HomeworkAttachments({
  homeworkId,
  readOnly = false,
  className = '',
}: HomeworkAttachmentsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data: attachments = [], isLoading } = useHomeworkAttachments(homeworkId)
  const uploadMutation = useUploadAttachment(homeworkId)
  const deleteMutation = useDeleteAttachment(homeworkId)
  const attachMaterialMutation = useAttachMaterialToHomework(homeworkId)
  const [isSelectMaterialOpen, setIsSelectMaterialOpen] = useState(false)

  const handleSelectMaterials = async (materials: TeachingMaterial[]) => {
    let successCount = 0
    for (const mat of materials) {
      try {
        await attachMaterialMutation.mutateAsync(mat.id)
        successCount++
      } catch (err) {
        console.error('Failed to attach material:', mat.title, err)
      }
    }
    if (successCount > 0) {
      toast.success(
        `Прикреплено материалов из Базы знаний: ${successCount} из ${materials.length}`,
      )
    } else {
      toast.error('Не удалось прикрепить выбранные материалы')
    }
  }

  const handleFileSelect = async (file: File) => {
    if (!file) return

    // Quick client limit check (50MB)
    const MAX_SIZE_BYTES = 50 * 1024 * 1024
    if (file.size > MAX_SIZE_BYTES) {
      toast.error('Размер файла превышает 50 МБ')
      return
    }

    try {
      await uploadMutation.mutateAsync(file)
      toast.success(`Файл "${file.name}" успешно прикреплен`)
    } catch (err) {
      const axiosError = err as AxiosError<{
        message?: string
        error?: string
        detail?: string
      }>
      const backendMessage =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.detail ||
        axiosError.response?.data?.error ||
        axiosError.message ||
        'Ошибка загрузки файла. Проверьте формат или размер файла.'
      toast.error(backendMessage)
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!readOnly && !uploadMutation.isPending) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (readOnly || uploadMutation.isPending) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleOpen = async (attachment: Attachment) => {
    const fileName = attachment.originalFileName || attachment.fileName || attachment.name || 'файл'
    setOpeningId(attachment.id)

    try {
      await attachmentsApi.openAttachment(attachment.id)
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      toast.error(
        axiosError.response?.data?.message || `Не удалось открыть файл "${fileName}"`,
      )
    } finally {
      setOpeningId(null)
    }
  }

  const handleDownload = async (attachment: Attachment) => {
    const fileName = attachment.originalFileName || attachment.fileName || attachment.name || 'attachment'
    setDownloadingId(attachment.id)

    try {
      await attachmentsApi.downloadAttachment(attachment.id, fileName)
      toast.success(`Скачивание "${fileName}" начато`)
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      toast.error(
        axiosError.response?.data?.message || 'Не удалось скачать файл',
      )
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDelete = async (attachment: Attachment) => {
    const fileName = attachment.originalFileName || attachment.fileName || attachment.name || 'файл'
    setDeletingId(attachment.id)

    try {
      await deleteMutation.mutateAsync(attachment.id)
      toast.success(`Файл "${fileName}" удален`)
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      toast.error(
        axiosError.response?.data?.message || 'Не удалось удалить файл',
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">
            Вложения и файлы
          </h4>
          <span className="text-xs text-muted-foreground">
            ({attachments.length})
          </span>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSelectMaterialOpen(true)}
              disabled={uploadMutation.isPending || attachMaterialMutation.isPending}
              className="h-8 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/10"
            >
              {attachMaterialMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FolderKanban className="h-3.5 w-3.5" />
              )}
              <span>Из Базы знаний</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending || attachMaterialMutation.isPending}
              className="h-8 text-xs gap-1.5"
            >
              {uploadMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <UploadCloud className="h-3.5 w-3.5" />
              )}
              <span>Загрузить файл</span>
            </Button>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleInputChange}
        disabled={uploadMutation.isPending || readOnly}
      />

      {/* Dropzone (if not read-only) */}
      {!readOnly && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-primary bg-primary/5 scale-[0.99]'
              : 'border-border hover:border-primary/50 hover:bg-muted/30 bg-muted/10'
          } ${uploadMutation.isPending ? 'opacity-60 pointer-events-none' : ''}`}
        >
          {uploadMutation.isPending ? (
            <div className="flex flex-col items-center justify-center py-2 space-y-2">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
              <p className="text-xs font-medium text-foreground">
                Загрузка файла на сервер...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-1 space-y-1">
              <UploadCloud className="h-6 w-6 text-muted-foreground/80 mb-0.5" />
              <p className="text-xs font-medium text-foreground">
                Нажмите или перетащите файл сюда
              </p>
              <p className="text-[11px] text-muted-foreground">
                Поддерживаются документы, изображения, PDF и архивы до 50 МБ
              </p>
            </div>
          )}
        </div>
      )}

      {/* Attachments List */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      ) : attachments.length > 0 ? (
        <div className="space-y-2">
          {attachments.map((att) => {
            const fileName = att.originalFileName || att.fileName || att.name || 'Безымянный файл'
            const size = att.sizeBytes ?? att.fileSize ?? att.size
            const dateStr = att.uploadedAt || att.createdAt
            const isOpening = openingId === att.id
            const isDownloading = downloadingId === att.id
            const isDeleting = deletingId === att.id

            return (
              <div
                key={att.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card/60 hover:bg-muted/40 transition-colors gap-3"
              >
                {/* File Icon & Info (clickable to preview/open) */}
                <div
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group/file"
                  onClick={() => handleOpen(att)}
                  title="Нажмите, чтобы открыть или просмотреть файл"
                >
                  {getFileIcon(fileName, att.contentType)}
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs font-medium text-foreground truncate group-hover/file:text-primary group-hover/file:underline transition-colors"
                      title={fileName}
                    >
                      {fileName}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                      {size !== undefined && <span>{formatBytes(size)}</span>}
                      {size !== undefined && dateStr && <span>•</span>}
                      {dateStr && <span>{formatDate(dateStr)}</span>}
                    </div>
                  </div>
                </div>

                {/* Actions: Open, Download & Delete */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleOpen(att)}
                    disabled={isOpening || isDownloading || isDeleting}
                    title="Открыть / Просмотреть в новой вкладке"
                    className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                  >
                    {isOpening ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    ) : (
                      <ExternalLink className="h-3.5 w-3.5" />
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDownload(att)}
                    disabled={isOpening || isDownloading || isDeleting}
                    title="Скачать файл"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                  </Button>

                  {!readOnly && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(att)}
                      disabled={isDeleting || isDownloading || isOpening}
                      title="Удалить файл"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-destructive" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        readOnly && (
          <div className="text-center py-4 text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <HardDrive className="h-3.5 w-3.5" />
            <span>К заданию не прикреплено файлов</span>
          </div>
        )
      )}

      {!readOnly && (
        <SelectMaterialDialog
          open={isSelectMaterialOpen}
          onOpenChange={setIsSelectMaterialOpen}
          onSelectMaterials={handleSelectMaterials}
        />
      )}
    </div>
  )
}
