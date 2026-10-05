import { Card, CardContent } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Video,
  CheckCircle2,
  CalendarClock,
  XCircle,
  ExternalLink,
  Clock,
  FileText,
  CalendarX2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react'
import type { Lesson } from '@/types'

interface StudentLessonCardProps {
  lesson: Lesson
  onCancelLesson?: (lesson: Lesson) => void
}

const statusConfig: Record<
  string,
  { label: string; badgeClass: string; icon: typeof CheckCircle2 }
> = {
  SCHEDULED: {
    label: 'Запланирован',
    badgeClass:
      'bg-muted text-foreground border border-border font-medium',
    icon: CalendarClock,
  },
  COMPLETED: {
    label: 'Проведен',
    badgeClass:
      'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 font-medium',
    icon: CheckCircle2,
  },
  CANCELLED_BY_TUTOR: {
    label: 'Отменен (репетитор)',
    badgeClass:
      'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 font-medium',
    icon: XCircle,
  },
  CANCELLED_BY_STUDENT: {
    label: 'Отменен вами',
    badgeClass:
      'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 font-medium',
    icon: XCircle,
  },
}

function formatTime(isoStr: string): string {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function getDurationMinutes(start: string, end: string): number {
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  if (isNaN(s) || isNaN(e) || e <= s) return 0
  return Math.round((e - s) / (1000 * 60))
}

export function StudentLessonCard({ lesson, onCancelLesson }: StudentLessonCardProps) {
  const startFormatted = formatTime(lesson.startTime)
  const endFormatted = formatTime(lesson.endTime)
  const duration = getDurationMinutes(lesson.startTime, lesson.endTime)

  const lessonDate = new Date(lesson.startTime)
  const isFutureScheduled =
    lesson.status === 'SCHEDULED' &&
    !isNaN(lessonDate.getTime()) &&
    lessonDate.getTime() > Date.now()

  const hoursUntilLesson = !isNaN(lessonDate.getTime())
    ? (lessonDate.getTime() - Date.now()) / (1000 * 60 * 60)
    : 0

  const isLateCancellation = hoursUntilLesson < 12

  const currentStatus = statusConfig[lesson.status] || {
    label: lesson.status,
    badgeClass: 'bg-muted text-muted-foreground',
    icon: CalendarClock,
  }
  const StatusIcon = currentStatus.icon

  const isToday = (() => {
    if (!lesson.startTime) return false
    const d = new Date(lesson.startTime)
    const now = new Date()
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    )
  })()

  return (
    <Card
      className={`border transition-all relative overflow-hidden ${
        isToday
          ? 'border-border border-l-[3px] border-l-red-accent hover:shadow-xs'
          : 'border-border hover:shadow-xs'
      }`}
    >
      <CardContent className="p-4 space-y-3">
        {/* Top bar: Time, duration and status badge */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-muted text-foreground tabular-nums">
              {isToday ? (
                <span className="h-1.5 w-1.5 rounded-full bg-red-accent" />
              ) : (
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              {startFormatted} — {endFormatted}
            </span>
            {duration > 0 && (
              <span className="text-xs text-muted-foreground font-medium">
                {duration} мин.
              </span>
            )}
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${currentStatus.badgeClass}`}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            <span>{currentStatus.label}</span>
          </span>
        </div>

        {/* Topic */}
        <div className="pt-0.5">
          <h3 className="font-semibold text-base text-foreground leading-snug">
            {lesson.topic || 'Занятие без указанной темы'}
          </h3>
        </div>

        {/* Actions bar (meeting button & cancel button) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {lesson.meetingUrl && lesson.status === 'SCHEDULED' ? (
            <a
              href={
                lesson.meetingUrl.startsWith('http')
                  ? lesson.meetingUrl
                  : `https://${lesson.meetingUrl}`
              }
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({
                variant: 'success',
                size: 'sm',
                className:
                  'gap-2 text-xs font-semibold inline-flex items-center text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-xs cursor-pointer',
              })}
            >
              <Video className="h-3.5 w-3.5 text-white shrink-0" />
              <span className="text-white">Подключиться к занятию</span>
              <ExternalLink className="h-3 w-3 text-white/80 shrink-0" />
            </a>
          ) : (
            <div />
          )}

          {isFutureScheduled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancelLesson?.(lesson)}
              className={`h-8 text-xs gap-1.5 ml-auto ${
                isLateCancellation
                  ? 'text-amber-700 dark:text-amber-400 hover:text-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                  : 'text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              {isLateCancellation ? (
                <>
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Отмена через преподавателя</span>
                </>
              ) : (
                <>
                  <CalendarX2 className="h-3.5 w-3.5" />
                  <span>Отменить занятие</span>
                </>
              )}
            </Button>
          )}
        </div>

        {/* Cancellation reason note */}
        {lesson.cancellationReason && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <p className="line-clamp-2">
              <span className="font-semibold">Причина отмены: </span>
              {lesson.cancellationReason}
            </p>
          </div>
        )}

        {/* Notes from tutor */}
        {lesson.notes && (
          <div className="flex items-start gap-2 pt-2 border-t border-border/60 text-xs text-muted-foreground">
            <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
            <p className="line-clamp-3">{lesson.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
