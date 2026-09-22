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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreatePayment, useUpdatePayment } from '@/hooks/usePayments'
import { toast } from 'sonner'
import { Loader2, DollarSign, Calendar, FileText, Hash, UserCheck } from 'lucide-react'
import type { Payment, StudentProfile } from '@/types'
import type { AxiosError } from 'axios'

interface PaymentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string
  studentName?: string
  initialData?: Payment | null
  studentsList?: StudentProfile[]
  onSelectStudentId?: (id: string) => void
}

function getTodayDateString(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function normalizeDateForInput(dateStr?: string): string {
  if (!dateStr) return getTodayDateString()
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return getTodayDateString()
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  } catch {
    return getTodayDateString()
  }
}

const QUICK_AMOUNTS = [1000, 2000, 3000, 5000, 8000, 10000]

export function PaymentFormDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
  initialData,
  studentsList = [],
  onSelectStudentId,
}: PaymentFormDialogProps) {
  const isEditing = Boolean(initialData?.id)

  const [selectedStudentId, setSelectedStudentId] = useState(studentId)
  const [amount, setAmount] = useState('')
  const [lessonsCount, setLessonsCount] = useState('1')
  const [paymentDate, setPaymentDate] = useState(getTodayDateString())
  const [notes, setNotes] = useState('')

  const createMutation = useCreatePayment()
  const updateMutation = useUpdatePayment()
  const isPending = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (open) {
      if (initialData) {
        setSelectedStudentId(initialData.studentId || studentId)
        setAmount(String(initialData.amount || ''))
        setLessonsCount(
          initialData.lessonsCount !== undefined
            ? String(initialData.lessonsCount)
            : '1',
        )
        setPaymentDate(normalizeDateForInput(initialData.paymentDate))
        setNotes(initialData.notes || '')
      } else {
        setSelectedStudentId(studentId)
        setAmount('')
        setLessonsCount('1')
        setPaymentDate(getTodayDateString())
        setNotes('')
      }
    }
  }, [open, initialData, studentId])

  const targetStudentId = selectedStudentId || studentId

  const targetStudent = studentsList.find((s) => s.id === targetStudentId)
  const currentDisplayName =
    studentName ||
    (targetStudent
      ? targetStudent.name ||
        [targetStudent.firstName, targetStudent.lastName]
          .filter(Boolean)
          .join(' ')
      : 'Ученик')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!targetStudentId) {
      toast.error('Пожалуйста, выберите ученика')
      return
    }

    const numAmount = Number(amount)
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      toast.error('Укажите корректную сумму оплаты')
      return
    }

    const numLessons = lessonsCount ? Number(lessonsCount) : undefined
    if (numLessons !== undefined && (isNaN(numLessons) || numLessons < 0)) {
      toast.error('Количество уроков должно быть положительным числом')
      return
    }

    if (!paymentDate) {
      toast.error('Укажите дату оплаты')
      return
    }

    try {
      if (isEditing && initialData) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          data: {
            studentId: targetStudentId,
            amount: numAmount,
            lessonsCount: numLessons,
            paymentDate,
            notes: notes.trim() || undefined,
          },
        })
        toast.success('Запись об оплате успешно обновлена')
      } else {
        const res = await createMutation.mutateAsync({
          studentId: targetStudentId,
          amount: numAmount,
          lessonsCount: numLessons,
          paymentDate,
          notes: notes.trim() || undefined,
        })

        // Check if response contains the student's updated balance
        const balance =
          res?.newBalance ?? res?.studentBalance ?? res?.balance

        const formattedAmount = numAmount.toLocaleString('ru-RU')
        if (balance !== undefined && balance !== null) {
          toast.success(
            `Оплата на ${formattedAmount} ₽ зафиксирована! Новый баланс ученика: ${balance} ур.`,
          )
        } else {
          toast.success(`Оплата на ${formattedAmount} ₽ успешно зафиксирована`)
        }

        if (onSelectStudentId && targetStudentId !== studentId) {
          onSelectStudentId(targetStudentId)
        }
      }

      onOpenChange(false)
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      toast.error(
        axiosError.response?.data?.message ||
          (isEditing
            ? 'Не удалось обновить оплату'
            : 'Не удалось зафиксировать оплату'),
      )
    }
  }

  const handleQuickAmount = (value: number) => {
    setAmount(String(value))
    // If student has hourly rate, auto calculate lessons count if reasonable
    if (targetStudent?.hourlyRate && targetStudent.hourlyRate > 0) {
      const count = Math.round(value / targetStudent.hourlyRate)
      if (count > 0) {
        setLessonsCount(String(count))
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            <span>{isEditing ? 'Редактировать оплату' : 'Добавить оплату'}</span>
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Измените параметры платежа или заметку'
              : 'Зафиксируйте внесение средств учеником для пополнения баланса'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          {/* Student field */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Ученик *</Label>
            {studentsList.length > 0 && !isEditing ? (
              <Select
                value={selectedStudentId}
                onValueChange={(val) => {
                  if (val) {
                    setSelectedStudentId(val)
                    if (onSelectStudentId) onSelectStudentId(val)
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите ученика..." />
                </SelectTrigger>
                <SelectContent>
                  {studentsList.map((s) => {
                    const name =
                      s.name ||
                      [s.firstName, s.lastName].filter(Boolean).join(' ') ||
                      'Ученик'
                    const studentBal = s.balance ?? s.lessonBalance
                    return (
                      <SelectItem key={s.id} value={s.id}>
                        <div className="flex items-center justify-between gap-4 w-full">
                          <span>{name}</span>
                          {studentBal !== undefined && (
                            <span className="text-xs text-muted-foreground">
                              Баланс: {studentBal} ур.
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2 p-2.5 rounded-md border bg-muted/30 text-sm">
                <UserCheck className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium">{currentDisplayName}</span>
              </div>
            )}
          </div>

          {/* Amount input & Quick Buttons */}
          <div className="space-y-1.5">
            <Label htmlFor="payment-amount" className="text-xs font-semibold">
              Сумма оплаты (₽) *
            </Label>
            <div className="relative">
              <Input
                id="payment-amount"
                type="number"
                min="1"
                step="50"
                placeholder="Например, 3000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="pr-8 text-base font-semibold"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                ₽
              </span>
            </div>

            {/* Quick amount chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAmount(val)}
                  className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                    Number(amount) === val
                      ? 'bg-primary text-primary-foreground border-primary font-medium'
                      : 'bg-muted/50 hover:bg-muted text-foreground border-border'
                  }`}
                >
                  +{val.toLocaleString('ru-RU')} ₽
                </button>
              ))}
            </div>
          </div>

          {/* Lessons count & Payment date in two columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="payment-lessons-count"
                className="text-xs font-semibold flex items-center gap-1"
              >
                <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Кол-во уроков</span>
              </Label>
              <Input
                id="payment-lessons-count"
                type="number"
                min="0"
                step="1"
                placeholder="1"
                value={lessonsCount}
                onChange={(e) => setLessonsCount(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                Пополнит баланс ученика
              </p>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="payment-date"
                className="text-xs font-semibold flex items-center gap-1"
              >
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Дата платежа *</span>
              </Label>
              <Input
                id="payment-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Notes input */}
          <div className="space-y-1.5">
            <Label
              htmlFor="payment-notes"
              className="text-xs font-semibold flex items-center gap-1"
            >
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Заметка к платежу (опционально)</span>
            </Label>
            <Textarea
              id="payment-notes"
              placeholder="Например: Оплата абонемента за октябрь, перевод Сбер"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none text-sm"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isEditing ? 'Сохранить изменения' : 'Зафиксировать'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
