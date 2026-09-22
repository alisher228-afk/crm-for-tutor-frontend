import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDeleteLesson } from '@/hooks/useLessons'
import { toast } from 'sonner'
import { Trash2, Loader2 } from 'lucide-react'
import type { Lesson } from '@/types'
import type { AxiosError } from 'axios'

interface DeleteLessonConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lesson: Lesson | null
  onSuccess?: () => void
}

export function DeleteLessonConfirmDialog({
  open,
  onOpenChange,
  lesson,
  onSuccess,
}: DeleteLessonConfirmDialogProps) {
  const deleteMutation = useDeleteLesson()

  const handleDelete = async () => {
    if (!lesson?.id) return

    try {
      await deleteMutation.mutateAsync(lesson.id)
      toast.success('Урок успешно удален')
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      toast.error(
        axiosError.response?.data?.message || 'Не удалось удалить урок',
      )
    }
  }

  const studentName = lesson?.studentName || 'ученика'
  const lessonTopic = lesson?.topic ? `по теме "${lesson.topic}"` : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            <DialogTitle>Удалить занятие?</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Вы собираетесь удалить урок для {studentName} {lessonTopic}.
            Это действие нельзя будет отменить.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Отмена
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Удалить урок
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
