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
import { useCreateHomework } from '@/hooks/useHomework'
import { toast } from 'sonner'
import { Loader2, Calendar, BookPlus } from 'lucide-react'
import type { Lesson } from '@/types'
import type { AxiosError } from 'axios'

interface CreateHomeworkDialogProps {
  studentId: string
  studentName: string
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
  open,
  onOpenChange,
  onSuccess,
}: CreateHomeworkDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [lessonId, setLessonId] = useState('')

  // Fetch student lessons to offer as attachment
  const { data: allLessons = [] } = useLessons()
  const studentLessons = allLessons
    .filter((l: Lesson) => l.studentId === studentId)
    .sort(
      (a: Lesson, b: Lesson) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    )
    .slice(0, 10) // 10 most recent

  const createMutation = useCreateHomework()

  useEffect(() => {
    if (open) {
      setTitle('')
      setDescription('')
      setDeadline(getDefaultDeadline())
      setLessonId('')
    }
  }, [open])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      toast.error('Введите название домашнего задания')
      return
    }

    let deadlineIso: string | undefined
    if (deadline) {
      const d = new Date(deadline)
      if (!isNaN(d.getTime())) {
        deadlineIso = d.toISOString()
      }
    }

    try {
      await createMutation.mutateAsync({
        studentId,
        title: trimmedTitle,
        description: description.trim() || undefined,
        deadline: deadlineIso,
        lessonId: lessonId || undefined,
      })

      toast.success(`Задание "${trimmedTitle}" успешно выдано ученику`)
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      const msg =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        'Не удалось выдать задание'
      toast.error(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Выдать домашнее задание</DialogTitle>
              <DialogDescription>
                Для ученика <strong className="text-foreground">{studentName}</strong>
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
              disabled={createMutation.isPending}
              required
            />
          </div>

          {/* Associated Lesson */}
          <div className="space-y-1.5">
            <Label htmlFor="lessonId" className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Связать с уроком (необязательно)</span>
            </Label>

            <select
              id="lessonId"
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              disabled={createMutation.isPending}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors outline-none focus:border-ring focus:ring-1 focus:ring-ring dark:bg-input/30"
            >
              <option value="">Без привязки к уроку</option>
              {studentLessons.map((l) => {
                const dateFormatted = new Date(l.startTime).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'short',
                })
                const topicFormatted = l.topic ? `— ${l.topic}` : ''
                return (
                  <option key={l.id} value={l.id} className="dark:bg-zinc-900">
                    {dateFormatted} {topicFormatted}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Deadline */}
          <div className="space-y-1.5">
            <Label htmlFor="deadline">Срок сдачи (дедлайн)</Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              disabled={createMutation.isPending}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Описание и инструкции</Label>
            <Textarea
              id="description"
              placeholder="Подробные указания к заданию, ссылки на учебник, правила оформления..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={createMutation.isPending}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Выдать задание
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
