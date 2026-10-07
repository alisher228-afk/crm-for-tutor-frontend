import { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Download,
  ExternalLink,
  FileText,
  FileImage,
  File,
  Loader2,
  FileQuestion,
} from 'lucide-react'
import { getDirectFileUrl, isTelegramWebApp } from '@/lib/fileUtils'

interface FileViewerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  fileName?: string
  contentType?: string
  blobUrl?: string | null
  apiPath?: string
  isLoading?: boolean
  onDownload?: () => void
}

export function FileViewerDialog({
  open,
  onOpenChange,
  title,
  fileName,
  contentType = '',
  blobUrl,
  apiPath,
  isLoading = false,
  onDownload,
}: FileViewerDialogProps) {
  const displayFileName = fileName || title || 'Файл'
  const isTg = isTelegramWebApp()

  const ext = (displayFileName.split('.').pop() || '').toLowerCase()
  const isImage =
    contentType.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)
  const isPdf =
    contentType === 'application/pdf' ||
    ext === 'pdf'
  const isAudio =
    contentType.startsWith('audio/') ||
    ['mp3', 'wav', 'ogg', 'm4a'].includes(ext)
  const isVideo =
    contentType.startsWith('video/') ||
    ['mp4', 'webm', 'mov'].includes(ext)

  // Cleanup blob URL when modal closes or changes
  useEffect(() => {
    return () => {
      if (blobUrl) {
        window.URL.revokeObjectURL(blobUrl)
      }
    }
  }, [blobUrl])

  const handleOpenExternal = () => {
    if (!apiPath) return
    const directUrl = getDirectFileUrl(apiPath)
    if (isTg && window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink(directUrl)
    } else {
      window.open(directUrl, '_blank')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl w-[96vw] h-[88vh] p-0 flex flex-col overflow-hidden bg-card border-border"
        showCloseButton={true}
      >
        {/* Header with Title and Action Buttons */}
        <DialogHeader className="p-3 sm:p-4 border-b border-border flex flex-row items-center justify-between gap-3 shrink-0 pr-12">
          <div className="flex items-center gap-2.5 min-w-0">
            {isImage ? (
              <FileImage className="h-5 w-5 text-purple-500 shrink-0" />
            ) : isPdf ? (
              <FileText className="h-5 w-5 text-rose-500 shrink-0" />
            ) : (
              <File className="h-5 w-5 text-primary shrink-0" />
            )}
            <div className="min-w-0">
              <DialogTitle className="text-sm sm:text-base font-semibold truncate leading-tight">
                {title}
              </DialogTitle>
              {displayFileName !== title && (
                <p className="text-xs text-muted-foreground truncate">{displayFileName}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {apiPath && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1 hidden sm:flex"
                onClick={handleOpenExternal}
                title="Открыть в браузере"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Браузер</span>
              </Button>
            )}

            {onDownload && (
              <Button
                variant="default"
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={onDownload}
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Скачать</span>
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 w-full h-full overflow-hidden relative bg-muted/20 flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground p-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Загрузка файла...</p>
            </div>
          ) : !blobUrl ? (
            <div className="flex flex-col items-center justify-center gap-3 p-6 text-center max-w-sm">
              <FileQuestion className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-semibold">Не удалось отобразить файл</p>
              {onDownload && (
                <Button size="sm" onClick={onDownload} className="gap-1.5 mt-2">
                  <Download className="h-4 w-4" />
                  Скачать на устройство
                </Button>
              )}
            </div>
          ) : isImage ? (
            <div className="w-full h-full overflow-auto p-2 sm:p-4 flex items-center justify-center">
              <img
                src={blobUrl}
                alt={title}
                className="max-w-full max-h-full object-contain rounded shadow-sm"
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={blobUrl}
              title={title}
              className="w-full h-full border-0 rounded-b bg-white"
            />
          ) : isAudio ? (
            <div className="p-8 text-center space-y-4">
              <p className="text-sm text-muted-foreground">Аудиозапись</p>
              <audio controls src={blobUrl} className="w-full max-w-md mx-auto" />
            </div>
          ) : isVideo ? (
            <div className="w-full h-full p-2 flex items-center justify-center">
              <video controls src={blobUrl} className="max-w-full max-h-full rounded" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 p-6 text-center max-w-md">
              <div className="p-4 rounded-2xl bg-primary/10 text-primary">
                <File className="h-10 w-10" />
              </div>
              <div>
                <h4 className="text-base font-semibold">{displayFileName}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Прямой предпросмотр этого типа файла недоступен в приложении. Вы можете открыть его в браузере или скачать на устройство.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {apiPath && (
                  <Button variant="outline" size="sm" onClick={handleOpenExternal} className="gap-1.5">
                    <ExternalLink className="h-4 w-4" />
                    Открыть в браузере
                  </Button>
                )}
                {onDownload && (
                  <Button size="sm" onClick={onDownload} className="gap-1.5">
                    <Download className="h-4 w-4" />
                    Скачать файл
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
