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
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useUpdateStudent, studentKeys } from '@/hooks/useStudents'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Users, Loader2, Check, UserPlus } from 'lucide-react'
import type { StudentProfile } from '@/types'

interface AddStudentToGroupModalProps {
  groupName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  availableStudents: StudentProfile[]
  onCreateNewStudent: (groupName: string) => void
  onSuccess?: () => void
}

export function AddStudentToGroupModal({
  groupName,
  open,
  onOpenChange,
  availableStudents,
  onCreateNewStudent,
  onSuccess,
}: AddStudentToGroupModalProps) {
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateMutation = useUpdateStudent()
  const queryClient = useQueryClient()

  // Filter out students who are already in this group
  const nonGroupStudents = availableStudents.filter(
    (s) => s.groupName?.trim() !== groupName.trim(),
  )

  const handleToggle = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedStudentIds.length === 0) {
      toast.error('Выберите хотя бы одного ученика для добавления')
      return
    }

    setIsSubmitting(true)
    try {
      const promises = selectedStudentIds.map((id) => {
        const student = nonGroupStudents.find((s) => s.id === id)
        if (!student) return Promise.resolve()
        return updateMutation.mutateAsync({
          id: student.id,
          data: {
            firstName: student.firstName || student.name?.split(' ')[0] || 'Ученик',
            lastName: student.lastName || student.name?.split(' ').slice(1).join(' ') || undefined,
            phone: student.phone || undefined,
            telegram: student.telegram || undefined,
            currentLevel: student.currentLevel || undefined,
            hourlyRate: student.hourlyRate,
            notes: student.notes || undefined,
            groupName: groupName.trim(),
            status: student.status || 'ACTIVE',
          },
        })
      })

      await Promise.all(promises)
      await queryClient.invalidateQueries({ queryKey: studentKeys.all })

      toast.success(`В группу "${groupName}" добавлено учеников: ${selectedStudentIds.length}`)
      setSelectedStudentIds([])
      onOpenChange(false)
      onSuccess?.()
    } catch {
      toast.error('Не удалось добавить учеников в группу')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateNewClick = () => {
    onOpenChange(false)
    onCreateNewStudent(groupName)
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
              <DialogTitle>Добавить ученика в группу</DialogTitle>
              <DialogDescription>
                Группа: <strong className="text-foreground">{groupName}</strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">Выберите из базы:</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-primary gap-1"
              onClick={handleCreateNewClick}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Создать нового ученика</span>
            </Button>
          </div>

          {nonGroupStudents.length > 0 ? (
            <div className="max-h-60 overflow-y-auto space-y-1.5 rounded-lg border border-border p-2 bg-muted/20">
              {nonGroupStudents.map((student) => {
                const fullName =
                  student.name ||
                  [student.firstName, student.lastName].filter(Boolean).join(' ') ||
                  'Ученик'
                const isChecked = selectedStudentIds.includes(student.id)
                const currentGrp = student.groupName?.trim()

                return (
                  <div
                    key={student.id}
                    onClick={() => handleToggle(student.id)}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-primary/10 border border-primary/20 text-foreground'
                        : 'hover:bg-muted/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar size="sm">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="truncate">
                        <p className="text-xs font-medium text-foreground truncate">{fullName}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {currentGrp ? `Сейчас в: ${currentGrp}` : 'Индивидуально'}
                          {student.currentLevel ? ` • ${student.currentLevel}` : ''}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`h-5 w-5 shrink-0 ml-2 rounded flex items-center justify-center border transition-colors ${
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
            <div className="text-center py-6 border border-dashed rounded-lg">
              <p className="text-xs text-muted-foreground mb-3">
                Все ваши ученики уже состоят в этой группе.
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={handleCreateNewClick}
              >
                <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                Зарегистрировать нового ученика
              </Button>
            </div>
          )}

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
              disabled={isSubmitting || selectedStudentIds.length === 0}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Добавить ({selectedStudentIds.length})
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
