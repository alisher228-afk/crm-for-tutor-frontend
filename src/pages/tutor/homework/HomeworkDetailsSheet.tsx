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
import { useLanguage } from '@/i18n'
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
  Trash2,
} from 'lucide-react'
import type { Homework } from '@/types'
import type { AxiosError } from 'axios'

interface HomeworkDetailsSheetProps {
  homeworkId: string | null
  initialHomework?: Homework | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete?: (homework: Homework) => void
}

function formatDeadline(isoStr: string | undefined, dateLocale: string, fallback: string): { text: string; isPast: boolean } {
  if (!isoStr) return { text: fallback, isPast: false }
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return { text: fallback, isPast: false }

  const isPast = d.getTime() < Date.now()
  const formatted = d.toLocaleDateString(dateLocale, {
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
  onDelete,
}: HomeworkDetailsSheetProps) {
  const { t, language } = useLanguage()
  const dateLocale = language === 'en' ? 'en-US' : language === 'kk' ? 'kk-KZ' : 'ru-RU'

  const { data: fetchedHomework } = useHomework(homeworkId)
  const homework = fetchedHomework || initialHomework

  const updateStatusMutation = useUpdateHomeworkStatus()

  if (!homework) return null

  const statusConfig: Record<
    string,
    { label: string; badgeClass: string; icon: typeof CheckCircle2 }
  > = {
    ASSIGNED: {
      label: t('tutor_homework.status_assigned'),
      badgeClass:
        'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
      icon: Clock,
    },
    SUBMITTED: {
      label: t('tutor_homework.status_submitted'),
      badgeClass:
        'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800 animate-pulse',
      icon: AlertCircle,
    },
    REVIEWED: {
      label: t('tutor_homework.status_reviewed'),
      badgeClass:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
      icon: CheckCircle2,
    },
  }

  const currentStatus = statusConfig[homework.status] || {
    label: homework.status,
    badgeClass: 'bg-muted text-muted-foreground',
    icon: Clock,
  }

  const { text: deadlineText, isPast: isDeadlinePast } = formatDeadline(
    homework.deadline,
    dateLocale,
    t('tutor_homework.deadline_none'),
  )

  const isSubmitted = homework.status === 'SUBMITTED'

  const handleMarkAsReviewed = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        id: homework.id,
        status: 'REVIEWED',
      })
      toast.success(t('tutor_homework.toast_reviewed'))
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      toast.error(
        axiosError.response?.data?.message || t('tutor_homework.toast_status_err'),
      )
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl w-full p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-border">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStatus.badgeClass}`}
                >
                  <currentStatus.icon className="h-3.5 w-3.5" />
                  <span>{currentStatus.label}</span>
                </span>

                {isDeadlinePast && homework.status !== 'REVIEWED' && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                    {t('tutor_homework.badge_overdue')}
                  </Badge>
                )}
              </div>

              {onDelete && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(homework)}
                  className="text-xs h-7 text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5 font-medium"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{t('tutor_homework.btn_delete_hw')}</span>
                </Button>
              )}
            </div>

            <SheetTitle className="text-xl font-bold leading-snug text-foreground">
              {homework.title}
            </SheetTitle>

            <SheetDescription className="text-xs flex items-center gap-3 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {t('tutor_homework.deadline_prefix', { date: deadlineText })}
              </span>
              {homework.studentName && (
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {t('tutor_homework.student_prefix', { name: homework.studentName })}
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
                  {t('tutor_homework.banner_submitted_title')}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  {t('tutor_homework.banner_submitted_desc')}
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
                <span>{t('tutor_homework.btn_mark_reviewed')}</span>
              </Button>
            </div>
          )}

          {/* Description Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> {t('tutor_homework.section_desc')}
            </h4>
            <Card className="border-border">
              <CardContent className="p-4 text-sm whitespace-pre-wrap leading-relaxed">
                {homework.description || (
                  <span className="text-muted-foreground italic">
                    {t('tutor_homework.desc_empty')}
                  </span>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Student Notes (if submitted) */}
          {homework.studentNotes && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-primary" /> {t('tutor_homework.section_student_comment')}
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
                {t('tutor_homework.section_tutor_feedback')}
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
              <span>{t('tutor_homework.btn_mark_reviewed_full')}</span>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
