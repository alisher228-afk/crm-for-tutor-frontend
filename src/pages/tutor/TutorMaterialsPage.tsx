import { useState, useMemo, useRef, type ChangeEvent, type FormEvent, type DragEvent } from 'react'
import {
  useMaterials,
  useMaterialCategories,
  useCreateMaterial,
  useUpdateMaterial,
  useDeleteMaterial,
} from '@/hooks/useMaterials'
import { materialsApi } from '@/api/materials'
import { FileViewerDialog } from '@/components/FileViewerDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  FolderKanban,
  Search,
  Plus,
  UploadCloud,
  File,
  FileImage,
  FileText,
  FileArchive,
  FileCode,
  ExternalLink,
  Download,
  Trash2,
  Edit2,
  Loader2,
  HardDrive,
  BookOpen,
  Filter,
  X,
  Layers,
} from 'lucide-react'
import type { TeachingMaterial } from '@/types'
import type { AxiosError } from 'axios'

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

  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) {
    return <FileArchive className="h-6 w-6 text-amber-500 shrink-0" />
  }

  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'py', 'java', 'cpp'].includes(ext || '')) {
    return <FileCode className="h-6 w-6 text-sky-500 shrink-0" />
  }

  return <File className="h-6 w-6 text-primary shrink-0" />
}

export function TutorMaterialsPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const [activeMaterial, setActiveMaterial] = useState<TeachingMaterial | null>(null)

  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadCategory, setUploadCategory] = useState('')
  const [uploadDescription, setUploadDescription] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const uploadFileInputRef = useRef<HTMLInputElement>(null)

  // Edit form state
  const [editTitle, setEditTitle] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editDescription, setEditDescription] = useState('')

  // Loading indicator for preview/download
  const [busyActionId, setBusyActionId] = useState<string | null>(null)

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

  // API hooks
  const { data: materials = [], isLoading } = useMaterials({
    search: search.trim() || undefined,
    category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
  })
  const { data: categories = [] } = useMaterialCategories()
  const createMutation = useCreateMaterial()
  const updateMutation = useUpdateMaterial()
  const deleteMutation = useDeleteMaterial()

  // Stats
  const totalFiles = materials.length
  const totalSizeBytes = useMemo(
    () => materials.reduce((acc, m) => acc + (m.sizeBytes || m.fileSize || 0), 0),
    [materials],
  )

  // -------------------------------------------------------------
  // File Upload Handlers
  // -------------------------------------------------------------
  const handleFilePicked = (file: File) => {
    setUploadFile(file)
    if (!uploadTitle.trim()) {
      // Pre-fill title with filename without extension
      const dotIdx = file.name.lastIndexOf('.')
      const rawName = dotIdx !== -1 ? file.name.substring(0, dotIdx) : file.name
      setUploadTitle(rawName)
    }
  }

  const handleUploadDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleUploadDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleUploadDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFilePicked(file)
    }
  }

  const handleUploadSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!uploadFile) {
      toast.error('Выберите файл для загрузки')
      return
    }
    const finalTitle = uploadTitle.trim() || uploadFile.name

    try {
      await createMutation.mutateAsync({
        file: uploadFile,
        title: finalTitle,
        category: uploadCategory.trim() || undefined,
        description: uploadDescription.trim() || undefined,
      })

      toast.success(`Материал "${finalTitle}" добавлен в Базу знаний`)
      setIsUploadOpen(false)
      // Reset form
      setUploadFile(null)
      setUploadTitle('')
      setUploadCategory('')
      setUploadDescription('')
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          'Не удалось загрузить материал',
      )
    }
  }

  // -------------------------------------------------------------
  // Edit Handlers
  // -------------------------------------------------------------
  const handleOpenEdit = (m: TeachingMaterial) => {
    setActiveMaterial(m)
    setEditTitle(m.title)
    setEditCategory(m.category || '')
    setEditDescription(m.description || '')
    setIsEditOpen(true)
  }

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!activeMaterial) return
    const finalTitle = editTitle.trim()
    if (!finalTitle) {
      toast.error('Название материала не может быть пустым')
      return
    }

    try {
      await updateMutation.mutateAsync({
        id: activeMaterial.id,
        payload: {
          title: finalTitle,
          category: editCategory.trim() || undefined,
          description: editDescription.trim() || undefined,
        },
      })
      toast.success('Материал обновлен')
      setIsEditOpen(false)
      setActiveMaterial(null)
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          'Не удалось обновить материал',
      )
    }
  }

  // -------------------------------------------------------------
  // Delete Handlers
  // -------------------------------------------------------------
  const handleOpenDelete = (m: TeachingMaterial) => {
    setActiveMaterial(m)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!activeMaterial) return
    try {
      await deleteMutation.mutateAsync(activeMaterial.id)
      toast.success(`Материал "${activeMaterial.title}" удален`)
      setIsDeleteOpen(false)
      setActiveMaterial(null)
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          'Не удалось удалить материал',
      )
    }
  }

  // -------------------------------------------------------------
  // Open / Download Handlers
  // -------------------------------------------------------------
  const handleOpenPreview = async (m: TeachingMaterial) => {
    const apiPath = `/api/v1/materials/${m.id}/download`
    const fileName = m.originalFileName || m.fileName || `${m.title}.pdf`

    setViewerState({
      open: true,
      title: m.title,
      fileName,
      contentType: m.contentType || '',
      blobUrl: null,
      apiPath,
      isLoading: true,
      onDownload: () => handleDownload(m),
    })

    try {
      const { blobUrl, contentType } = await materialsApi.fetchMaterialBlob(m.id)
      setViewerState((prev) => ({
        ...prev,
        blobUrl,
        contentType: contentType || prev.contentType,
        isLoading: false,
      }))
    } catch (err) {
      setViewerState((prev) => ({
        ...prev,
        isLoading: false,
      }))
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      toast.error(
        axiosError.response?.data?.message || `Не удалось загрузить файл "${m.title}"`,
      )
    }
  }

  const handleDownload = async (m: TeachingMaterial) => {
    setBusyActionId(m.id)
    try {
      await materialsApi.downloadMaterial(m.id, m.originalFileName || m.fileName || `${m.title}.pdf`)
      toast.success(`Скачивание "${m.title}" начато`)
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      toast.error(
        axiosError.response?.data?.message || 'Не удалось скачать файл',
      )
    } finally {
      setBusyActionId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FolderKanban className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              База знаний и материалы
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Загружайте учебники, таблицы формул и тесты один раз и прикрепляйте к домашним заданиям в один клик.
          </p>
        </div>

        <Button
          onClick={() => {
            setUploadFile(null)
            setUploadTitle('')
            setUploadCategory(selectedCategory !== 'ALL' ? selectedCategory : '')
            setUploadDescription('')
            setIsUploadOpen(true)
          }}
          className="gap-2 shrink-0 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Загрузить материал</span>
        </Button>
      </div>

      {/* Stats summary bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Всего материалов</p>
              <p className="text-lg font-bold text-foreground">{totalFiles}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Категорий / предметов</p>
              <p className="text-lg font-bold text-foreground">{categories.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Общий объем файлов</p>
              <p className="text-lg font-bold text-foreground">{formatBytes(totalSizeBytes)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию, описанию или имени файла..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-muted-foreground flex items-center gap-1 font-medium mr-1 shrink-0">
            <Filter className="h-3.5 w-3.5" />
            Категория:
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Все ({materials.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Grid / Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : materials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((m) => {
            const isBusy = busyActionId === m.id
            const fileName = m.originalFileName || m.fileName || 'файл'

            return (
              <Card
                key={m.id}
                className="border-border bg-card/60 hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between group"
              >
                <CardContent className="p-4 space-y-3">
                  {/* Top: Category & Actions */}
                  <div className="flex items-start justify-between gap-2">
                    {m.category ? (
                      <Badge variant="secondary" className="text-[11px] font-medium px-2 py-0.5 max-w-[170px] truncate">
                        {m.category}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground px-1.5 py-0">
                        Без категории
                      </Badge>
                    )}

                    <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title="Редактировать описание"
                        onClick={() => handleOpenEdit(m)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Удалить из библиотеки"
                        onClick={() => handleOpenDelete(m)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Title & File details */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-muted/60 border border-border shrink-0 mt-0.5">
                      {getFileIcon(fileName, m.contentType)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        className="font-semibold text-sm text-foreground line-clamp-2 leading-snug cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleOpenPreview(m)}
                        title="Нажмите, чтобы просмотреть"
                      >
                        {m.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5" title={fileName}>
                        {fileName}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {m.description && (
                    <p className="text-xs text-muted-foreground/90 line-clamp-2 bg-muted/30 p-2 rounded-md border border-border/50">
                      {m.description}
                    </p>
                  )}

                  {/* Bottom file metadata */}
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                    <span>{formatBytes(m.sizeBytes ?? m.fileSize)}</span>
                    <span>{formatDate(m.createdAt)}</span>
                  </div>

                  {/* Bottom Action buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1.5 w-full font-medium"
                      onClick={() => handleOpenPreview(m)}
                      disabled={isBusy}
                    >
                      {isBusy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ExternalLink className="h-3.5 w-3.5 text-primary" />
                      )}
                      <span>Открыть</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1.5 w-full font-medium"
                      onClick={() => handleDownload(m)}
                      disabled={isBusy}
                    >
                      <Download className="h-3.5 w-3.5 text-muted-foreground" />
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
        <div className="border border-dashed border-border rounded-2xl p-12 text-center bg-card/30 space-y-4 max-w-lg mx-auto">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <BookOpen className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              {search || selectedCategory !== 'ALL'
                ? 'Материалы не найдены'
                : 'Ваша база знаний пуста'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {search || selectedCategory !== 'ALL'
                ? 'Попробуйте изменить запрос поиска или сбросить фильтр по категориям.'
                : 'Загрузите справочники, сборники тестов или конспекты, чтобы быстро прикреплять их ученикам к урокам и ДЗ.'}
            </p>
          </div>

          <Button
            onClick={() => {
              if (search || selectedCategory !== 'ALL') {
                setSearch('')
                setSelectedCategory('ALL')
              } else {
                setIsUploadOpen(true)
              }
            }}
            className="gap-2 text-xs"
          >
            {search || selectedCategory !== 'ALL' ? (
              'Сбросить фильтры'
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Загрузить первый материал</span>
              </>
            )}
          </Button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Upload Dialog */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-primary" />
              <span>Загрузка материала в Базу знаний</span>
            </DialogTitle>
            <DialogDescription>
              Файл будет сохранен в вашей библиотеке и доступен для быстрой привязки к любым заданиям.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadSubmit} className="space-y-4 py-2">
            {/* Dropzone */}
            <div
              onDragOver={handleUploadDragOver}
              onDragLeave={handleUploadDragLeave}
              onDrop={handleUploadDrop}
              onClick={() => uploadFileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-primary bg-primary/5 scale-[0.99]'
                  : 'border-border hover:border-primary/50 hover:bg-muted/30 bg-muted/10'
              }`}
            >
              <input
                ref={uploadFileInputRef}
                type="file"
                className="hidden"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0]
                  if (file) handleFilePicked(file)
                }}
              />
              <UploadCloud className="h-7 w-7 mx-auto text-muted-foreground mb-1.5" />
              {uploadFile ? (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-primary truncate max-w-xs mx-auto">
                    {uploadFile.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Размер: {formatBytes(uploadFile.size)} • Нажмите, чтобы выбрать другой
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-foreground">
                    Нажмите или перетащите файл сюда
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    PDF, DOCX, изображения, презентации до 50 МБ
                  </p>
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="upload-title">
                Название материала <span className="text-destructive">*</span>
              </Label>
              <Input
                id="upload-title"
                placeholder="Напр., Сборник задач ОГЭ 2026, Таблица тригонометрии"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="upload-category">Категория / Предмет</Label>
              <div className="relative">
                <Input
                  id="upload-category"
                  placeholder="Напр. Математика, Английский, Физика..."
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  list="category-suggestions"
                />
                <datalist id="category-suggestions">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Выберите существующую категорию или введите новую.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="upload-desc">Описание или примечание</Label>
              <Textarea
                id="upload-desc"
                placeholder="Краткое описание, для каких классов или тем подходит..."
                rows={2}
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUploadOpen(false)}
                disabled={createMutation.isPending}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={createMutation.isPending || !uploadFile}>
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {createMutation.isPending ? 'Загрузка...' : 'Сохранить в базу'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* Edit Dialog */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Редактирование материала</DialogTitle>
            <DialogDescription>
              Измените название, предметную категорию или описание материала.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-title">
                Название материала <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-category">Категория / Предмет</Label>
              <Input
                id="edit-category"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                list="category-suggestions-edit"
              />
              <datalist id="category-suggestions-edit">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-desc">Описание</Label>
              <Textarea
                id="edit-desc"
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={updateMutation.isPending}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Сохранить
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* Delete Confirmation Dialog */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Удалить материал?</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить <strong>«{activeMaterial?.title}»</strong> из Базы знаний?
              Файлы, которые уже были прикреплены к созданным домашним заданиям, сохранятся у учеников.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Отмена
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
