import { useState } from 'react'
import { useMyMaterials, useMyMaterialCategories } from '@/hooks/useMaterials'
import { materialsApi } from '@/api/materials'
import { FileViewerDialog } from '@/components/FileViewerDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  Library,
  Search,
  File,
  FileImage,
  FileText,
  FileArchive,
  FileCode,
  ExternalLink,
  Download,
  Loader2,
  BookOpen,
  Filter,
  X,
  AlertCircle,
} from 'lucide-react'
import type { TeachingMaterial } from '@/types'

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
    year: 'numeric',
  })
}

function getFileIcon(fileName?: string, contentType?: string) {
  const ext = fileName ? fileName.split('.').pop()?.toLowerCase() : ''

  if (
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '') ||
    contentType?.startsWith('image/')
  ) {
    return <FileImage className="h-6 w-6 text-purple-500 shrink-0" />
  }

  if (ext === 'pdf' || contentType === 'application/pdf') {
    return <FileText className="h-6 w-6 text-rose-500 shrink-0" />
  }

  if (['doc', 'docx', 'odt', 'rtf', 'txt'].includes(ext || '')) {
    return <FileText className="h-6 w-6 text-blue-500 shrink-0" />
  }

  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) {
    return <FileArchive className="h-6 w-6 text-amber-500 shrink-0" />
  }

  if (['json', 'js', 'ts', 'html', 'css', 'py', 'java', 'sql'].includes(ext || '')) {
    return <FileCode className="h-6 w-6 text-emerald-500 shrink-0" />
  }

  return <File className="h-6 w-6 text-muted-foreground shrink-0" />
}

export function StudentMaterialsPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  // In-app file viewer state
  const [viewerState, setViewerState] = useState<{
    open: boolean
    title: string
    fileName?: string
    contentType?: string
    blobUrl?: string | null
    apiPath?: string
    isLoading: boolean
    onDownload?: () => void
  }>({
    open: false,
    title: '',
    isLoading: false,
  })

  const {
    data: materials = [],
    isLoading,
    isError,
    refetch,
  } = useMyMaterials({
    search: search.trim() || undefined,
    category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
  })

  const { data: categories = [] } = useMyMaterialCategories()

  const handleOpen = async (material: TeachingMaterial) => {
    const apiPath = `/api/v1/me/materials/${material.id}/download`
    const fileName = material.originalFileName || material.fileName || `${material.title}.pdf`

    setOpeningId(material.id)
    setViewerState({
      open: true,
      title: material.title,
      fileName,
      contentType: material.contentType || '',
      blobUrl: null,
      apiPath,
      isLoading: true,
      onDownload: () => handleDownload(material),
    })

    try {
      const { blobUrl, contentType } = await materialsApi.fetchMyMaterialBlob(material.id)
      setViewerState((prev) => ({
        ...prev,
        blobUrl,
        contentType: contentType || prev.contentType,
        isLoading: false,
      }))
    } catch {
      setViewerState((prev) => ({
        ...prev,
        isLoading: false,
      }))
      toast.error('Не удалось открыть файл. Попробуйте скачать его.')
    } finally {
      setOpeningId(null)
    }
  }

  const handleDownload = async (material: TeachingMaterial) => {
    try {
      setDownloadingId(material.id)
      await materialsApi.downloadMyMaterial(material.id, material.originalFileName)
      toast.success(`Файл «${material.originalFileName}» скачивается`)
    } catch {
      toast.error('Не удалось скачать файл')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Library className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Библиотека материалов</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Учебники, методические пособия и книги от вашего преподавателя
          </p>
        </div>
      </div>

      {/* Search & Categories Toolbar */}
      <Card className="border-border">
        <CardContent className="p-4 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию книги, описанию или имени файла..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs sm:text-sm bg-background"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Categories Pill Selector */}
          {categories.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
              <span className="text-muted-foreground flex items-center gap-1 shrink-0 mr-1">
                <Filter className="h-3 w-3" />
                Разделы:
              </span>
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all border ${
                  selectedCategory === 'ALL'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/40 hover:bg-muted text-foreground border-border'
                }`}
              >
                Все материалы ({materials.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all border ${
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/40 hover:bg-muted text-foreground border-border'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Materials Grid / List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-12 w-full rounded" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-8 w-24 rounded" />
                  <Skeleton className="h-8 w-24 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-12 text-center flex flex-col items-center justify-center space-y-3">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="font-semibold text-foreground">
              Не удалось загрузить материалы
            </p>
            <p className="text-xs text-muted-foreground">
              Проверьте соединение с интернетом или повторите запрос
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Повторить попытку
            </Button>
          </CardContent>
        </Card>
      ) : materials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((mat) => {
            const isOpening = openingId === mat.id
            const isDownloading = downloadingId === mat.id

            return (
              <Card
                key={mat.id}
                className="border-border hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <CardContent className="p-4 space-y-3">
                  {/* Top file meta */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-muted/60 border border-border/80">
                      {getFileIcon(mat.originalFileName, mat.contentType)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {mat.category && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 font-medium"
                          >
                            {mat.category}
                          </Badge>
                        )}
                        <span className="text-[11px] text-muted-foreground ml-auto">
                          {formatBytes(mat.sizeBytes)}
                        </span>
                      </div>

                      <h3
                        className="font-semibold text-sm text-foreground mt-1 line-clamp-2"
                        title={mat.title}
                      >
                        {mat.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  {mat.description ? (
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {mat.description}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground/60 italic">
                      Описание отсутствует
                    </p>
                  )}

                  {/* Date & Original file name */}
                  <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/60 flex items-center justify-between">
                    <span className="truncate max-w-[170px]" title={mat.originalFileName}>
                      {mat.originalFileName}
                    </span>
                    <span>{formatDate(mat.createdAt)}</span>
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpen(mat)}
                      disabled={isOpening}
                      className="text-xs gap-1.5 h-8"
                    >
                      {isOpening ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ExternalLink className="h-3.5 w-3.5" />
                      )}
                      <span>Просмотр</span>
                    </Button>

                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleDownload(mat)}
                      disabled={isDownloading}
                      className="text-xs gap-1.5 h-8"
                    >
                      {isDownloading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      <span>Скачать</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <Card className="border-border">
          <CardContent className="py-16 text-center flex flex-col items-center justify-center space-y-3">
            <div className="p-3.5 rounded-full bg-muted text-muted-foreground">
              <BookOpen className="h-7 w-7" />
            </div>
            <div className="max-w-xs space-y-1">
              <p className="font-semibold text-foreground">Материалов пока нет</p>
              <p className="text-xs text-muted-foreground">
                {search || selectedCategory !== 'ALL'
                  ? 'По заданным параметрам поиска ничего не найдено.'
                  : 'Преподаватель ещё не добавил учебники или методические материалы в библиотеку.'}
              </p>
            </div>
            {(search || selectedCategory !== 'ALL') && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs mt-2"
                onClick={() => {
                  setSearch('')
                  setSelectedCategory('ALL')
                }}
              >
                Сбросить фильтры
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* In-App File Viewer Dialog (prevents Telegram WebView navigation lock) */}
      <FileViewerDialog
        open={viewerState.open}
        onOpenChange={(open) =>
          setViewerState((prev) => ({ ...prev, open }))
        }
        title={viewerState.title}
        fileName={viewerState.fileName}
        contentType={viewerState.contentType}
        blobUrl={viewerState.blobUrl}
        apiPath={viewerState.apiPath}
        isLoading={viewerState.isLoading}
        onDownload={viewerState.onDownload}
      />
    </div>
  )
}
