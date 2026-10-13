import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useArchiveStudent } from '@/hooks/useStudents'
import { useTranslation } from '@/i18n'
import { toast } from 'sonner'
import { AlertTriangle, Loader2 } from 'lucide-react'
import type { StudentProfile } from '@/types'
import type { AxiosError } from 'axios'

interface ArchiveConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: StudentProfile | null
  onSuccess?: () => void
}

export function ArchiveConfirmDialog({
  open,
  onOpenChange,
  student,
  onSuccess,
}: ArchiveConfirmDialogProps) {
  const { t } = useTranslation()
  const archiveMutation = useArchiveStudent()

  const studentName =
    student?.name ||
    [student?.firstName, student?.lastName].filter(Boolean).join(' ') ||
    t('tutor_students.default_student_name')

  const handleArchive = async () => {
    if (!student?.id) return

    try {
      await archiveMutation.mutateAsync(student.id)
      toast.success(t('tutor_students.toast_archived_success', { name: studentName }))
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      toast.error(
        axiosError.response?.data?.message || t('tutor_students.toast_archive_err'),
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>{t('tutor_students.archive_modal_title')}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {t('tutor_students.archive_modal_desc', { name: studentName })}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={archiveMutation.isPending}
          >
            {t('tutor_students.btn_cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleArchive}
            disabled={archiveMutation.isPending}
          >
            {archiveMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t('tutor_students.btn_archive_confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
