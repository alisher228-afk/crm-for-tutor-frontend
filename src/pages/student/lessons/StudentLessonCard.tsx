import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import {
  Video,
  CheckCircle2,
  CalendarClock,
  XCircle,
  ExternalLink,
  Clock,
  FileText,
} from 'lucide-react'
import type { Lesson } from '@/types'

interface StudentLessonCardProps {
  lesson: Lesson
}

const statusConfig: Record<
  string,
  { label: string; badgeClass: string; icon: typeof CheckCircle2 }
> = {
  SCHEDULED: {
    label: 'Запланирован',
    badgeClass:
      'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
    icon: CalendarClock,
  },
  COMPLETED: {
    label: 'Проведен',
    badgeClass:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
    icon: CheckCircle2,
  },
  CANCELLED_BY_TUTOR: {
    label: 'Отменен (репетитор)',
    badgeClass:
      'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900',
    icon: XCircle,
  },
  CANCELLED_BY_STUDENT: {
    label: 'Отменен вами',
    badgeClass:
      'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900',
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

export function StudentLessonCard({ lesson }: StudentLessonCardProps) {
  const startFormatted = formatTime(lesson.startTime)
  const endFormatted = formatTime(lesson.endTime)
  const duration = getDurationMinutes(lesson.startTime, lesson.endTime)

  const currentStatus = statusConfig[lesson.status] || {
    label: lesson.status,
    badgeClass: 'bg-muted text-muted-foreground',
    icon: CalendarClock,
  }
  const StatusIcon = currentStatus.icon

  return (
    <Card className="border-border hover:shadow-xs transition-shadow">
      <CardContent className="p-4 space-y-3">
        {/* Top bar: Time, duration and status badge */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-muted text-foreground">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
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

        {/* Meeting URL button (if available and lesson is scheduled) */}
        {lesson.meetingUrl && (
          <div className="pt-1">
            <a
              href={
                lesson.meetingUrl.startsWith('http')
                  ? lesson.meetingUrl
                  : `https://${lesson.meetingUrl}`
              }
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({
                size: 'sm',
                className:
                  'gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center',
              })}
            >
              <Video className="h-3.5 w-3.5" />
              <span>Подключиться к занятию</span>
              <ExternalLink className="h-3 w-3 opacity-70" />
            </a>
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
