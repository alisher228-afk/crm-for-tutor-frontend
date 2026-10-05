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
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useUpdateStudent } from '@/hooks/useStudents'
import { toast } from 'sonner'
import { Users, Loader2 } from 'lucide-react'
import type { StudentProfile } from '@/types'
import type { AxiosError } from 'axios'

interface MoveStudentGroupDialogProps {
  student: StudentProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
  existingGroups: string[]
  onSuccess?: () => void
}

export function MoveStudentGroupDialog({
  student,
  open,
  onOpenChange,
  existingGroups,
  onSuccess,
}: MoveStudentGroupDialogProps) {
  const [targetType, setTargetType] = useState<'existing' | 'new' | 'individual'>('existing')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [newGroupName, setNewGroupName] = useState('')

  const updateMutation = useUpdateStudent()

  const currentGroup = student?.groupName?.trim() || null
  const studentName = student
    ? [student.firstName, student.lastName].filter(Boolean).join(' ') || student.name || 'Ученик'
    : 'Ученик'

  // Filter available other groups
  const otherGroups = existingGroups.filter((g) => g !== currentGroup)

  useEffect(() => {
    if (open) {
      if (otherGroups.length > 0) {
        setTargetType('existing')
        setSelectedGroup(otherGroups[0])
      } else {
        setTargetType('new')
        setSelectedGroup('')
      }
      setNewGroupName('')
    }
  }, [open, currentGroup])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!student) return

    const finalGroupName =
      targetType === 'existing'
        ? selectedGroup.trim()
        : targetType === 'new'
        ? newGroupName.trim()
        : ''

    if (targetType === 'existing' && !selectedGroup.trim()) {
      toast.error('Выберите группу для переноса')
      return
    }

    if (targetType === 'new' && !newGroupName.trim()) {
      toast.error('Введите название новой группы')
      return
    }

    const currentNormalized = currentGroup || ''
    if (finalGroupName === currentNormalized) {
      toast.info(finalGroupName ? 'Ученик уже находится в этой группе' : 'Ученик уже учится индивидуально')
      onOpenChange(false)
      return
    }

    try {
      await updateMutation.mutateAsync({
        id: student.id,
        data: {
          firstName: student.firstName || student.name?.split(' ')[0] || 'Ученик',
          lastName: student.lastName || student.name?.split(' ').slice(1).join(' ') || undefined,
          phone: student.phone || undefined,
          telegram: student.telegram || undefined,
          currentLevel: student.currentLevel || undefined,
          hourlyRate: student.hourlyRate,
          notes: student.notes || undefined,
          groupName: finalGroupName,
          status: student.status || 'ACTIVE',
        },
      })

      if (finalGroupName) {
        toast.success(`Ученик ${studentName} успешно переведён в группу "${finalGroupName}"`)
      } else {
        toast.success(`Ученик ${studentName} переведён на индивидуальный формат`)
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      const msg =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        'Не удалось перенести ученика. Попробуйте еще раз.'
      toast.error(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Перенести ученика в группу</DialogTitle>
              <DialogDescription>
                Изменение группы или формата занятий для ученика
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Current Status Info */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
            <div>
              <p className="font-semibold text-sm text-foreground">{studentName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Текущее распределение:</p>
            </div>
            <div>
              {currentGroup ? (
                <Badge variant="secondary" className="font-medium">
                  {currentGroup}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Индивидуально
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-semibold">Куда перенести:</Label>

            {/* Radio / Options */}
            <div className="space-y-2">
              {otherGroups.length > 0 && (
                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  targetType === 'existing'
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border hover:bg-muted/40 text-muted-foreground'
                }`}>
                  <input
                    type="radio"
                    name="targetType"
                    checked={targetType === 'existing'}
                    onChange={() => setTargetType('existing')}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">В существующую группу</p>
                    {targetType === 'existing' && (
                      <select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        className="mt-2 w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus:ring-1 focus:ring-primary"
                      >
                        {otherGroups.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </label>
              )}

              <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                targetType === 'new'
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border hover:bg-muted/40 text-muted-foreground'
              }`}>
                <input
                  type="radio"
                  name="targetType"
                  checked={targetType === 'new'}
                  onChange={() => setTargetType('new')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Создать новую группу</p>
                  {targetType === 'new' && (
                    <Input
                      placeholder="Например: Группа B / ЕГЭ 11 класс"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="mt-2 text-sm"
                      autoFocus
                    />
                  )}
                </div>
              </label>

              {currentGroup && (
                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  targetType === 'individual'
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border hover:bg-muted/40 text-muted-foreground'
                }`}>
                  <input
                    type="radio"
                    name="targetType"
                    checked={targetType === 'individual'}
                    onChange={() => setTargetType('individual')}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">Перевести на индивидуальный формат</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Ученик выйдет из группы и будет учиться отдельно</p>
                  </div>
                </label>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Перенести
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
