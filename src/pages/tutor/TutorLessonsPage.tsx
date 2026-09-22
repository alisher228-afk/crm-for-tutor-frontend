import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { useLessons } from '@/hooks/useLessons'
import { LessonCard } from './lessons/LessonCard'
import { LessonFormDialog } from './lessons/LessonFormDialog'
import { DeleteLessonConfirmDialog } from './lessons/DeleteLessonConfirmDialog'
import {
  CalendarPlus,
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
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

export function TutorLessonsPage() {
  const [periodMode, setPeriodMode] = useState<PeriodMode>('this_week')

  // Custom date range state
  const [customFrom, setCustomFrom] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 3)
    return formatDateToInput(d)
  })
  const [customTo, setCustomTo] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return formatDateToInput(d)
  })

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)

  const [deleteCandidate, setDeleteCandidate] = useState<Lesson | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

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

  const { data: lessons = [], isLoading, isError, refetch } = useLessons(dateRange)

  // Group lessons by day (YYYY-MM-DD)
  const groupedLessons = useMemo(() => {
    const groups: Record<string, Lesson[]> = {}

    // Sort ascending by startTime
    const sorted = [...lessons].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    )

    sorted.forEach((lesson) => {
      const d = new Date(lesson.startTime)
      const dateKey = isNaN(d.getTime())
        ? 'Без даты'
        : formatDateToInput(d)

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

  const handleCreate = () => {
    setEditingLesson(null)
    setIsFormOpen(true)
  }

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setIsFormOpen(true)
  }

  const handleDelete = (lesson: Lesson) => {
    setDeleteCandidate(lesson)
    setIsDeleteOpen(true)
  }

  const todayStr = formatDateToInput(new Date())

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Расписание уроков</h1>
          <p className="text-muted-foreground text-sm">
            Управляйте графиком занятий, временем и ссылками на онлайн-уроки
          </p>
        </div>

        <Button onClick={handleCreate} className="self-start sm:self-auto gap-2">
          <CalendarPlus className="h-4 w-4" />
          <span>Запланировать урок</span>
        </Button>
      </div>

      {/* Period Switcher Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-card rounded-xl border border-border">
        {/* Quick range tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
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
            Выбрать диапазон
          </Button>
        </div>

        {/* Custom date range inputs */}
        {periodMode === 'custom' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">С</span>
            <Input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="h-8 text-xs w-36"
            />
            <span className="text-muted-foreground">По</span>
            <Input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="h-8 text-xs w-36"
            />
          </div>
        )}

        {/* Count info */}
        <div className="text-xs text-muted-foreground flex items-center gap-1.5 self-end md:self-auto">
          <Clock className="h-3.5 w-3.5" />
          <span>Всего уроков за период:</span>
          <span className="font-semibold text-foreground">{lessons.length}</span>
        </div>
      </div>

      {/* Lessons List Grouped By Days */}
      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="space-y-3">
              <Skeleton className="h-6 w-48 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div>
              <p className="font-semibold text-base text-foreground">
                Не удалось загрузить расписание
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Проверьте подключение к серверу и попробуйте снова.
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
            const dayLessons = groupedLessons[dayKey] || []
            const isToday = dayKey === todayStr

            let dayTitle = dayKey
            if (dayKey !== 'Без даты') {
              const d = new Date(dayKey + 'T00:00:00')
              if (!isNaN(d.getTime())) {
                const formatted = d.toLocaleDateString('ru-RU', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })
                dayTitle = formatted.charAt(0).toUpperCase() + formatted.slice(1)
              }
            }

            return (
              <div key={dayKey} className="space-y-3">
                {/* Day Header */}
                <div className="flex items-center gap-2 pb-1 border-b border-border">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <h2 className="font-bold text-base text-foreground tracking-tight">
                    {dayTitle}
                  </h2>
                  {isToday && (
                    <Badge variant="default" className="text-[10px] px-1.5 py-0 font-medium">
                      Сегодня
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {dayLessons.length} {dayLessons.length === 1 ? 'урок' : 'урока'}
                  </span>
                </div>

                {/* Day Cards */}
                <div className="space-y-2.5">
                  {dayLessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
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
          <CardContent className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-base">Нет уроков за выбранный период</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Запланируйте первое занятие или выберите другой временной интервал в переключателе сверху.
              </p>
            </div>
            <Button size="sm" onClick={handleCreate}>
              <CalendarPlus className="mr-2 h-4 w-4" />
              Запланировать занятие
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Lesson Form Dialog (Create / Edit) */}
      <LessonFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={editingLesson}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteLessonConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        lesson={deleteCandidate}
      />
    </div>
  )
}
