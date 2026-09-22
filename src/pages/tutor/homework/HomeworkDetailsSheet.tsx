import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { HomeworkAttachments } from '@/components/HomeworkAttachments'
import { useHomework, useUpdateHomeworkStatus } from '@/hooks/useHomework'
import { toast } from 'sonner'
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  User,
  MessageSquare,
  Loader2,
  Calendar,
} from 'lucide-react'
import type { Homework } from '@/types'
import type { AxiosError } from 'axios'

interface HomeworkDetailsSheetProps {
  homeworkId: string | null
  initialHomework?: Homework | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusConfig: Record<
  string,
  { label: string; badgeClass: string; icon: typeof CheckCircle2 }
> = {
  ASSIGNED: {
    label: 'Выдано',
    badgeClass:
      'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
    icon: Clock,
  },
  SUBMITTED: {
    label: 'Сдано на проверку',
    badgeClass:
      'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800 animate-pulse',
    icon: AlertCircle,
  },
  REVIEWED: {
    label: 'Проверено',
    badgeClass:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
    icon: CheckCircle2,
  },
}

function formatDeadline(isoStr?: string): { text: string; isPast: boolean } {
  if (!isoStr) return { text: 'Бессрочно', isPast: false }
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return { text: 'Бессрочно', isPast: false }

  const isPast = d.getTime() < Date.now()
  const formatted = d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
  return { text: formatted, isPast }
}

export function HomeworkDetailsSheet({
  homeworkId,
  initialHomework,
  open,
  onOpenChange,
}: HomeworkDetailsSheetProps) {
  const { data: fetchedHomework } = useHomework(homeworkId)
  const homework = fetchedHomework || initialHomework

  const updateStatusMutation = useUpdateHomeworkStatus()

  if (!homework) return null

  const currentStatus = statusConfig[homework.status] || {
    label: homework.status,
    badgeClass: 'bg-muted text-muted-foreground',
    icon: Clock,
  }

  const { text: deadlineText, isPast: isDeadlinePast } = formatDeadline(
    homework.deadline,
  )

  const isSubmitted = homework.status === 'SUBMITTED'

  const handleMarkAsReviewed = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        id: homework.id,
        status: 'REVIEWED',
      })
      toast.success('Задание помечено как проверенное!')
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      toast.error(
        axiosError.response?.data?.message || 'Не удалось обновить статус задания',
      )
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl w-full p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-border">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStatus.badgeClass}`}
              >
                <currentStatus.icon className="h-3.5 w-3.5" />
                <span>{currentStatus.label}</span>
              </span>

              {isDeadlinePast && homework.status !== 'REVIEWED' && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                  Дедлайн просрочен
                </Badge>
              )}
            </div>

            <SheetTitle className="text-xl font-bold leading-snug text-foreground">
              {homework.title}
            </SheetTitle>

            <SheetDescription className="text-xs flex items-center gap-3 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Дедлайн: {deadlineText}
              </span>
              {homework.studentName && (
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  Ученик: {homework.studentName}
                </span>
              )}
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Prominent Action Button for SUBMITTED state */}
          {isSubmitted && (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 dark:bg-amber-950/30 dark:border-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                  Ученик сдал домашнее задание
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  Ознакомьтесь с прикрепленными файлами и подтвердите проверку
                </p>
              </div>

              <Button
                onClick={handleMarkAsReviewed}
                disabled={updateStatusMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 gap-1.5"
              >
                {updateStatusMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <span>Проверено</span>
              </Button>
            </div>
          )}

          {/* Description Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Описание задания
            </h4>
            <Card className="border-border">
              <CardContent className="p-4 text-sm whitespace-pre-wrap leading-relaxed">
                {homework.description || (
                  <span className="text-muted-foreground italic">
                    Текстовое описание не было добавлено к заданию
                  </span>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Student Notes (if submitted) */}
          {homework.studentNotes && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-primary" /> Комментарий
                ученика к решению
              </h4>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm whitespace-pre-wrap leading-relaxed text-foreground">
                {homework.studentNotes}
              </div>
            </div>
          )}

          {/* Tutor Feedback (if reviewed) */}
          {homework.tutorFeedback && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Отзыв преподавателя
              </h4>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm whitespace-pre-wrap leading-relaxed">
                {homework.tutorFeedback}
              </div>
            </div>
          )}

          {/* Embedded Reusable Attachments Component */}
          <div className="border-t border-border pt-6">
            <HomeworkAttachments homeworkId={homework.id} />
          </div>
        </div>

        {/* Footer (if not yet marked as reviewed and status is SUBMITTED) */}
        {isSubmitted && (
          <div className="p-4 border-t border-border bg-muted/20 flex justify-end">
            <Button
              onClick={handleMarkAsReviewed}
              disabled={updateStatusMutation.isPending}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              {updateStatusMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span>Отметить как проверенное</span>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
