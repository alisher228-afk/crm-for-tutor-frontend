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
import { useCreateStudent, useUpdateStudent } from '@/hooks/useStudents'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import type { StudentProfile } from '@/types'
import type { AxiosError } from 'axios'

interface StudentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: StudentProfile | null
  defaultFormat?: 'INDIVIDUAL' | 'GROUP'
  defaultGroupName?: string
  onSuccess?: (student: StudentProfile) => void
}

export function StudentFormDialog({
  open,
  onOpenChange,
  initialData,
  defaultFormat,
  defaultGroupName,
  onSuccess,
}: StudentFormDialogProps) {

  const isEditing = Boolean(initialData?.id)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [telegram, setTelegram] = useState('')
  const [currentLevel, setCurrentLevel] = useState('')
  const [hourlyRate, setHourlyRate] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [studyFormat, setStudyFormat] = useState<'INDIVIDUAL' | 'GROUP'>('INDIVIDUAL')
  const [groupName, setGroupName] = useState('')

  const createMutation = useCreateStudent()
  const updateMutation = useUpdateStudent()

  const isPending = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFirstName(initialData.firstName || initialData.name?.split(' ')[0] || '')
        setLastName(
          initialData.lastName ||
            (initialData.name?.split(' ').slice(1).join(' ') ?? ''),
        )
        setPhone(initialData.phone || '')
        setTelegram(initialData.telegram || '')
        setCurrentLevel(initialData.currentLevel || '')
        setHourlyRate(
          initialData.hourlyRate !== undefined ? String(initialData.hourlyRate) : '',
        )
        setNotes(initialData.notes || '')
        if (initialData.groupName && initialData.groupName.trim()) {
          setStudyFormat('GROUP')
          setGroupName(initialData.groupName.trim())
        } else {
          setStudyFormat('INDIVIDUAL')
          setGroupName('')
        }
      } else {
        setFirstName('')
        setLastName('')
        setPhone('')
        setTelegram('')
        setCurrentLevel('')
        setHourlyRate('')
        setNotes('')
        setStudyFormat(defaultFormat || (defaultGroupName ? 'GROUP' : 'INDIVIDUAL'))
        setGroupName(defaultGroupName || '')
      }
    }
  }, [open, initialData, defaultFormat, defaultGroupName])


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const trimmedFirstName = firstName.trim()
    if (!trimmedFirstName) {
      toast.error('Имя ученика обязательно для заполнения')
      return
    }

    if (studyFormat === 'GROUP' && !groupName.trim()) {
      toast.error('Укажите название группы для группового формата')
      return
    }

    const payload = {
      firstName: trimmedFirstName,
      lastName: lastName.trim() || undefined,
      phone: phone.trim() || undefined,
      telegram: telegram.trim() || undefined,
      currentLevel: currentLevel.trim() || undefined,
      hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
      groupName: studyFormat === 'GROUP' && groupName.trim() ? groupName.trim() : '',
      notes: notes.trim() || undefined,
    }

    try {
      if (isEditing && initialData?.id) {
        const updated = await updateMutation.mutateAsync({
          id: initialData.id,
          data: {
            ...payload,
            status: initialData.status || 'ACTIVE',
          },
        })
        toast.success('Данные ученика успешно обновлены')
        onOpenChange(false)
        onSuccess?.(updated)
      } else {
        const created = await createMutation.mutateAsync(payload)
        toast.success('Ученик успешно добавлен')
        onOpenChange(false)
        onSuccess?.(created)
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      const msg =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        (isEditing ? 'Не удалось обновить ученика' : 'Не удалось добавить ученика')
      toast.error(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Редактировать ученика' : 'Добавить нового ученика'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Измените контактные данные, уровень или ставку ученика'
              : 'Заполните основную информацию для создания карточки ученика'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">
                Имя <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                placeholder="Иван"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isPending}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lastName">Фамилия</Label>
              <Input
                id="lastName"
                placeholder="Иванов"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (999) 000-00-00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="telegram">Telegram</Label>
              <Input
                id="telegram"
                placeholder="@username"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="currentLevel">Уровень подготовки</Label>
              <Input
                id="currentLevel"
                placeholder="Напр. B1 / 9 класс"
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value)}
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hourlyRate">Ставка за урок</Label>
              <Input
                id="hourlyRate"
                type="number"
                min="0"
                step="any"
                placeholder="1500"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          {/* Format & Group */}
          <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
            <Label className="text-xs font-semibold">Формат занятий</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={studyFormat === 'INDIVIDUAL' ? 'default' : 'outline'}
                size="sm"
                className="w-full text-xs"
                onClick={() => setStudyFormat('INDIVIDUAL')}
              >
                Индивидуально
              </Button>
              <Button
                type="button"
                variant={studyFormat === 'GROUP' ? 'default' : 'outline'}
                size="sm"
                className="w-full text-xs"
                onClick={() => setStudyFormat('GROUP')}
              >
                В группе
              </Button>
            </div>

            {studyFormat === 'GROUP' && (
              <div className="space-y-1.5 pt-1.5">
                <Label htmlFor="groupName" className="text-xs">
                  Название группы <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="groupName"
                  placeholder="Например: Группа A / Английский B1"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  disabled={isPending}
                  required={studyFormat === 'GROUP'}
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Заметки / Цели обучения</Label>
            <Textarea
              id="notes"
              placeholder="Дополнительная информация, цели, особенности расписания..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isPending}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Сохранить изменения' : 'Добавить ученика'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
