import { useState } from 'react'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useUpdateStudent, studentKeys } from '@/hooks/useStudents'
import { useTranslation } from '@/i18n'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Users, Loader2, Check } from 'lucide-react'
import type { StudentProfile } from '@/types'

interface CreateGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  individualStudents: StudentProfile[]
  onSuccess?: (groupName: string) => void
}

export function CreateGroupDialog({
  open,
  onOpenChange,
  individualStudents,
  onSuccess,
}: CreateGroupDialogProps) {
  const { t, language } = useTranslation()
  const numLocale = language === 'en' ? 'en-US' : language === 'kk' ? 'kk-KZ' : 'ru-RU'

  const [groupName, setGroupName] = useState('')
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateMutation = useUpdateStudent()
  const queryClient = useQueryClient()

  const handleToggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleSelectAll = () => {
    if (selectedStudentIds.length === individualStudents.length) {
      setSelectedStudentIds([])
    } else {
      setSelectedStudentIds(individualStudents.map((s) => s.id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = groupName.trim()
    if (!trimmed) {
      toast.error(t('tutor_students.err_group_name_req'))
      return
    }

    setIsSubmitting(true)
    try {
      // If students were selected, update their groupName
      if (selectedStudentIds.length > 0) {
        const promises = selectedStudentIds.map((id) => {
          const student = individualStudents.find((s) => s.id === id)
          if (!student) return Promise.resolve()
          return updateMutation.mutateAsync({
            id: student.id,
            data: {
              firstName: student.firstName || student.name?.split(' ')[0] || t('tutor_students.default_student_name'),
              lastName: student.lastName || student.name?.split(' ').slice(1).join(' ') || undefined,
              phone: student.phone || undefined,
              telegram: student.telegram || undefined,
              currentLevel: student.currentLevel || undefined,
              hourlyRate: student.hourlyRate,
              notes: student.notes || undefined,
              groupName: trimmed,
              status: student.status || 'ACTIVE',
            },
          })
        })
        await Promise.all(promises)
      }

      await queryClient.invalidateQueries({ queryKey: studentKeys.all })
      toast.success(
        selectedStudentIds.length > 0
          ? t('tutor_groups.toast_group_created_with_students', { name: trimmed, count: selectedStudentIds.length })
          : t('tutor_groups.toast_group_created', { name: trimmed }),
      )
      setGroupName('')
      setSelectedStudentIds([])
      onOpenChange(false)
      onSuccess?.(trimmed)
    } catch (err) {
      toast.error(t('tutor_groups.toast_group_create_err'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{t('tutor_groups.create_dialog_title')}</DialogTitle>
              <DialogDescription>
                {t('tutor_groups.create_dialog_desc')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="create-group-name">
              {t('tutor_groups.create_label_name')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="create-group-name"
              placeholder={t('tutor_groups.create_placeholder_name')}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              disabled={isSubmitting}
              autoFocus
              required
            />
          </div>

          {/* Select individual students */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">
                {t('tutor_groups.create_label_add_students')}
              </Label>
              {individualStudents.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs text-primary hover:underline"
                >
                  {selectedStudentIds.length === individualStudents.length
                    ? t('tutor_groups.create_btn_unselect_all')
                    : t('tutor_groups.create_btn_select_all')}
                </button>
              )}
            </div>

            {individualStudents.length > 0 ? (
              <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-lg border border-border p-2 bg-muted/20">
                {individualStudents.map((student) => {
                  const fullName =
                    student.name ||
                    [student.firstName, student.lastName].filter(Boolean).join(' ') ||
                    t('tutor_students.default_student_name')
                  const isChecked = selectedStudentIds.includes(student.id)

                  return (
                    <div
                      key={student.id}
                      onClick={() => handleToggleStudent(student.id)}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-primary/10 border border-primary/20 text-foreground'
                          : 'hover:bg-muted/50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar size="sm">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {fullName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-medium text-foreground">{fullName}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {student.currentLevel ? `${student.currentLevel} • ` : ''}
                            {student.hourlyRate
                              ? t('tutor_students.per_hour', { rate: student.hourlyRate.toLocaleString(numLocale) })
                              : t('tutor_students.format_individual')}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`h-5 w-5 rounded flex items-center justify-center border transition-colors ${
                          isChecked
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-muted-foreground/30 bg-background'
                        }`}
                      >
                        {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic p-3 text-center border border-dashed rounded-lg">
                {t('tutor_groups.create_no_individuals')}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('tutor_students.btn_cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting || !groupName.trim()}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('tutor_groups.create_btn_submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
