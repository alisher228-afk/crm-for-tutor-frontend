import { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { Loader2, ZoomIn, ZoomOut, RotateCcw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Set worker source for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

interface PdfViewerProps {
  blob?: Blob | null
  blobUrl?: string | null
  title?: string
}

export function PdfViewer({ blob, blobUrl }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [scale, setScale] = useState<number>(1.2)
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null)

  // Load PDF document
  useEffect(() => {
    let isMounted = true

    async function loadPdf() {
      setLoading(true)
      setError(null)

      try {
        let arrayBuffer: ArrayBuffer | null = null

        if (blob) {
          arrayBuffer = await blob.arrayBuffer()
        } else if (blobUrl) {
          const res = await fetch(blobUrl)
          arrayBuffer = await res.arrayBuffer()
        }

        if (!arrayBuffer) {
          throw new Error('Файл PDF не найден')
        }

        if (!isMounted) return

        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
          cMapUrl: 'https://unpkg.com/pdfjs-dist@6.4.299/cmaps/',
          cMapPacked: true,
        })

        const doc = await loadingTask.promise
        if (!isMounted) return

        setPdfDoc(doc)
        setNumPages(doc.numPages)
        setLoading(false)
      } catch (err) {
        console.error('Failed to load PDF:', err)
        if (isMounted) {
          setError('Не удалось загрузить PDF документ.')
          setLoading(false)
        }
      }
    }

    loadPdf()

    return () => {
      isMounted = false
    }
  }, [blob, blobUrl])

  // Render pages when doc or scale changes
  useEffect(() => {
    if (!pdfDoc || !containerRef.current) return

    let isMounted = true
    const container = containerRef.current
    container.innerHTML = ''

    async function renderAllPages() {
      if (!pdfDoc || !container) return

      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)

      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        if (!isMounted) break

        try {
          const page = await pdfDoc.getPage(pageNum)
          if (!isMounted) break

          const viewport = page.getViewport({ scale })

          // Create wrapper for the page
          const pageWrapper = document.createElement('div')
          pageWrapper.className = 'relative my-3 shadow-md rounded-md overflow-hidden bg-white mx-auto transition-transform'
          pageWrapper.style.width = `${viewport.width}px`
          pageWrapper.style.height = `${viewport.height}px`

          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d', { alpha: false })
          if (!context) continue

          canvas.width = Math.floor(viewport.width * pixelRatio)
          canvas.height = Math.floor(viewport.height * pixelRatio)
          canvas.style.width = `${viewport.width}px`
          canvas.style.height = `${viewport.height}px`

          context.scale(pixelRatio, pixelRatio)

          pageWrapper.appendChild(canvas)
          container.appendChild(pageWrapper)

          await page.render({
            canvasContext: context,
            viewport,
            canvas,
          }).promise
        } catch (err) {
          console.warn(`Error rendering page ${pageNum}:`, err)
        }
      }
    }

    renderAllPages()

    return () => {
      isMounted = false
    }
  }, [pdfDoc, scale])

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 3.0))
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.6))
  const handleResetZoom = () => setScale(1.2)

  return (
    <div className="w-full h-full flex flex-col relative bg-muted/40 overflow-hidden">
      {/* Zoom / Page controls bar */}
      <div className="bg-card/90 backdrop-blur border-b border-border px-3 py-1.5 flex items-center justify-between text-xs text-muted-foreground shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span>{numPages > 0 ? `Всего страниц: ${numPages}` : 'PDF Документ'}</span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            className="h-7 w-7"
            onClick={handleZoomOut}
            title="Уменьшить"
            disabled={scale <= 0.6}
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="text-[11px] font-mono px-1 min-w-[42px] text-center">
            {Math.round((scale / 1.2) * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            className="h-7 w-7"
            onClick={handleZoomIn}
            title="Увеличить"
            disabled={scale >= 3.0}
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="h-7 w-7"
            onClick={handleResetZoom}
            title="По умолчанию"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">
            Загрузка и рендеринг PDF...
          </p>
        </div>
      )}

      {/* Error state */}
      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto">
          <AlertCircle className="h-10 w-10 text-destructive mb-2" />
          <h4 className="text-base font-semibold">Не удалось отобразить PDF</h4>
          <p className="text-xs text-muted-foreground mt-1 mb-4">{error}</p>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="flex-1 w-full overflow-auto p-2 sm:p-4 flex flex-col items-center"
        />
      )}
    </div>
  )
}
