import { useState, useEffect, type FormEvent } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { HomeworkAttachments } from '@/components/HomeworkAttachments'
import { useHomework, useSubmitHomework } from '@/hooks/useHomework'
import { toast } from 'sonner'
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  MessageSquare,
  Loader2,
  Calendar,
  Send,
  Sparkles,
} from 'lucide-react'
import type { Homework } from '@/types'
import type { AxiosError } from 'axios'

interface StudentHomeworkDetailsSheetProps {
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
    label: 'Нужно сдать',
    badgeClass:
      'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
    icon: Clock,
  },
  SUBMITTED: {
    label: 'Сдано на проверку',
    badgeClass:
      'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
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

export function StudentHomeworkDetailsSheet({
  homeworkId,
  initialHomework,
  open,
  onOpenChange,
}: StudentHomeworkDetailsSheetProps) {
  const { data: fetchedHomework } = useHomework(homeworkId)
  const homework = fetchedHomework || initialHomework

  const submitMutation = useSubmitHomework()
  const [studentNotes, setStudentNotes] = useState('')

  useEffect(() => {
    if (open && homework) {
      setStudentNotes(homework.studentNotes || '')
    }
  }, [open, homework])

  if (!homework) return null

  const currentStatus = statusConfig[homework.status] || {
    label: homework.status,
    badgeClass: 'bg-muted text-muted-foreground',
    icon: Clock,
  }
  const StatusIcon = currentStatus.icon

  const { text: deadlineText, isPast: isDeadlinePast } = formatDeadline(
    homework.deadline,
  )

  const isAssigned = homework.status === 'ASSIGNED'
  const isReviewed = homework.status === 'REVIEWED'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!homeworkId) return

    try {
      await submitMutation.mutateAsync({
        id: homeworkId,
        studentNotes: studentNotes.trim() || undefined,
      })
      toast.success('Задание успешно отправлено на проверку!')
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      toast.error(
        axiosError.response?.data?.message || 'Не удалось сдать задание',
      )
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto p-0 flex flex-col"
      >
        <div className="p-6 space-y-6 flex-1">
          {/* Header */}
          <SheetHeader className="space-y-2 text-left">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${currentStatus.badgeClass}`}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                <span>{currentStatus.label}</span>
              </span>

              {homework.lessonTopic && (
                <Badge variant="outline" className="text-xs font-normal">
                  Урок: {homework.lessonTopic}
                </Badge>
              )}
            </div>

            <SheetTitle className="text-xl font-bold leading-snug">
              {homework.title}
            </SheetTitle>

            {homework.deadline && (
              <SheetDescription className="flex items-center gap-2 pt-1 text-xs">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Дедлайн: </span>
                <span
                  className={
                    isDeadlinePast && isAssigned
                      ? 'text-destructive font-semibold'
                      : 'font-medium text-foreground'
                  }
                >
                  {deadlineText}
                </span>
                {isDeadlinePast && isAssigned && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                    Срок истёк
                  </Badge>
                )}
              </SheetDescription>
            )}
          </SheetHeader>

          {/* Description */}
          {homework.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                <span>Описание задания</span>
              </h3>
              <Card className="border-border bg-muted/20">
                <CardContent className="p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {homework.description}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tutor Feedback (if reviewed) */}
          {homework.tutorFeedback && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Отзыв репетитора</span>
              </h3>
              <Card className="border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20">
                <CardContent className="p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {homework.tutorFeedback}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Attachments Section */}
          <div className="space-y-3 pt-2 border-t border-border">
            <HomeworkAttachments homeworkId={homework.id} readOnly={false} />
          </div>

          {/* Submission Section */}
          <div className="space-y-3 pt-4 border-t border-border">
            {isAssigned ? (
              /* Submission Form (when ASSIGNED) */
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="student-notes"
                    className="text-xs font-semibold flex items-center gap-1.5"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                    <span>Ваш комментарий к решению</span>
                  </Label>
                  <Textarea
                    id="student-notes"
                    rows={4}
                    placeholder="Напишите, как далось задание, возникли ли вопросы или оставьте пояснение к решению и прикреплённым файлам..."
                    value={studentNotes}
                    onChange={(e) => setStudentNotes(e.target.value)}
                    className="text-sm resize-y"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    При необходимости прикрепите файлы с решением в блоке выше перед отправкой.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="w-full gap-2 font-medium"
                >
                  {submitMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>Сдать задание на проверку</span>
                </Button>
              </form>
            ) : (
              /* Submitted / Reviewed state (read-only student notes) */
              <div className="space-y-3">
                <div
                  className={`p-3.5 rounded-lg border text-xs flex items-center gap-2.5 ${
                    isReviewed
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                      : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  {isReviewed ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  )}
                  <span>
                    {isReviewed
                      ? 'Задание проверено преподавателем'
                      : 'Задание отправлено и ожидает проверки преподавателя'}
                  </span>
                </div>

                {homework.studentNotes && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Ваш комментарий при сдаче:</span>
                    </span>
                    <Card className="border-border bg-muted/30">
                      <CardContent className="p-3 text-xs sm:text-sm text-foreground whitespace-pre-wrap">
                        {homework.studentNotes}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
