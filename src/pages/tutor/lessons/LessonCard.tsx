import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Users,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react'
import type { Lesson, LessonStatus } from '@/types'
import type { AxiosError } from 'axios'

function getStudentNoun(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 19) return 'учеников'
  if (mod10 === 1) return 'ученик'
  if (mod10 >= 2 && mod10 <= 4) return 'ученика'
  return 'учеников'
}

export interface LessonCardStudent {
  id: string
  name: string
  firstName?: string
  lastName?: string
  phone?: string
  telegram?: string
  currentLevel?: string
  lessonBalance?: number
}

interface LessonCardProps {
  lesson: Lesson
  sessionLessons?: Lesson[]
  students?: LessonCardStudent[]
  hasConflict?: boolean
  conflictingNames?: string[]
  onEdit: (lesson: Lesson) => void
  onDelete: (lesson: Lesson, sessionLessons?: Lesson[]) => void
  onViewGroupStudents?: (groupName: string, students: LessonCardStudent[]) => void
  onSelectStudent?: (studentId: string) => void
}

const statusConfig: Record<
  string,
  { label: string; badgeClass: string; icon: typeof CheckCircle2 }
> = {
  SCHEDULED: {
    label: 'Запланирован',
    badgeClass:
      'bg-muted text-foreground border-border font-medium',
    icon: CalendarClock,
  },
  COMPLETED: {
    label: 'Проведен',
    badgeClass:
      'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20 font-medium',
    icon: CheckCircle2,
  },
  CANCELLED_BY_TUTOR: {
    label: 'Отменен (тьютор)',
    badgeClass:
      'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 font-medium',
    icon: XCircle,
  },
  CANCELLED_BY_STUDENT: {
    label: 'Отменен (ученик)',
    badgeClass:
      'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20 font-medium',
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

export function LessonCard({
  lesson,
  sessionLessons,
  students,
  hasConflict,
  conflictingNames,
  onEdit,
  onDelete,
  onViewGroupStudents,
  onSelectStudent,
}: LessonCardProps) {
  const updateStatusMutation = useUpdateLessonStatus()

  const startFormatted = formatTime(lesson.startTime)
  const endFormatted = formatTime(lesson.endTime)
  const duration = getDurationMinutes(lesson.startTime, lesson.endTime)

  const currentStatus = statusConfig[lesson.status] || {
    label: lesson.status,
    badgeClass: 'bg-muted text-muted-foreground',
    icon: CalendarClock,
  }

  const isGroup = Boolean(lesson.groupName?.trim())

  const studentFullName =
    lesson.studentName?.trim() ||
    [lesson.studentFirstName, lesson.studentLastName].filter(Boolean).join(' ').trim() ||
    ''

  const displayTitle = isGroup
    ? lesson.groupName!.trim()
    : studentFullName || 'Индивидуальный ученик'

  const studentInitial = studentFullName
    ? studentFullName.charAt(0).toUpperCase()
    : 'У'

  const displayStudents = students || []

  const handleStatusChange = async (status: LessonStatus) => {
    if (status === lesson.status) return

    try {
      if (sessionLessons && sessionLessons.length > 1) {
        await Promise.all(
          sessionLessons.map((l) =>
            updateStatusMutation.mutateAsync({ id: l.id, status }),
          ),
        )
        toast.success(
          `Статус занятия изменен на "${statusConfig[status]?.label || status}" для всей группы`,
        )
      } else {
        await updateStatusMutation.mutateAsync({ id: lesson.id, status })
        toast.success(
          `Статус занятия изменен на "${statusConfig[status]?.label || status}"`,
        )
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      toast.error(
        axiosError.response?.data?.message || 'Не удалось изменить статус урока',
      )
    }
  }

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
        hasConflict
          ? 'border-amber-400/60 bg-amber-500/5'
          : isToday
          ? 'border-border border-l-[3px] border-l-red-accent hover:shadow-xs'
          : 'border-border hover:shadow-xs'
      }`}
    >
      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Time & Student / Group */}
        <div className="flex items-start sm:items-center gap-4 min-w-0">
          {/* Time Badge Box */}
          <div
            className={`flex flex-col items-center justify-center rounded-lg px-3 py-2 text-center shrink-0 w-24 border transition-colors relative ${
              hasConflict
                ? 'border-amber-400/60 bg-amber-500/10 text-amber-900 dark:text-amber-200'
                : isToday
                ? 'bg-muted/80 border-border text-foreground'
                : 'bg-muted/50 border-border text-foreground'
            }`}
          >
            {isToday && (
              <span
                className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-accent"
                title="Занятие на сегодня"
              />
            )}
            <span className="text-sm font-bold tracking-tight tabular-nums">
              {startFormatted}
            </span>
            <span className="text-[11px] text-muted-foreground tabular-nums">{endFormatted}</span>
            {duration > 0 && (
              <span className="text-[10px] text-muted-foreground/80 mt-0.5 font-medium tabular-nums">
                {duration} мин.
              </span>
            )}
          </div>

          {/* Student / Group & Topic */}
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Avatar size="sm">
                <AvatarFallback
                  className={
                    isGroup
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] font-semibold'
                      : 'bg-primary/10 text-primary text-[11px] font-semibold'
                  }
                >
                  {isGroup ? <Users className="h-3.5 w-3.5" /> : studentInitial}
                </AvatarFallback>
              </Avatar>

              {!isGroup && lesson.studentId && onSelectStudent ? (
                <button
                  type="button"
                  onClick={() => onSelectStudent(lesson.studentId)}
                  className="font-semibold text-sm text-foreground truncate hover:text-primary hover:underline cursor-pointer text-left"
                  title="Открыть карточку ученика"
                >
                  {displayTitle}
                </button>
              ) : (
                <span className="font-semibold text-sm text-foreground truncate">
                  {displayTitle}
                </span>
              )}

              {isGroup ? (
                <button
                  type="button"
                  onClick={() => onViewGroupStudents?.(lesson.groupName!, displayStudents)}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                  title="Посмотреть полный список учеников"
                >
                  <Users className="h-3 w-3" />
                  <span>
                    {displayStudents.length > 0
                      ? `${displayStudents.length} ${getStudentNoun(displayStudents.length)}`
                      : 'Группа'}
                  </span>
                  <ChevronRight className="h-3 w-3 opacity-60" />
                </button>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[10px] text-muted-foreground font-normal px-1.5 py-0"
                >
                  Индивидуально
                </Badge>
              )}

              {/* Time Conflict Soft Warning Badge */}
              {hasConflict && (
                <Badge
                  variant="outline"
                  className="text-[10px] border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1 px-1.5 py-0"
                  title={
                    conflictingNames?.length
                      ? `Пересекается с: ${conflictingNames.join(', ')}`
                      : 'Пересечение по времени с другим уроком'
                  }
                >
                  <AlertTriangle className="h-2.5 w-2.5" />
                  Накладка
                </Badge>
              )}
            </div>

            {/* In a group lesson: show student chips preview */}
            {isGroup && displayStudents.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {displayStudents.slice(0, 3).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      if (onSelectStudent && st.id) {
                        onSelectStudent(st.id)
                      } else {
                        onViewGroupStudents?.(lesson.groupName!, displayStudents)
                      }
                    }}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] bg-muted hover:bg-muted/80 text-foreground font-medium border border-border/60 transition-colors cursor-pointer"
                    title={`Ученик: ${st.name}. Нажмите, чтобы открыть информацию`}
                  >
                    {st.name}
                  </button>
                ))}
                {displayStudents.length > 3 && (
                  <button
                    type="button"
                    onClick={() => onViewGroupStudents?.(lesson.groupName!, displayStudents)}
                    className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                  >
                    +{displayStudents.length - 3} ещё...
                  </button>
                )}
              </div>
            )}

            {lesson.topic ? (
              <p className="text-sm text-foreground font-medium truncate">
                {lesson.topic}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Тема занятия не указана
              </p>
            )}

            {lesson.cancellationReason && (
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                Причина отмены: {lesson.cancellationReason}
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
              onClick={() => onDelete(lesson, sessionLessons)}
              title={isGroup ? 'Удалить групповое занятие' : 'Удалить урок'}
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
