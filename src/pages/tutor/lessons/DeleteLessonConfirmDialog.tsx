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
import { useLanguage } from '@/i18n'

interface DeleteLessonConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lesson: Lesson | null
  sessionLessons?: Lesson[]
  onSuccess?: () => void
}

export function DeleteLessonConfirmDialog({
  open,
  onOpenChange,
  lesson,
  sessionLessons,
  onSuccess,
}: DeleteLessonConfirmDialogProps) {
  const { t } = useLanguage()
  const deleteMutation = useDeleteLesson()

  const handleDelete = async () => {
    if (!lesson?.id) return

    try {
      if (sessionLessons && sessionLessons.length > 1) {
        await Promise.all(sessionLessons.map((l) => deleteMutation.mutateAsync(l.id)))
        toast.success(
          t('tutor_lessons.toast_deleted_group', { count: sessionLessons.length }),
        )
      } else {
        await deleteMutation.mutateAsync(lesson.id)
        toast.success(t('tutor_lessons.toast_deleted_indiv'))
      }
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      toast.error(
        axiosError.response?.data?.message || t('tutor_lessons.toast_delete_err'),
      )
    }
  }

  const isGroup = Boolean(lesson?.groupName?.trim())
  const studentName =
    lesson?.studentName ||
    [lesson?.studentFirstName, lesson?.studentLastName].filter(Boolean).join(' ') ||
    t('tutor_lessons.default_student')

  const topicClause = lesson?.topic
    ? t('tutor_lessons.topic_clause', { topic: lesson.topic })
    : ''

  const countClause =
    sessionLessons && sessionLessons.length > 0
      ? ` (${sessionLessons.length} ${
          sessionLessons.length === 1
            ? t('tutor_lessons.student_noun_1')
            : sessionLessons.length < 5
            ? t('tutor_lessons.student_noun_few')
            : t('tutor_lessons.student_noun_many')
        })`
      : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            <DialogTitle>
              {isGroup
                ? t('tutor_lessons.modal_title_group')
                : t('tutor_lessons.modal_title_indiv')}
            </DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {isGroup
              ? t('tutor_lessons.modal_desc_group', {
                  group: lesson?.groupName || '',
                  count: countClause,
                  topic: topicClause,
                })
              : t('tutor_lessons.modal_desc_indiv', {
                  student: studentName,
                  topic: topicClause,
                })}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            {t('tutor_lessons.btn_cancel')}
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
            {t('tutor_lessons.btn_delete_confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
