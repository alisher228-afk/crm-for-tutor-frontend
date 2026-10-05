import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useCancelMyLesson } from '@/hooks/useLessons'
import { useMyProfile } from '@/hooks/useStudents'
import { toast } from 'sonner'
import {
  CalendarX2,
  AlertTriangle,
  Loader2,
  Mail,
  Copy,
  Check,
  Send,
  Info,
} from 'lucide-react'
import type { Lesson } from '@/types'
import type { AxiosError } from 'axios'

interface CancelLessonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lesson: Lesson | null
  onSuccess?: () => void
}

export function CancelLessonDialog({
  open,
  onOpenChange,
  lesson,
  onSuccess,
}: CancelLessonDialogProps) {
  const [reason, setReason] = useState('')
  const [copied, setCopied] = useState(false)
  const cancelMutation = useCancelMyLesson()
  const { data: profile } = useMyProfile()

  if (!lesson) return null

  const lessonDate = new Date(lesson.startTime)
  const hoursUntilLesson = !isNaN(lessonDate.getTime())
    ? (lessonDate.getTime() - Date.now()) / (1000 * 60 * 60)
    : 0

  const isLateCancellation = hoursUntilLesson < 12

  const remainingHours = Math.max(0, Math.floor(hoursUntilLesson))
  const remainingMins = Math.max(0, Math.round((hoursUntilLesson - remainingHours) * 60))
  const timeRemainingStr =
    remainingHours > 0
      ? `${remainingHours} ч. ${remainingMins} мин.`
      : `${remainingMins} мин.`

  const formattedDate = !isNaN(lessonDate.getTime())
    ? lessonDate.toLocaleDateString('ru-RU', {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  const tutorEmail = profile?.tutorEmail

  const handleCopyEmail = () => {
    if (tutorEmail) {
      navigator.clipboard.writeText(tutorEmail)
      setCopied(true)
      toast.success('Email преподавателя скопирован в буфер')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleConfirmCancel = async () => {
    try {
      await cancelMutation.mutateAsync({
        id: lesson.id,
        reason: reason.trim() || undefined,
      })
      toast.success('Занятие успешно отменено')
      setReason('')
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          'Не удалось отменить занятие',
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div
            className={`flex items-center gap-2 ${
              isLateCancellation
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {isLateCancellation ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <CalendarX2 className="h-5 w-5" />
            )}
            <DialogTitle>
              {isLateCancellation ? 'Поздняя отмена занятия' : 'Отмена занятия'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs pt-1">
            Урок <strong className="text-foreground">{formattedDate}</strong>
            {lesson.topic && (
              <>
                {' '}
                по теме «<span className="text-foreground">{lesson.topic}</span>»
              </>
            )}
            .
          </DialogDescription>
        </DialogHeader>

        {isLateCancellation ? (
          /* LATE CANCELLATION: Student cannot cancel directly in the system, only contact tutor */
          <div className="space-y-4 py-2">
            <div className="rounded-xl border border-amber-300/80 bg-amber-50/90 dark:border-amber-700/60 dark:bg-amber-950/40 p-3.5 space-y-2 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2 font-semibold text-amber-950 dark:text-amber-100">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Самостоятельная отмена закрыта</span>
              </div>
              <p className="leading-relaxed opacity-95">
                До начала урока осталось менее 12 часов (<strong>{timeRemainingStr}</strong>). По правилам сервиса самостоятельная отмена в системе недоступна.
              </p>
              <p className="leading-relaxed opacity-95">
                Чтобы отменить или перенести занятие, пожалуйста, <strong>напишите преподавателю лично</strong>.
              </p>
            </div>

            {/* Tutor contacts card */}
            <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  <span>
                    {profile?.tutorName ? `Преподаватель: ${profile.tutorName}` : 'Связь с преподавателем'}
                  </span>
                </span>
                {tutorEmail && (
                  <Badge variant="outline" className="text-[10px] font-normal">
                    Email
                  </Badge>
                )}
              </div>

              {tutorEmail ? (
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-background border border-border">
                  <span className="text-xs font-medium text-foreground truncate select-all">
                    {tutorEmail}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyEmail}
                    className="h-7 px-2 text-[11px] gap-1 shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-500" />
                        <span>Скопировано</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Скопировать</span>
                      </>
                    )}
                  </Button>
                </div>
              ) : null}

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Вы также можете связаться с преподавателем в Telegram, WhatsApp или другом мессенджере, где обычно ведете переписку.
              </p>
            </div>
          </div>
        ) : (
          /* STANDARD CANCELLATION: More than 12 hours remaining */
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-sky-200/80 bg-sky-50/70 dark:border-sky-800/50 dark:bg-sky-950/20 text-sky-900 dark:text-sky-200 text-xs">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-sky-600 dark:text-sky-400" />
              <div>
                <p className="font-semibold">Своевременная отмена</p>
                <p className="mt-0.5 opacity-90 leading-relaxed">
                  До занятия более 12 часов. Вы можете отменить урок сейчас, преподаватель получит уведомление.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cancel-reason" className="text-xs font-medium">
                Причина отмены (видна преподавателю)
              </Label>
              <Textarea
                id="cancel-reason"
                placeholder="Например: Заболел(а), задержка на учебе/работе, семейные обстоятельства..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="text-xs resize-none h-20"
                maxLength={500}
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border flex flex-col sm:flex-row justify-end items-center">
          {isLateCancellation ? (
            /* LATE CANCELLATION: Only contact option or Close */
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-between">
              {tutorEmail ? (
                <a
                  href={`mailto:${tutorEmail}?subject=${encodeURIComponent(
                    `Отмена занятия: ${formattedDate}`,
                  )}&body=${encodeURIComponent(
                    `Здравствуйте!\n\nК сожалению, я не смогу присутствовать на занятии ${formattedDate}${
                      lesson.topic ? ` (тема: ${lesson.topic})` : ''
                    }.\n\nПричина: `,
                  )}`}
                  className={buttonVariants({
                    variant: 'default',
                    size: 'sm',
                    className:
                      'w-full sm:w-auto text-xs gap-1.5 bg-primary text-primary-foreground',
                  })}
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Написать на почту</span>
                </a>
              ) : (
                <div />
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto text-xs"
              >
                Понятно
              </Button>
            </div>
          ) : (
            /* STANDARD CANCELLATION: Can confirm cancel */
            <div className="flex items-center gap-2 w-full justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={cancelMutation.isPending}
                className="text-xs"
              >
                Не отменять
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleConfirmCancel}
                disabled={cancelMutation.isPending}
                className="text-xs gap-1.5"
              >
                {cancelMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CalendarX2 className="h-3.5 w-3.5" />
                )}
                <span>Подтвердить отмену</span>
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
