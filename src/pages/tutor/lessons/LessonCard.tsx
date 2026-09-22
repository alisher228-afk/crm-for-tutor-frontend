import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUpdateLessonStatus } from '@/hooks/useLessons'
import { toast } from 'sonner'
import {
  Video,
  Edit2,
  Trash2,
  ChevronDown,
  CheckCircle2,
  CalendarClock,
  XCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import type { Lesson, LessonStatus } from '@/types'
import type { AxiosError } from 'axios'

interface LessonCardProps {
  lesson: Lesson
  onEdit: (lesson: Lesson) => void
  onDelete: (lesson: Lesson) => void
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
    label: 'Отменен (тьютор)',
    badgeClass:
      'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900',
    icon: XCircle,
  },
  CANCELLED_BY_STUDENT: {
    label: 'Отменен (ученик)',
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

export function LessonCard({ lesson, onEdit, onDelete }: LessonCardProps) {
  const updateStatusMutation = useUpdateLessonStatus()

  const startFormatted = formatTime(lesson.startTime)
  const endFormatted = formatTime(lesson.endTime)
  const duration = getDurationMinutes(lesson.startTime, lesson.endTime)

  const currentStatus = statusConfig[lesson.status] || {
    label: lesson.status,
    badgeClass: 'bg-muted text-muted-foreground',
    icon: CalendarClock,
  }

  const studentName = lesson.studentName || 'Ученик'
  const studentInitial = studentName.charAt(0).toUpperCase() || 'У'

  const handleStatusChange = async (status: LessonStatus) => {
    if (status === lesson.status) return

    try {
      await updateStatusMutation.mutateAsync({ id: lesson.id, status })
      toast.success(
        `Статус занятия изменен на "${statusConfig[status]?.label || status}"`,
      )
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      toast.error(
        axiosError.response?.data?.message || 'Не удалось изменить статус урока',
      )
    }
  }

  return (
    <Card className="border-border hover:shadow-sm transition-shadow">
      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Time & Student */}
        <div className="flex items-start sm:items-center gap-4 min-w-0">
          {/* Time Badge Box */}
          <div className="flex flex-col items-center justify-center rounded-xl bg-muted/60 border border-border px-3 py-2 text-center shrink-0 w-24">
            <span className="text-sm font-bold text-foreground tracking-tight">
              {startFormatted}
            </span>
            <span className="text-[11px] text-muted-foreground">{endFormatted}</span>
            {duration > 0 && (
              <span className="text-[10px] text-muted-foreground/80 mt-0.5 font-medium">
                {duration} мин.
              </span>
            )}
          </div>

          {/* Student & Topic */}
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <Avatar size="sm">
                <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-semibold">
                  {studentInitial}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold text-sm text-foreground truncate">
                {studentName}
              </span>
            </div>

            {lesson.topic ? (
              <p className="text-sm text-foreground font-medium truncate">
                {lesson.topic}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Тема занятия не указана
              </p>
            )}

            {lesson.meetingUrl && (
              <a
                href={lesson.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400 hover:underline pt-0.5"
              >
                <Video className="h-3 w-3" />
                <span className="truncate max-w-[220px]">Подключиться к уроку</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>
        </div>

        {/* Right: Status Dropdown & Action buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
          {/* Status Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer hover:opacity-90 ${currentStatus.badgeClass}`}
                />
              }
            >
              {updateStatusMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <currentStatus.icon className="h-3.5 w-3.5" />
              )}
              <span>{currentStatus.label}</span>
              <ChevronDown className="h-3 w-3 opacity-70" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                onClick={() => handleStatusChange('SCHEDULED')}
                className="flex items-center gap-2 text-xs"
              >
                <CalendarClock className="h-4 w-4 text-blue-600" />
                <span>Запланирован</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleStatusChange('COMPLETED')}
                className="flex items-center gap-2 text-xs"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Проведен</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => handleStatusChange('CANCELLED_BY_TUTOR')}
                className="flex items-center gap-2 text-xs text-rose-600"
              >
                <XCircle className="h-4 w-4" />
                <span>Отменен репетитором</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleStatusChange('CANCELLED_BY_STUDENT')}
                className="flex items-center gap-2 text-xs text-amber-600"
              >
                <XCircle className="h-4 w-4" />
                <span>Отменен учеником</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Action buttons: Edit & Delete */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit(lesson)}
              title="Редактировать урок"
              className="text-muted-foreground hover:text-foreground"
            >
              <Edit2 className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete(lesson)}
              title="Удалить урок"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
