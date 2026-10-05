import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useMaterials, useMaterialCategories } from '@/hooks/useMaterials'
import {
  FolderKanban,
  Search,
  Check,
  FileText,
  FileImage,
  FileArchive,
  FileCode,
  File,
  Loader2,
  HardDrive,
} from 'lucide-react'
import type { TeachingMaterial } from '@/types'

interface SelectMaterialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm?: (materials: TeachingMaterial[]) => Promise<void> | void
  onSelectMaterials?: (materials: TeachingMaterial[]) => Promise<void> | void
  alreadySelectedIds?: string[]
  initialSelectedIds?: string[]
  multiSelect?: boolean
  isPending?: boolean
}

function formatBytes(bytes?: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 Б'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
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

export function SelectMaterialDialog({
  open,
  onOpenChange,
  onConfirm,
  onSelectMaterials,
  alreadySelectedIds = [],
  initialSelectedIds = [],
  multiSelect = true,
  isPending = false,
}: SelectMaterialDialogProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const combinedAlreadySelected = alreadySelectedIds.length > 0 ? alreadySelectedIds : initialSelectedIds

  useEffect(() => {
    if (open) {
      setSearch('')
      setSelectedCategory('ALL')
      setSelectedIds([])
    }
  }, [open])

  const { data: materials = [], isLoading } = useMaterials(search, selectedCategory)
  const { data: categories = [] } = useMaterialCategories()

  const handleToggle = (material: TeachingMaterial) => {
    if (combinedAlreadySelected.includes(material.id)) return

    if (!multiSelect) {
      setSelectedIds([material.id])
      return
    }

    setSelectedIds((prev) =>
      prev.includes(material.id)
        ? prev.filter((id) => id !== material.id)
        : [...prev, material.id],
    )
  }

  const handleConfirm = async () => {
    const selected = materials.filter((m) => selectedIds.includes(m.id))
    const callback = onSelectMaterials || onConfirm
    if (callback) {
      await callback(selected)
    }
    setSelectedIds([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Выбрать из Базы знаний</DialogTitle>
              <DialogDescription>
                Прикрепите ранее сохранённые учебники, таблицы формул и тесты в 1 клик
              </DialogDescription>
            </div>
          </div>

          {/* Search bar & Category filter */}
          <div className="space-y-2 pt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию или описанию..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs sm:text-sm"
              />
            </div>

            {categories.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0 ${
                    selectedCategory === 'ALL'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Все ({categories.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Materials List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : materials.length > 0 ? (
            materials.map((m) => {
              const isSelected = selectedIds.includes(m.id)
              const isAlready = alreadySelectedIds.includes(m.id)

              return (
                <div
                  key={m.id}
                  onClick={() => !isAlready && handleToggle(m)}
                  className={`flex items-start justify-between p-3 rounded-xl border transition-all cursor-pointer gap-3 ${
                    isAlready
                      ? 'opacity-50 border-border bg-muted/20 cursor-not-allowed'
                      : isSelected
                      ? 'border-primary bg-primary/5 shadow-xs'
                      : 'border-border bg-card/60 hover:border-primary/40 hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="mt-0.5">{getFileIcon(m.originalFileName, m.contentType)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {m.title}
                        </p>
                        {m.category && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {m.category}
                          </Badge>
                        )}
                        {isAlready && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            Уже прикреплен
                          </Badge>
                        )}
                      </div>

                      {m.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {m.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
                        <span className="truncate">{m.originalFileName}</span>
                        <span>•</span>
                        <span>{formatBytes(m.sizeBytes)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 shrink-0">
                    <div
                      className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input bg-background'
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-12 text-muted-foreground space-y-2">
              <HardDrive className="h-8 w-8 mx-auto opacity-50" />
              <p className="text-sm font-medium">Материалы не найдены</p>
              <p className="text-xs max-w-xs mx-auto">
                Добавьте учебные пособия, таблицы и файлы в разделе «База знаний»
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="p-4 border-t border-border flex items-center justify-between sm:justify-between bg-muted/10">
          <div className="text-xs text-muted-foreground">
            Выбрано: <strong className="text-foreground">{selectedIds.length}</strong>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Отмена
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
              disabled={selectedIds.length === 0 || isPending}
            >
              {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Прикрепить ({selectedIds.length})
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
