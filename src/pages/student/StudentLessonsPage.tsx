import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { useMyLessons } from '@/hooks/useLessons'
import { StudentLessonCard } from './lessons/StudentLessonCard'
import { CancelLessonDialog } from './lessons/CancelLessonDialog'
import {
  Calendar as CalendarIcon,
  CalendarDays,
  AlertCircle,
} from 'lucide-react'
import type { Lesson } from '@/types'

type PeriodMode = 'this_week' | 'next_week' | 'custom'

function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - (day === 0 ? 6 : day - 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function formatDateToIso(d: Date): string {
  return d.toISOString()
}

function formatDateToInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function StudentLessonsPage() {
  const [periodMode, setPeriodMode] = useState<PeriodMode>('this_week')

  // Custom date range state
  const [customFrom, setCustomFrom] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 3)
    return formatDateToInput(d)
  })
  const [customTo, setCustomTo] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return formatDateToInput(d)
  })

  // Cancel dialog state
  const [cancellingLesson, setCancellingLesson] = useState<Lesson | null>(null)
  const [isCancelOpen, setIsCancelOpen] = useState(false)

  // Compute date range based on periodMode
  const dateRange = useMemo(() => {
    const now = new Date()

    if (periodMode === 'this_week') {
      const mon = getMonday(now)
      const sun = new Date(mon)
      sun.setDate(sun.getDate() + 6)
      sun.setHours(23, 59, 59, 999)
      return { from: formatDateToIso(mon), to: formatDateToIso(sun) }
    }

    if (periodMode === 'next_week') {
      const thisMon = getMonday(now)
      const nextMon = new Date(thisMon)
      nextMon.setDate(nextMon.getDate() + 7)
      const nextSun = new Date(nextMon)
      nextSun.setDate(nextSun.getDate() + 6)
      nextSun.setHours(23, 59, 59, 999)
      return { from: formatDateToIso(nextMon), to: formatDateToIso(nextSun) }
    }

    // Custom
    const start = new Date(customFrom)
    start.setHours(0, 0, 0, 0)
    const end = new Date(customTo)
    end.setHours(23, 59, 59, 999)
    return {
      from: isNaN(start.getTime()) ? undefined : formatDateToIso(start),
      to: isNaN(end.getTime()) ? undefined : formatDateToIso(end),
    }
  }, [periodMode, customFrom, customTo])

  const { data: lessons = [], isLoading, isError, refetch } = useMyLessons(dateRange)

  // Group lessons by day (YYYY-MM-DD)
  const groupedLessons = useMemo(() => {
    const groups: Record<string, Lesson[]> = {}

    // Sort ascending by startTime
    const sorted = [...lessons].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    )

    sorted.forEach((lesson) => {
      const d = new Date(lesson.startTime)
      const dateKey = isNaN(d.getTime()) ? 'Без даты' : formatDateToInput(d)

      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(lesson)
    })

    return groups
  }, [lessons])

  const sortedDayKeys = useMemo(() => {
    return Object.keys(groupedLessons).sort()
  }, [groupedLessons])

  const todayStr = formatDateToInput(new Date())

  // Period stats
  const stats = useMemo(() => {
    const total = lessons.length
    const scheduled = lessons.filter((l) => l.status === 'SCHEDULED').length
    const completed = lessons.filter((l) => l.status === 'COMPLETED').length
    return { total, scheduled, completed }
  }, [lessons])

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Мои уроки</h1>
        <p className="text-muted-foreground text-sm">
          Расписание занятий, темы уроков и ссылки на подключение
        </p>
      </div>

      {/* Period Filter Card */}
      <Card className="border-border">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={periodMode === 'this_week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriodMode('this_week')}
              className="text-xs"
            >
              Эта неделя
            </Button>
            <Button
              variant={periodMode === 'next_week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriodMode('next_week')}
              className="text-xs"
            >
              Следующая неделя
            </Button>
            <Button
              variant={periodMode === 'custom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriodMode('custom')}
              className="text-xs"
            >
              Выбрать период
            </Button>
          </div>

          {periodMode === 'custom' && (
            <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
              <Input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="h-8 text-xs w-36"
              />
              <span className="text-muted-foreground">—</span>
              <Input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="h-8 text-xs w-36"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-lg border bg-card text-card-foreground flex flex-col">
          <span className="text-xs text-muted-foreground font-medium">Всего в периоде</span>
          <span className="text-xl font-bold text-foreground mt-0.5">{stats.total}</span>
        </div>
        <div className="p-3.5 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 flex flex-col">
          <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
            Предстоит
          </span>
          <span className="text-xl font-bold text-blue-800 dark:text-blue-200 mt-0.5">
            {stats.scheduled}
          </span>
        </div>
        <div className="p-3.5 rounded-lg border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 flex flex-col">
          <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
            Проведено
          </span>
          <span className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mt-0.5">
            {stats.completed}
          </span>
        </div>
      </div>

      {/* Lesson list grouped by day */}
      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground text-lg">
                Не удалось загрузить расписание
              </p>
              <p className="text-sm text-muted-foreground">
                Проверьте подключение к сети и попробуйте снова
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Повторить попытку
            </Button>
          </CardContent>
        </Card>
      ) : sortedDayKeys.length > 0 ? (
        <div className="space-y-8">
          {sortedDayKeys.map((dayKey) => {
            const dayLessons = groupedLessons[dayKey]
            const isToday = dayKey === todayStr

            let dayTitle = dayKey
            if (dayKey !== 'Без даты') {
              const [y, m, d] = dayKey.split('-').map(Number)
              const dateObj = new Date(y, m - 1, d)
              dayTitle = dateObj.toLocaleDateString('ru-RU', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })
              // Capitalize first letter
              dayTitle = dayTitle.charAt(0).toUpperCase() + dayTitle.slice(1)
            }

            return (
              <div key={dayKey} className="space-y-3">
                {/* Day Header */}
                <div className="flex items-center gap-2.5 pb-1 border-b border-border">
                  <CalendarDays
                    className={`h-4 w-4 ${
                      isToday ? 'text-primary font-bold' : 'text-muted-foreground'
                    }`}
                  />
                  <h2 className="font-semibold text-sm sm:text-base text-foreground">
                    {dayTitle}
                  </h2>
                  {isToday && (
                    <Badge variant="default" className="text-[10px] px-2 py-0">
                      Сегодня
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto font-medium">
                    {dayLessons.length} {dayLessons.length === 1 ? 'занятие' : 'занятия'}
                  </span>
                </div>

                {/* Day Lessons Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dayLessons.map((lesson) => (
                    <StudentLessonCard
                      key={lesson.id}
                      lesson={lesson}
                      onCancelLesson={(l) => {
                        setCancellingLesson(l)
                        setIsCancelOpen(true)
                      }}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <Card className="border-border">
          <CardContent className="py-16 text-center flex flex-col items-center justify-center space-y-3">
            <div className="p-3 rounded-full bg-muted text-muted-foreground">
              <CalendarIcon className="h-7 w-7" />
            </div>
            <div className="max-w-xs space-y-1">
              <p className="font-semibold text-foreground">Уроков не запланировано</p>
              <p className="text-xs text-muted-foreground">
                В выбранный период занятий нет. Преподаватель добавит уроки в расписание по мере согласования.
              </p>
            </div>
            {periodMode !== 'this_week' && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 text-xs"
                onClick={() => setPeriodMode('this_week')}
              >
                Вернуться на эту неделю
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cancel Lesson Dialog */}
      <CancelLessonDialog
        open={isCancelOpen}
        onOpenChange={setIsCancelOpen}
        lesson={cancellingLesson}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
