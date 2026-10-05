import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useMyHomework } from '@/hooks/useHomework'
import { StudentHomeworkDetailsSheet } from './homework/StudentHomeworkDetailsSheet'
import {
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  MessageSquare,
  ChevronRight,
  Send,
  Sparkles,
  Paperclip,
} from 'lucide-react'
import type { Homework } from '@/types'

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
  const text = d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
  return { text, isPast }
}

type StatusFilter = 'ALL' | 'ASSIGNED' | 'SUBMITTED' | 'REVIEWED'

export function StudentHomeworkPage() {
  const { data: homeworkList = [], isLoading, isError, refetch } = useMyHomework()

  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('ALL')
  const [search, setSearch] = useState('')

  // Details sheet
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Stats
  const stats = useMemo(() => {
    const total = homeworkList.length
    const assigned = homeworkList.filter((h) => h.status === 'ASSIGNED').length
    const submitted = homeworkList.filter((h) => h.status === 'SUBMITTED').length
    const reviewed = homeworkList.filter((h) => h.status === 'REVIEWED').length
    return { total, assigned, submitted, reviewed }
  }, [homeworkList])

  // Filtered homework list
  const filteredList = useMemo(() => {
    return homeworkList.filter((hw) => {
      // Status match
      if (selectedStatus !== 'ALL' && hw.status !== selectedStatus) {
        return false
      }
      // Search match
      if (search.trim()) {
        const query = search.toLowerCase()
        const titleMatch = hw.title.toLowerCase().includes(query)
        const descMatch = hw.description?.toLowerCase().includes(query) || false
        const topicMatch = hw.lessonTopic?.toLowerCase().includes(query) || false
        return titleMatch || descMatch || topicMatch
      }
      return true
    })
  }, [homeworkList, selectedStatus, search])

  const handleCardClick = (hw: Homework) => {
    setSelectedHomework(hw)
    setIsDetailsOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Мои домашние задания</h1>
        <p className="text-muted-foreground text-sm">
          Задания от вашего преподавателя, материалы, прикрепление файлов и сдача решений
        </p>
      </div>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setSelectedStatus('ALL')}
          className={`p-3.5 rounded-lg border text-left transition-all ${
            selectedStatus === 'ALL'
              ? 'bg-primary/10 border-primary text-primary shadow-xs'
              : 'bg-card text-card-foreground hover:bg-muted/50 border-border'
          }`}
        >
          <span className="text-xs text-muted-foreground font-medium block">
            Всего заданий
          </span>
          <span className="text-xl font-bold text-foreground mt-0.5 block">
            {stats.total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus('ASSIGNED')}
          className={`p-3.5 rounded-lg border text-left transition-all ${
            selectedStatus === 'ASSIGNED'
              ? 'bg-blue-100/70 border-blue-500 text-blue-950 dark:bg-blue-950/60 dark:text-blue-200 shadow-xs'
              : 'bg-card text-card-foreground hover:bg-muted/50 border-border'
          }`}
        >
          <span className="text-xs text-blue-700 dark:text-blue-300 font-medium block">
            Нужно сдать
          </span>
          <span className="text-xl font-bold text-blue-800 dark:text-blue-200 mt-0.5 block">
            {stats.assigned}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus('SUBMITTED')}
          className={`p-3.5 rounded-lg border text-left transition-all ${
            selectedStatus === 'SUBMITTED'
              ? 'bg-amber-100/70 border-amber-500 text-amber-950 dark:bg-amber-950/60 dark:text-amber-200 shadow-xs'
              : 'bg-card text-card-foreground hover:bg-muted/50 border-border'
          }`}
        >
          <span className="text-xs text-amber-700 dark:text-amber-300 font-medium block">
            На проверке
          </span>
          <span className="text-xl font-bold text-amber-800 dark:text-amber-200 mt-0.5 block">
            {stats.submitted}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus('REVIEWED')}
          className={`p-3.5 rounded-lg border text-left transition-all ${
            selectedStatus === 'REVIEWED'
              ? 'bg-emerald-100/70 border-emerald-500 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-200 shadow-xs'
              : 'bg-card text-card-foreground hover:bg-muted/50 border-border'
          }`}
        >
          <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium block">
            Проверено
          </span>
          <span className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mt-0.5 block">
            {stats.reviewed}
          </span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию или теме..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs bg-background h-9"
          />
        </div>

        {selectedStatus !== 'ALL' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedStatus('ALL')}
            className="text-xs text-muted-foreground hover:text-foreground self-start sm:self-auto"
          >
            Сбросить фильтр
          </Button>
        )}
      </div>

      {/* Homework Cards List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground text-lg">
                Не удалось загрузить задания
              </p>
              <p className="text-sm text-muted-foreground">
                Проверьте соединение с интернетом и попробуйте снова
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Повторить попытку
            </Button>
          </CardContent>
        </Card>
      ) : filteredList.length > 0 ? (
        <div className="space-y-3">
          {filteredList.map((hw) => {
            const currentStatus = statusConfig[hw.status] || {
              label: hw.status,
              badgeClass: 'bg-muted text-muted-foreground',
              icon: Clock,
            }
            const StatusIcon = currentStatus.icon
            const { text: deadlineText, isPast: isDeadlinePast } = formatDeadline(
              hw.deadline,
            )
            const isAssigned = hw.status === 'ASSIGNED'
            const isReviewed = hw.status === 'REVIEWED'

            return (
              <Card
                key={hw.id}
                onClick={() => handleCardClick(hw)}
                className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-xs group border-border"
              >
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left info column */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStatus.badgeClass}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        <span>{currentStatus.label}</span>
                      </span>

                      {hw.deadline && (
                        <span
                          className={`text-xs flex items-center gap-1 ${
                            isDeadlinePast && isAssigned
                              ? 'text-destructive font-semibold'
                              : 'text-muted-foreground'
                          }`}
                        >
                          <Calendar className="h-3 w-3" />
                          <span>Дедлайн: {deadlineText}</span>
                        </span>
                      )}

                      {hw.lessonTopic && (
                        <Badge
                          variant="outline"
                          className="text-[11px] font-normal"
                        >
                          {hw.lessonTopic}
                        </Badge>
                      )}
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {hw.title}
                      </h2>
                      {hw.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {hw.description}
                        </p>
                      )}
                    </div>

                    {/* Feedback or student notes indicator */}
                    <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
                      {isReviewed && hw.tutorFeedback && (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <Sparkles className="h-3 w-3" />
                          <span>Отзыв репетитора</span>
                        </span>
                      )}

                      {hw.studentNotes && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>Ваш комментарий</span>
                        </span>
                      )}

                      {hw.attachments && hw.attachments.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Paperclip className="h-3 w-3" />
                          <span>Вложений: {hw.attachments.length}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right action button */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {isAssigned ? (
                      <div className="flex items-center gap-1 text-xs font-medium text-primary group-hover:underline">
                        <Send className="h-3.5 w-3.5" />
                        <span>Сдать работу</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground">
                        <span>Подробнее</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <Card className="border-border">
          <CardContent className="py-16 text-center flex flex-col items-center justify-center space-y-3">
            <div className="p-3 rounded-full bg-muted text-muted-foreground">
              <BookOpen className="h-7 w-7" />
            </div>
            <div className="max-w-xs space-y-1">
              <p className="font-semibold text-foreground">Заданий не найдено</p>
              <p className="text-xs text-muted-foreground">
                {selectedStatus !== 'ALL' || search
                  ? 'По текущим параметрам поиска ничего не найдено.'
                  : 'Преподаватель пока не выдал вам домашних заданий.'}
              </p>
            </div>
            {(selectedStatus !== 'ALL' || search) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedStatus('ALL')
                  setSearch('')
                }}
                className="mt-2 text-xs"
              >
                Сбросить все фильтры
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Details & Submission Sheet */}
      <StudentHomeworkDetailsSheet
        homeworkId={selectedHomework?.id || null}
        initialHomework={selectedHomework}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  )
}
