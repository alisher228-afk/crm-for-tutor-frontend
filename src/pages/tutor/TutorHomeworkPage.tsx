import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useStudents } from '@/hooks/useStudents'
import { useStudentHomework, useUpdateHomeworkStatus } from '@/hooks/useHomework'
import { CreateHomeworkDialog } from './homework/CreateHomeworkDialog'
import { HomeworkDetailsSheet } from './homework/HomeworkDetailsSheet'
import { toast } from 'sonner'
import {
  BookCheck,
  BookPlus,
  Search,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  MessageSquare,
  Paperclip,
  Loader2,
  ChevronRight,
} from 'lucide-react'
import type { Homework, StudentProfile } from '@/types'
import type { AxiosError } from 'axios'

const statusBadgeConfig: Record<
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
  const text = d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
  return { text, isPast }
}

export function TutorHomeworkPage() {
  // Fetch students list for the selector
  const { data: studentsData, isLoading: isLoadingStudents } = useStudents({
    size: 100,
  })
  const students = useMemo(() => studentsData?.content || [], [studentsData])

  const [studentSearch, setStudentSearch] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')

  // If none selected yet and students loaded, pre-select first student
  const currentStudentId =
    selectedStudentId || (students.length > 0 ? students[0].id : '')

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === currentStudentId),
    [students, currentStudentId],
  )

  const selectedStudentName =
    selectedStudent?.name ||
    [selectedStudent?.firstName, selectedStudent?.lastName]
      .filter(Boolean)
      .join(' ') ||
    'Ученик'

  // Fetch homework for selected student
  const {
    data: homeworkList = [],
    isLoading: isLoadingHomework,
    isError: isErrorHomework,
    refetch: refetchHomework,
  } = useStudentHomework(currentStudentId)

  // Status mutation
  const updateStatusMutation = useUpdateHomeworkStatus()

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const filteredStudents = useMemo(() => {
    return students.filter((s: StudentProfile) => {
      const fullName =
        s.name || [s.firstName, s.lastName].filter(Boolean).join(' ') || ''
      return fullName.toLowerCase().includes(studentSearch.toLowerCase())
    })
  }, [students, studentSearch])

  // Stats calculation
  const stats = useMemo(() => {
    const total = homeworkList.length
    const submitted = homeworkList.filter((h) => h.status === 'SUBMITTED').length
    const assigned = homeworkList.filter((h) => h.status === 'ASSIGNED').length
    const reviewed = homeworkList.filter((h) => h.status === 'REVIEWED').length
    return { total, submitted, assigned, reviewed }
  }, [homeworkList])

  const handleCardClick = (hw: Homework) => {
    setSelectedHomework(hw)
    setIsDetailsOpen(true)
  }

  const handleQuickReview = async (e: React.MouseEvent, hw: Homework) => {
    e.stopPropagation()
    try {
      await updateStatusMutation.mutateAsync({
        id: hw.id,
        status: 'REVIEWED',
      })
      toast.success(`Задание "${hw.title}" проверено!`)
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      toast.error(
        axiosError.response?.data?.message || 'Не удалось обновить статус',
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Домашние задания</h1>
          <p className="text-muted-foreground text-sm">
            Выдавайте задания, проверяйте решения и просматривайте вложения
          </p>
        </div>

        {currentStudentId && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="self-start sm:self-auto gap-2"
          >
            <BookPlus className="h-4 w-4" />
            <span>Выдать задание</span>
          </Button>
        )}
      </div>

      {/* Student Selector Card */}
      <Card className="border-border">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <User className="h-4 w-4 text-primary" />
              <span>Выбор ученика:</span>
              <span className="font-bold text-primary">
                {selectedStudentName}
              </span>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Фильтр учеников..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="pl-8 h-8 text-xs bg-background"
              />
            </div>
          </div>

          {/* Quick horizontal student selector pill list */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
            {isLoadingStudents ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-28 rounded-full shrink-0" />
              ))
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((s) => {
                const name =
                  s.name ||
                  [s.firstName, s.lastName].filter(Boolean).join(' ') ||
                  'Ученик'
                const isSelected = s.id === currentStudentId
                const initial = name.charAt(0).toUpperCase()

                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedStudentId(s.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border'
                    }`}
                  >
                    <Avatar size="sm" className="size-4">
                      <AvatarFallback
                        className={`text-[9px] ${
                          isSelected
                            ? 'bg-primary-foreground text-primary'
                            : 'bg-background text-foreground'
                        }`}
                      >
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                    <span>{name}</span>
                  </button>
                )
              })
            ) : (
              <p className="text-xs text-muted-foreground py-1">
                Ученики не найдены
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Student Stats and Header */}
      {selectedStudent && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground font-medium">Всего</p>
              <p className="text-xl font-bold mt-0.5 text-foreground">
                {stats.total}
              </p>
            </CardContent>
          </Card>

          <Card
            className={`border-border ${
              stats.submitted > 0
                ? 'border-amber-300 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-900'
                : ''
            }`}
          >
            <CardContent className="p-3 text-center">
              <p
                className={`text-xs font-medium ${
                  stats.submitted > 0
                    ? 'text-amber-700 dark:text-amber-300 font-semibold'
                    : 'text-muted-foreground'
                }`}
              >
                На проверке
              </p>
              <p
                className={`text-xl font-bold mt-0.5 ${
                  stats.submitted > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-foreground'
                }`}
              >
                {stats.submitted}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground font-medium">В работе</p>
              <p className="text-xl font-bold mt-0.5 text-foreground">
                {stats.assigned}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground font-medium">Проверено</p>
              <p className="text-xl font-bold mt-0.5 text-emerald-600 dark:text-emerald-400">
                {stats.reviewed}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Homework Cards List */}
      {isLoadingHomework ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : isErrorHomework ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div>
              <p className="font-semibold text-base text-foreground">
                Не удалось загрузить домашние задания
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Проверьте соединение с сервером и повторите попытку.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchHomework()}>
              Повторить попытку
            </Button>
          </CardContent>
        </Card>
      ) : homeworkList.length > 0 ? (
        <div className="space-y-3">
          {homeworkList.map((hw) => {
            const statusInfo = statusBadgeConfig[hw.status] || {
              label: hw.status,
              badgeClass: 'bg-muted text-muted-foreground',
              icon: Clock,
            }
            const { text: deadlineText, isPast } = formatDeadline(hw.deadline)
            const isSubmitted = hw.status === 'SUBMITTED'

            return (
              <Card
                key={hw.id}
                onClick={() => handleCardClick(hw)}
                className={`border-border hover:shadow-sm cursor-pointer transition-all hover:border-primary/40 ${
                  isSubmitted
                    ? 'border-amber-300/80 bg-amber-50/20 dark:bg-amber-950/10'
                    : ''
                }`}
              >
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.badgeClass}`}
                      >
                        <statusInfo.icon className="h-3 w-3" />
                        <span>{statusInfo.label}</span>
                      </span>

                      {isPast && hw.status !== 'REVIEWED' && (
                        <span className="text-[10px] font-semibold text-destructive">
                          Просрочено
                        </span>
                      )}

                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Дедлайн: {deadlineText}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-foreground tracking-tight leading-snug">
                      {hw.title}
                    </h3>

                    {hw.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {hw.description}
                      </p>
                    )}

                    {/* Indicators */}
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground">
                      {hw.studentNotes && (
                        <span className="flex items-center gap-1 text-primary font-medium">
                          <MessageSquare className="h-3 w-3" />
                          Есть ответ ученика
                        </span>
                      )}
                      {hw.attachments && hw.attachments.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Paperclip className="h-3 w-3" />
                          Вложений: {hw.attachments.length}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {isSubmitted && (
                      <Button
                        size="sm"
                        onClick={(e) => handleQuickReview(e, hw)}
                        disabled={updateStatusMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1"
                      >
                        {updateStatusMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        <span>Проверено</span>
                      </Button>
                    )}

                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-60" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <Card className="border-border">
          <CardContent className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <BookCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-base">Заданий пока нет</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Выдайте домашнее задание ученику{' '}
                <strong className="text-foreground">{selectedStudentName}</strong>
              </p>
            </div>
            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
              <BookPlus className="mr-2 h-4 w-4" />
              Выдать первое задание
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <CreateHomeworkDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        studentId={currentStudentId}
        studentName={selectedStudentName}
      />

      {/* Details Sheet with attachments and review button */}
      <HomeworkDetailsSheet
        homeworkId={selectedHomework?.id || null}
        initialHomework={selectedHomework}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  )
}
