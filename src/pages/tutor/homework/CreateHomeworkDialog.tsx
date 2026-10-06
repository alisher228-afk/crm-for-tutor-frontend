import { useState, useEffect, type FormEvent } from 'react'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useLessons } from '@/hooks/useLessons'
import { useCreateHomework, useCreateGroupHomework } from '@/hooks/useHomework'
import { attachmentsApi } from '@/api/attachments'
import { materialsApi } from '@/api/materials'
import { SelectMaterialDialog } from '@/components/SelectMaterialDialog'
import { toBackendDateTime } from '@/lib/dateUtils'
import { toast } from 'sonner'
import {
  Loader2,
  Calendar,
  BookPlus,
  Paperclip,
  UploadCloud,
  FileText,
  X,
  AlertCircle,
  FolderKanban,
  BookOpen,
  Users,
} from 'lucide-react'
import type { Lesson, TeachingMaterial } from '@/types'
import type { AxiosError } from 'axios'

export interface CreateHomeworkDialogProps {
  studentId?: string
  studentName?: string
  groupName?: string
  mode?: 'student' | 'group'
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

function getDefaultDeadline(): string {
  const d = new Date()
  d.setDate(d.getDate() + 3) // 3 days from now
  d.setHours(18, 0, 0, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function CreateHomeworkDialog({
  studentId,
  studentName,
  groupName,
  mode = 'student',
  open,
  onOpenChange,
  onSuccess,
}: CreateHomeworkDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [lessonId, setLessonId] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [selectedMaterials, setSelectedMaterials] = useState<TeachingMaterial[]>([])
  const [isSelectMaterialOpen, setIsSelectMaterialOpen] = useState(false)
  const [isUploadingFiles, setIsUploadingFiles] = useState(false)

  // Fetch student lessons to offer as attachment
  const { data: allLessons = [] } = useLessons()
  const studentLessons = allLessons
    .filter((l: Lesson) => String(l.studentId) === String(studentId))
    .sort(
      (a: Lesson, b: Lesson) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    )
    .slice(0, 15)

  const isGroup = mode === 'group'
  const createMutation = useCreateHomework()
  const createGroupMutation = useCreateGroupHomework()

  useEffect(() => {
    if (open) {
      setTitle('')
      setDescription('')
      setDeadline(getDefaultDeadline())
      setSelectedFiles([])
      setSelectedMaterials([])
      setIsUploadingFiles(false)
      if (!isGroup && studentLessons.length > 0) {
        setLessonId(String(studentLessons[0].id))
      } else {
        setLessonId('')
      }
    }
  }, [open, isGroup, studentLessons.length])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files)
      setSelectedFiles((prev) => [...prev, ...filesArr])
    }
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSelectMaterials = (materials: TeachingMaterial[]) => {
    setSelectedMaterials((prev) => {
      const existingIds = new Set(prev.map((m) => m.id))
      const newItems = materials.filter((m) => !existingIds.has(m.id))
      return [...prev, ...newItems]
    })
  }

  const handleRemoveMaterial = (id: string) => {
    setSelectedMaterials((prev) => prev.filter((m) => m.id !== id))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      toast.error('Введите название домашнего задания')
      return
    }

    const deadlineIso = deadline ? toBackendDateTime(deadline) : undefined

    try {
      if (isGroup) {
        if (!groupName) {
          toast.error('Не выбрана группа для задания')
          return
        }
        const createdList = await createGroupMutation.mutateAsync({
          groupName,
          title: trimmedTitle,
          description: description.trim() || undefined,
          deadline: deadlineIso,
        })

        const hasAttachments = selectedFiles.length > 0 || selectedMaterials.length > 0
        if (hasAttachments && createdList.length > 0) {
          setIsUploadingFiles(true)
          for (const item of createdList) {
            for (const file of selectedFiles) {
              try {
                await attachmentsApi.uploadAttachment(String(item.id), file)
              } catch (e) {
                console.error(e)
              }
            }
            for (const mat of selectedMaterials) {
              try {
                await materialsApi.attachToHomework(String(item.id), String(mat.id))
              } catch (e) {
                console.error(e)
              }
            }
          }
        }
        toast.success(`Задание "${trimmedTitle}" выдано группе "${groupName}" (${createdList.length} уч.)`)
      } else {
        if (!studentId) {
          toast.error('Не выбран ученик')
          return
        }
        const created = await createMutation.mutateAsync({
          studentId: String(studentId),
          title: trimmedTitle,
          description: description.trim() || undefined,
          deadline: deadlineIso,
          lessonId: lessonId ? String(lessonId) : undefined,
        })

        const hasAttachments = selectedFiles.length > 0 || selectedMaterials.length > 0
        if (hasAttachments) {
          setIsUploadingFiles(true)
          let uploadedCount = 0

          // 1. Upload local files
          for (const file of selectedFiles) {
            try {
              await attachmentsApi.uploadAttachment(String(created.id), file)
              uploadedCount++
            } catch (uploadErr) {
              console.error('Failed to upload file:', file.name, uploadErr)
            }
          }

          // 2. Attach materials from knowledge base
          for (const mat of selectedMaterials) {
            try {
              await materialsApi.attachToHomework(String(created.id), String(mat.id))
              uploadedCount++
            } catch (attachErr) {
              console.error('Failed to attach material:', mat.title, attachErr)
            }
          }

          toast.success(
            `Задание создано! Прикреплено материалов: ${uploadedCount} из ${selectedFiles.length + selectedMaterials.length}`,
          )
        } else {
          toast.success(`Задание "${trimmedTitle}" успешно выдано ученику`)
        }
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      const msg =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        'Не удалось выдать задание'
      toast.error(msg)
    } finally {
      setIsUploadingFiles(false)
    }
  }

  const isSubmitting = createMutation.isPending || createGroupMutation.isPending || isUploadingFiles

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {isGroup ? <Users className="h-5 w-5" /> : <BookPlus className="h-5 w-5" />}
            </div>
            <div>
              <DialogTitle>
                {isGroup ? 'Выдать задание группе' : 'Выдать домашнее задание'}
              </DialogTitle>
              <DialogDescription>
                {isGroup ? (
                  <>Для группы <strong className="text-foreground">{groupName}</strong> (будет назначено всем ученикам)</>
                ) : (
                  <>Для ученика <strong className="text-foreground">{studentName || 'ученик'}</strong></>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">
              Название задания <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Напр. Упражнения 1-4 стр. 45, чтение текста"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Associated Lesson */}
          {!isGroup && (
            studentLessons.length === 0 ? (
              <div className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-900/50 dark:bg-blue-950/20 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-semibold">У ученика пока нет уроков в расписании</p>
                  <p className="mt-0.5 text-muted-foreground">
                    Задание будет автоматически привязано к ученику (к занятию в расписании).
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="lessonId" className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Привязать к уроку</span>
                </Label>

                <select
                  id="lessonId"
                  value={lessonId}
                  onChange={(e) => setLessonId(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors outline-none focus:border-ring focus:ring-1 focus:ring-ring dark:bg-input/30"
                >
                  <option value="" className="dark:bg-zinc-900">
                    Автоматически (к последнему уроку или новому)
                  </option>
                  {studentLessons.map((l) => {
                    const dateFormatted = new Date(l.startTime).toLocaleDateString(
                      'ru-RU',
                      {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    )
                    const topicFormatted = l.topic ? `— ${l.topic}` : ''
                    return (
                      <option key={l.id} value={l.id} className="dark:bg-zinc-900">
                        {dateFormatted} {topicFormatted}
                      </option>
                    )
                  })}
                </select>
              </div>
            )
          )}

          {/* Deadline */}
          <div className="space-y-1.5">
            <Label htmlFor="deadline">Срок сдачи (дедлайн)</Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Описание и инструкции</Label>
            <Textarea
              id="description"
              placeholder="Подробные указания к заданию, ссылки на учебник, правила оформления..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* File & Material Attachments Section */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5 text-xs font-semibold">
                <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Прикрепить материалы / файлы</span>
                {(selectedFiles.length > 0 || selectedMaterials.length > 0) && (
                  <span className="text-primary font-normal">
                    ({selectedFiles.length + selectedMaterials.length})
                  </span>
                )}
              </Label>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSelectMaterialOpen(true)}
                disabled={isSubmitting}
                className="h-7 text-xs gap-1.5 text-primary hover:text-primary hover:bg-primary/10 border-primary/30"
              >
                <FolderKanban className="h-3.5 w-3.5" />
                <span>Из Базы знаний</span>
              </Button>
            </div>

            {/* Dropzone for local files */}
            <div className="border border-dashed border-border rounded-lg p-3 text-center bg-muted/20 hover:bg-muted/40 transition-colors relative cursor-pointer">
              <input
                type="file"
                multiple
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onChange={handleFileChange}
                disabled={isSubmitting}
              />
              <UploadCloud className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs font-medium text-foreground">
                Нажмите или перетащите файлы сюда с компьютера
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                PDF, Word, фото заданий, сканы
              </p>
            </div>

            {/* Selected Materials from Knowledge Base */}
            {selectedMaterials.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Выбрано из Базы знаний ({selectedMaterials.length})
                </p>
                {selectedMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className="flex items-center justify-between p-2 rounded-md bg-primary/5 border border-primary/20 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <BookOpen className="h-4 w-4 text-primary shrink-0" />
                      <div className="min-w-0 flex items-center gap-1.5 truncate">
                        <span className="truncate font-medium text-foreground">
                          {mat.title}
                        </span>
                        {mat.category && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary/10 text-primary shrink-0">
                            {mat.category}
                          </span>
                        )}
                        <span className="text-muted-foreground shrink-0 text-[11px]">
                          ({(((mat.sizeBytes || mat.fileSize || 0)) / 1024).toFixed(1)} КБ)
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => handleRemoveMaterial(mat.id)}
                      disabled={isSubmitting}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Local Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Файлы с компьютера ({selectedFiles.length})
                </p>
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/40 border border-border text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate font-medium">{file.name}</span>
                      <span className="text-muted-foreground shrink-0 text-[11px]">
                        ({(file.size / 1024).toFixed(1)} КБ)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => handleRemoveFile(idx)}
                      disabled={isSubmitting}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isUploadingFiles ? 'Загрузка файлов...' : 'Выдать задание'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <SelectMaterialDialog
        open={isSelectMaterialOpen}
        onOpenChange={setIsSelectMaterialOpen}
        onSelectMaterials={handleSelectMaterials}
        initialSelectedIds={selectedMaterials.map((m) => m.id)}
      />
    </Dialog>
  )
}
