import { useEffect, useRef, useState } from 'react'
import { renderAsync } from 'docx-preview'
import { Loader2, AlertCircle } from 'lucide-react'

interface DocxViewerProps {
  blob?: Blob | null
  blobUrl?: string | null
}

export function DocxViewer({ blob, blobUrl }: DocxViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadAndRender() {
      if (!containerRef.current) return
      setLoading(true)
      setError(null)
      containerRef.current.innerHTML = ''

      try {
        let fileData: Blob | ArrayBuffer | null = blob || null
        if (!fileData && blobUrl) {
          const res = await fetch(blobUrl)
          fileData = await res.blob()
        }

        if (!fileData) {
          throw new Error('Файл документа не найден')
        }

        if (!isMounted || !containerRef.current) return

        await renderAsync(fileData, containerRef.current, undefined, {
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          breakPages: true,
          className: 'docx-preview-content',
        })

        if (isMounted) {
          setLoading(false)
        }
      } catch (err) {
        console.error('Failed to render docx:', err)
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Не удалось отобразить документ Word. Попробуйте скачать файл.',
          )
          setLoading(false)
        }
      }
    }

    loadAndRender()

    return () => {
      isMounted = false
    }
  }, [blob, blobUrl])

  return (
    <div className="w-full h-full flex flex-col relative bg-muted/30 overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">
            Загрузка документа Word...
          </p>
        </div>
      )}

      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto">
          <AlertCircle className="h-10 w-10 text-destructive mb-2" />
          <h4 className="text-base font-semibold">Ошибка предпросмотра</h4>
          <p className="text-xs text-muted-foreground mt-1 mb-4">{error}</p>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="w-full h-full overflow-auto p-2 sm:p-6 flex justify-center selection:bg-primary/20"
          style={{ minHeight: '100%' }}
        />
      )}
    </div>
  )
}
