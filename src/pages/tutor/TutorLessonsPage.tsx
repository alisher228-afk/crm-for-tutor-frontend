import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { useLessons } from '@/hooks/useLessons'
import { useStudents } from '@/hooks/useStudents'
import { LessonCard, type LessonCardStudent } from './lessons/LessonCard'
import { LessonFormDialog } from './lessons/LessonFormDialog'
import { DeleteLessonConfirmDialog } from './lessons/DeleteLessonConfirmDialog'
import { GroupStudentsDialog } from './lessons/GroupStudentsDialog'
import { StudentDetailsSheet } from './students/StudentDetailsSheet'
import {
  CalendarPlus,
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
  AlertCircle,
  User,
  Users,
} from 'lucide-react'
import { formatDateToLocalIso } from '@/lib/dateUtils'
import type { Lesson, StudentProfile } from '@/types'

type PeriodMode = 'this_week' | 'next_week' | 'custom'

interface SessionItem {
  key: string
  lesson: Lesson
  sessionLessons: Lesson[]
  isGroup: boolean
  groupName?: string
  startTime: string
  endTime: string
  title: string
  students: LessonCardStudent[]
  hasConflict: boolean
  conflictingNames: string[]
}

function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - (day === 0 ? 6 : day - 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function formatDateToIso(d: Date): string {
  return formatDateToLocalIso(d)
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

  const [deleteCandidate, setDeleteCandidate] = useState<{
    lesson: Lesson
    sessionLessons?: Lesson[]
  } | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // Group modal state
  const [viewGroupModal, setViewGroupModal] = useState<{
    open: boolean
    groupName: string
    students: LessonCardStudent[]
  }>({
    open: false,
    groupName: '',
    students: [],
  })

  // Student details sheet state
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [isStudentDetailsOpen, setIsStudentDetailsOpen] = useState(false)

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
  const { data: studentsData } = useStudents({ size: 200 })
  const allStudents = useMemo(() => studentsData?.content || [], [studentsData])

  const studentsById = useMemo(() => {
    const map = new Map<string, StudentProfile>()
    allStudents.forEach((st) => {
      map.set(st.id, st)
    })
    return map
  }, [allStudents])

  // Consolidate group lessons sharing the same groupName & startTime into unified session items
  const sessions = useMemo(() => {
    // 1. Group individual lesson items into session buckets
    const sessionMap = new Map<string, { lesson: Lesson; sessionLessons: Lesson[] }>()

    lessons.forEach((l) => {
      const gName = l.groupName?.trim()
      let bucketKey: string
      if (gName) {
        const sTime = new Date(l.startTime).getTime()
        const eTime = new Date(l.endTime).getTime()
        bucketKey = `group:${gName.toLowerCase()}_${sTime}_${eTime}`
      } else {
        bucketKey = `indiv:${l.id}`
      }

      const existing = sessionMap.get(bucketKey)
      if (existing) {
        existing.sessionLessons.push(l)
      } else {
        sessionMap.set(bucketKey, { lesson: l, sessionLessons: [l] })
      }
    })

    // 2. Build preliminary SessionItem list
    const items: SessionItem[] = []

    sessionMap.forEach(({ lesson, sessionLessons }, key) => {
      const isGroup = Boolean(lesson.groupName?.trim())
      const gName = lesson.groupName?.trim()

      let sessionStudents: LessonCardStudent[] = []
      let title = ''

      if (isGroup && gName) {
        title = `Группа «${gName}»`

        // Collect students from session lessons
        const studentMap = new Map<string, LessonCardStudent>()

        sessionLessons.forEach((l) => {
          const profile = studentsById.get(l.studentId)
          const name =
            (profile?.firstName
              ? `${profile.firstName} ${profile.lastName || ''}`.trim()
              : undefined) ||
            l.studentName ||
            [l.studentFirstName, l.studentLastName].filter(Boolean).join(' ') ||
            'Ученик'

          studentMap.set(l.studentId, {
            id: l.studentId,
            name,
            firstName: profile?.firstName || l.studentFirstName,
            lastName: profile?.lastName || l.studentLastName,
            phone: profile?.phone,
            telegram: profile?.telegram,
            currentLevel: profile?.currentLevel,
            lessonBalance: profile?.lessonBalance,
          })
        })

        // Also enrich with any registered students belonging to this group if not already present
        allStudents
          .filter(
            (s) => (s.groupName || '').trim().toLowerCase() === gName.toLowerCase(),
          )
          .forEach((s) => {
            if (!studentMap.has(s.id)) {
              const name =
                (s.firstName
                  ? `${s.firstName} ${s.lastName || ''}`.trim()
                  : undefined) ||
                s.name ||
                'Ученик'
              studentMap.set(s.id, {
                id: s.id,
                name,
                firstName: s.firstName,
                lastName: s.lastName,
                phone: s.phone,
                telegram: s.telegram,
                currentLevel: s.currentLevel,
                lessonBalance: s.lessonBalance,
              })
            }
          })

        sessionStudents = Array.from(studentMap.values())
      } else {
        // Individual lesson
        const profile = studentsById.get(lesson.studentId)
        const name =
          (profile?.firstName
            ? `${profile.firstName} ${profile.lastName || ''}`.trim()
            : undefined) ||
          lesson.studentName ||
          [lesson.studentFirstName, lesson.studentLastName].filter(Boolean).join(' ') ||
          'Индивидуальный ученик'

        title = name
        sessionStudents = [
          {
            id: lesson.studentId,
            name,
            firstName: profile?.firstName || lesson.studentFirstName,
            lastName: profile?.lastName || lesson.studentLastName,
            phone: profile?.phone,
            telegram: profile?.telegram,
            currentLevel: profile?.currentLevel,
            lessonBalance: profile?.lessonBalance,
          },
        ]
      }

      items.push({
        key,
        lesson,
        sessionLessons,
        isGroup,
        groupName: gName,
        startTime: lesson.startTime,
        endTime: lesson.endTime,
        title,
        students: sessionStudents,
        hasConflict: false,
        conflictingNames: [],
      })
    })

    // 3. Compute Google Calendar-style soft time conflicts between active sessions
    for (let i = 0; i < items.length; i++) {
      const a = items[i]
      const isCancelledA =
        a.lesson.status === 'CANCELLED_BY_TUTOR' ||
        a.lesson.status === 'CANCELLED_BY_STUDENT'
      if (isCancelledA) continue

      const sA = new Date(a.startTime).getTime()
      const eA = new Date(a.endTime).getTime()
      if (isNaN(sA) || isNaN(eA) || eA <= sA) continue

      for (let j = i + 1; j < items.length; j++) {
        const b = items[j]
        const isCancelledB =
          b.lesson.status === 'CANCELLED_BY_TUTOR' ||
          b.lesson.status === 'CANCELLED_BY_STUDENT'
        if (isCancelledB) continue

        const sB = new Date(b.startTime).getTime()
        const eB = new Date(b.endTime).getTime()
        if (isNaN(sB) || isNaN(eB) || eB <= sB) continue

        // Check interval overlap: sA < eB && eA > sB
        if (sA < eB && eA > sB) {
          a.hasConflict = true
          if (!a.conflictingNames.includes(b.title)) {
            a.conflictingNames.push(b.title)
          }
          b.hasConflict = true
          if (!b.conflictingNames.includes(a.title)) {
            b.conflictingNames.push(a.title)
          }
        }
      }
    }

    return items
  }, [lessons, studentsById, allStudents])

  const [lessonTypeFilter, setLessonTypeFilter] = useState<'ALL' | 'INDIVIDUAL' | 'GROUP'>('ALL')

  const individualSessionsCount = useMemo(
    () => sessions.filter((s) => !s.isGroup).length,
    [sessions],
  )
  const groupSessionsCount = useMemo(
    () => sessions.filter((s) => s.isGroup).length,
    [sessions],
  )

  // Group sessions by day (YYYY-MM-DD)
  const groupedSessions = useMemo(() => {
    const groups: Record<string, SessionItem[]> = {}

    let filtered = sessions
    if (lessonTypeFilter === 'INDIVIDUAL') {
      filtered = sessions.filter((s) => !s.isGroup)
    } else if (lessonTypeFilter === 'GROUP') {
      filtered = sessions.filter((s) => s.isGroup)
    }

    // Sort ascending by startTime
    const sorted = [...filtered].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    )

    sorted.forEach((session) => {
      const d = new Date(session.startTime)
      const dateKey = isNaN(d.getTime())
        ? 'Без даты'
        : formatDateToInput(d)

      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(session)
    })

    return groups
  }, [sessions, lessonTypeFilter])

  const sortedDayKeys = useMemo(() => {
    return Object.keys(groupedSessions).sort()
  }, [groupedSessions])

  const handleCreate = () => {
    setEditingLesson(null)
    setIsFormOpen(true)
  }

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setIsFormOpen(true)
  }

  const handleDelete = (lesson: Lesson, sessionLessons?: Lesson[]) => {
    setDeleteCandidate({ lesson, sessionLessons })
    setIsDeleteOpen(true)
  }

  const handleViewGroupStudents = (groupName: string, students: LessonCardStudent[]) => {
    setViewGroupModal({
      open: true,
      groupName,
      students,
    })
  }

  const handleSelectStudent = (studentId: string) => {
    setViewGroupModal((prev) => ({ ...prev, open: false }))
    setSelectedStudentId(studentId)
    setIsStudentDetailsOpen(true)
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

      {/* Format Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <Button
          variant={lessonTypeFilter === 'ALL' ? 'default' : 'outline'}
          size="sm"
          className="h-8 text-xs font-medium"
          onClick={() => setLessonTypeFilter('ALL')}
        >
          Все занятия ({sessions.length})
        </Button>
        <Button
          variant={lessonTypeFilter === 'INDIVIDUAL' ? 'default' : 'outline'}
          size="sm"
          className="h-8 text-xs font-medium flex items-center gap-1.5"
          onClick={() => setLessonTypeFilter('INDIVIDUAL')}
        >
          <User className="h-3.5 w-3.5" />
          <span>Индивидуальные ({individualSessionsCount})</span>
        </Button>
        <Button
          variant={lessonTypeFilter === 'GROUP' ? 'default' : 'outline'}
          size="sm"
          className="h-8 text-xs font-medium flex items-center gap-1.5"
          onClick={() => setLessonTypeFilter('GROUP')}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Групповые ({groupSessionsCount})</span>
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
          <span>Всего занятий за период:</span>
          <span className="font-semibold text-foreground">{sessions.length}</span>
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
            const daySessions = groupedSessions[dayKey] || []
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
                  <h2 className="font-bold text-base text-foreground tracking-tight flex items-center gap-1.5">
                    {isToday && (
                      <span className="h-1.5 w-1.5 rounded-full bg-red-accent inline-block" />
                    )}
                    {dayTitle}
                  </h2>
                  {isToday && (
                    <Badge variant="today" className="text-[10px] px-2 py-0.5 font-semibold flex items-center gap-1 border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300">
                      <span className="h-1 w-1 rounded-full bg-red-accent animate-pulse" />
                      Сегодня
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {daySessions.length}{' '}
                    {daySessions.length === 1
                      ? 'занятие'
                      : daySessions.length < 5
                      ? 'занятия'
                      : 'занятий'}
                  </span>
                </div>

                {/* Day Cards */}
                <div className="space-y-2.5">
                  {daySessions.map((session) => (
                    <LessonCard
                      key={session.key}
                      lesson={session.lesson}
                      sessionLessons={session.sessionLessons}
                      students={session.students}
                      hasConflict={session.hasConflict}
                      conflictingNames={session.conflictingNames}
                      onEdit={handleEdit}
                      onDelete={(lesson, sessionLessons) =>
                        handleDelete(lesson, sessionLessons)
                      }
                      onViewGroupStudents={handleViewGroupStudents}
                      onSelectStudent={handleSelectStudent}
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
              <p className="font-semibold text-base">
                {lessonTypeFilter === 'INDIVIDUAL'
                  ? 'Нет индивидуальных уроков за выбранный период'
                  : lessonTypeFilter === 'GROUP'
                  ? 'Нет групповых уроков за выбранный период'
                  : 'Нет уроков за выбранный период'}
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Запланируйте первое занятие или выберите другой формат/период.
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
        existingLessons={lessons}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteLessonConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        lesson={deleteCandidate?.lesson ?? null}
        sessionLessons={deleteCandidate?.sessionLessons}
      />

      {/* Group Students Dialog */}
      <GroupStudentsDialog
        open={viewGroupModal.open}
        onOpenChange={(open) =>
          setViewGroupModal((prev) => ({ ...prev, open }))
        }
        groupName={viewGroupModal.groupName}
        students={viewGroupModal.students}
        onSelectStudent={handleSelectStudent}
      />

      {/* Student Details Sheet */}
      <StudentDetailsSheet
        studentId={selectedStudentId}
        open={isStudentDetailsOpen}
        onOpenChange={setIsStudentDetailsOpen}
      />
    </div>
  )
}
