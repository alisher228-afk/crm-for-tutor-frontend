import { useState, useEffect, useMemo, type FormEvent } from 'react'
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
import { useLanguage } from '@/i18n'

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
  const { t, language } = useLanguage()
  const numLocale = language === 'en' ? 'en-US' : language === 'kk' ? 'kk-KZ' : 'ru-RU'
  const isEditing = Boolean(initialData?.id)

  const [selectedStudentId, setSelectedStudentId] = useState(studentId ? String(studentId) : '')
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
        setSelectedStudentId(
          initialData.studentId
            ? String(initialData.studentId)
            : studentId
              ? String(studentId)
              : '',
        )
        setAmount(String(initialData.amount || ''))
        setLessonsCount(
          initialData.lessonsCount !== undefined
            ? String(initialData.lessonsCount)
            : '1',
        )
        setPaymentDate(normalizeDateForInput(initialData.paymentDate))
        setNotes(initialData.notes || '')
      } else {
        setSelectedStudentId(studentId ? String(studentId) : '')
        setAmount('')
        setLessonsCount('1')
        setPaymentDate(getTodayDateString())
        setNotes('')
      }
    }
  }, [open, initialData, studentId])

  const studentSelectItems = useMemo(() => {
    return studentsList.map((s) => {
      const name =
        s.name ||
        [s.firstName, s.lastName].filter(Boolean).join(' ') ||
        t('tutor_lessons.default_student')
      return {
        value: String(s.id),
        label: name,
      }
    })
  }, [studentsList, t])

  const targetStudentId = selectedStudentId || (studentId ? String(studentId) : '')

  const targetStudent = studentsList.find((s) => String(s.id) === String(targetStudentId))
  const currentDisplayName =
    (targetStudent
      ? targetStudent.name ||
        [targetStudent.firstName, targetStudent.lastName]
          .filter(Boolean)
          .join(' ')
      : studentName) || t('tutor_lessons.default_student')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!targetStudentId) {
      toast.error(t('tutor_payments.err_student_req'))
      return
    }

    const numAmount = Number(amount)
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      toast.error(t('tutor_payments.err_amount_req'))
      return
    }

    const numLessons = lessonsCount ? Number(lessonsCount) : undefined
    if (numLessons !== undefined && (isNaN(numLessons) || numLessons < 0)) {
      toast.error(t('tutor_payments.err_lessons_pos'))
      return
    }

    if (!paymentDate) {
      toast.error(t('tutor_payments.err_date_req'))
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
        toast.success(t('tutor_payments.toast_updated'))
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
          res?.newBalance ?? res?.studentBalance ?? res?.lessonBalance ?? res?.balance

        const formattedAmount = numAmount.toLocaleString(numLocale)
        if (balance !== undefined && balance !== null) {
          toast.success(
            t('tutor_payments.toast_created_with_balance', {
              amount: formattedAmount,
              balance,
            }),
          )
        } else {
          toast.success(t('tutor_payments.toast_created', { amount: formattedAmount }))
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
            ? t('tutor_payments.toast_update_err')
            : t('tutor_payments.toast_create_err')),
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
            <span>{isEditing ? t('tutor_payments.form_title_edit') : t('tutor_payments.form_title_create')}</span>
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('tutor_payments.form_desc_edit')
              : t('tutor_payments.form_desc_create')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          {/* Student field */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t('tutor_payments.label_student_req')}</Label>
            {studentsList.length > 0 && !isEditing ? (
              <Select
                items={studentSelectItems}
                value={selectedStudentId ? String(selectedStudentId) : undefined}
                onValueChange={(val) => {
                  if (val) {
                    setSelectedStudentId(String(val))
                    if (onSelectStudentId) onSelectStudentId(String(val))
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('tutor_payments.select_student_placeholder')}>
                    {(val) => {
                      if (!val) return t('tutor_payments.select_student_placeholder')
                      const student = studentsList.find(
                        (s) => String(s.id) === String(val),
                      )
                      if (!student) return val
                      const name =
                        student.name ||
                        [student.firstName, student.lastName]
                          .filter(Boolean)
                          .join(' ') ||
                        t('tutor_students.default_student_name')
                      const studentBal =
                        student.lessonBalance ?? student.balance
                      return (
                        <span className="flex items-center gap-2 truncate">
                          <span className="truncate font-medium">{name}</span>
                          {studentBal !== undefined && (
                            <span className="text-xs text-muted-foreground shrink-0 font-normal">
                              ({t('tutor_payments.unit_lessons', { count: studentBal })})
                            </span>
                          )}
                        </span>
                      )
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {studentsList.map((s) => {
                    const name =
                      s.name ||
                      [s.firstName, s.lastName].filter(Boolean).join(' ') ||
                      t('tutor_students.default_student_name')
                    const studentBal = s.lessonBalance ?? s.balance
                    return (
                      <SelectItem key={s.id} value={String(s.id)}>
                        <div className="flex items-center justify-between gap-4 w-full">
                          <span>{name}</span>
                          {studentBal !== undefined && (
                            <span className="text-xs text-muted-foreground">
                              {t('tutor_lessons.balance_label', { balance: studentBal })}
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
              {t('tutor_payments.label_amount_req')}
            </Label>
            <div>
              <Input
                id="payment-amount"
                type="number"
                min="0"
                step="any"
                placeholder={t('tutor_payments.placeholder_amount')}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="text-base font-semibold"
              />
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
                  +{val.toLocaleString(numLocale)}
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
                <span>{t('tutor_payments.label_lessons_count')}</span>
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
                {t('tutor_payments.lessons_count_hint')}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="payment-date"
                className="text-xs font-semibold flex items-center gap-1"
              >
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{t('tutor_payments.label_payment_date')}</span>
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
              <span>{t('tutor_payments.label_notes')}</span>
            </Label>
            <Textarea
              id="payment-notes"
              placeholder={t('tutor_payments.placeholder_notes')}
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
              {t('tutor_payments.btn_cancel')}
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isEditing ? t('tutor_payments.btn_submit_edit') : t('tutor_payments.btn_submit_create')}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
