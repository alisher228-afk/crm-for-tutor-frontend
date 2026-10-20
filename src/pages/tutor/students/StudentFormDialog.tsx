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
import { useTranslation } from '@/i18n'
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
  const { t } = useTranslation()
  const isEditing = Boolean(initialData?.id)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [telegram, setTelegram] = useState('')
  const [currentLevel, setCurrentLevel] = useState('')
  const [hourlyRate, setHourlyRate] = useState<string>('')
  const [lessonBalance, setLessonBalance] = useState<string>('')
  const [recalculatedHint, setRecalculatedHint] = useState<string | null>(null)
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
          initialData.hourlyRate != null ? String(initialData.hourlyRate) : '',
        )
        setLessonBalance(
          initialData.lessonBalance != null
            ? String(initialData.lessonBalance)
            : initialData.balance != null
              ? String(initialData.balance)
              : '',
        )
        setRecalculatedHint(null)
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
        setLessonBalance('')
        setRecalculatedHint(null)
        setNotes('')
        setStudyFormat(defaultFormat || (defaultGroupName ? 'GROUP' : 'INDIVIDUAL'))
        setGroupName(defaultGroupName || '')
      }
    }
  }, [open, initialData, defaultFormat, defaultGroupName])

  const handleHourlyRateChange = (newVal: string) => {
    setHourlyRate(newVal)
    const newRateNum = Number(newVal)
    const oldRateNum = Number(initialData?.hourlyRate || 0)
    const curBal = initialData?.lessonBalance ?? initialData?.balance ?? 0

    if (
      isEditing &&
      curBal !== 0 &&
      newRateNum > 0 &&
      oldRateNum > 0 &&
      oldRateNum !== newRateNum
    ) {
      const newBal = Math.round((curBal * oldRateNum) / newRateNum)
      setLessonBalance(String(newBal))
      setRecalculatedHint(
        t('tutor_students.recalculated_balance_hint', {
          oldBal: curBal,
          newBal,
        }) || `Баланс синхронизирован по новой ставке: ${curBal} ур. ➔ ${newBal} ур.`,
      )
    } else {
      setRecalculatedHint(null)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const trimmedFirstName = firstName.trim()
    if (!trimmedFirstName) {
      toast.error(t('tutor_students.err_first_name_req'))
      return
    }

    if (studyFormat === 'GROUP' && !groupName.trim()) {
      toast.error(t('tutor_students.err_group_name_req'))
      return
    }

    const payload = {
      firstName: trimmedFirstName,
      lastName: lastName.trim() || undefined,
      phone: phone.trim() || undefined,
      telegram: telegram.trim() || undefined,
      currentLevel: currentLevel.trim() || undefined,
      hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
      lessonBalance: lessonBalance !== '' ? Number(lessonBalance) : undefined,
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
        toast.success(t('tutor_students.toast_updated'))
        onOpenChange(false)
        onSuccess?.(updated)
      } else {
        const created = await createMutation.mutateAsync(payload)
        toast.success(t('tutor_students.toast_created'))
        onOpenChange(false)
        onSuccess?.(created)
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      const msg =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        (isEditing ? t('tutor_students.toast_update_err') : t('tutor_students.toast_create_err'))
      toast.error(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('tutor_students.form_title_edit') : t('tutor_students.form_title_create')}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('tutor_students.form_desc_edit')
              : t('tutor_students.form_desc_create')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">
                {t('tutor_students.label_first_name')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                placeholder={t('tutor_students.placeholder_first_name')}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isPending}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lastName">{t('tutor_students.label_last_name')}</Label>
              <Input
                id="lastName"
                placeholder={t('tutor_students.placeholder_last_name')}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone">{t('tutor_students.label_phone')}</Label>
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
              <Label htmlFor="telegram">{t('tutor_students.label_telegram')}</Label>
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
              <Label htmlFor="currentLevel">{t('tutor_students.label_level')}</Label>
              <Input
                id="currentLevel"
                placeholder={t('tutor_students.placeholder_level')}
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value)}
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hourlyRate">{t('tutor_students.label_hourly_rate')}</Label>
              <Input
                id="hourlyRate"
                type="number"
                min="0"
                step="any"
                placeholder="1500"
                value={hourlyRate}
                onChange={(e) => handleHourlyRateChange(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          {isEditing && (
            <div className="space-y-1.5 rounded-lg border border-border bg-muted/10 p-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="lessonBalance" className="text-xs font-semibold">
                  {t('tutor_students.label_lesson_balance')}
                </Label>
                {initialData?.lessonBalance !== undefined && (
                  <span className="text-[11px] text-muted-foreground">
                    Текущий: {initialData.lessonBalance} ур.
                  </span>
                )}
              </div>
              <Input
                id="lessonBalance"
                type="number"
                step="1"
                placeholder="0"
                value={lessonBalance}
                onChange={(e) => {
                  setLessonBalance(e.target.value)
                  setRecalculatedHint(null)
                }}
                disabled={isPending}
              />
              {recalculatedHint && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
                  <span>⚡</span> {recalculatedHint}
                </p>
              )}
            </div>
          )}

          {/* Format & Group */}
          <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
            <Label className="text-xs font-semibold">{t('tutor_students.label_format')}</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={studyFormat === 'INDIVIDUAL' ? 'default' : 'outline'}
                size="sm"
                className="w-full text-xs"
                onClick={() => setStudyFormat('INDIVIDUAL')}
              >
                {t('tutor_students.format_individual')}
              </Button>
              <Button
                type="button"
                variant={studyFormat === 'GROUP' ? 'default' : 'outline'}
                size="sm"
                className="w-full text-xs"
                onClick={() => setStudyFormat('GROUP')}
              >
                {t('tutor_students.format_group')}
              </Button>
            </div>

            {studyFormat === 'GROUP' && (
              <div className="space-y-1.5 pt-1.5">
                <Label htmlFor="groupName" className="text-xs">
                  {t('tutor_students.label_group_name')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="groupName"
                  placeholder={t('tutor_students.placeholder_group_name')}
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  disabled={isPending}
                  required={studyFormat === 'GROUP'}
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">{t('tutor_students.label_notes')}</Label>
            <Textarea
              id="notes"
              placeholder={t('tutor_students.placeholder_notes')}
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
              {t('tutor_students.btn_cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? t('tutor_students.btn_save_changes') : t('tutor_students.btn_add_student')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
