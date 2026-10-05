import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useMyTests, useSubmitMyTest } from '@/hooks/useTests'
import { StudentTestPlayerModal } from './tests/StudentTestPlayerModal'
import { toast } from 'sonner'
import {
  BrainCircuit,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Calendar,
  Award,
  Check,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Users,
  User,
} from 'lucide-react'
import type { TestItem, TestType } from '@/types'

type FilterTab = 'ALL' | 'INTERNAL' | 'EXTERNAL' | 'COMPLETED'

export function StudentTestsPage() {
  const [search, setSearch] = useState('')
  const [filterTab, setFilterTab] = useState<FilterTab>('ALL')

  const [activeTest, setActiveTest] = useState<TestItem | null>(null)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const [playerMode, setPlayerMode] = useState<'play' | 'result'>('play')

  const submitMutation = useSubmitMyTest()

  const typeParam: TestType | undefined =
    filterTab === 'INTERNAL'
      ? 'INTERNAL'
      : filterTab === 'EXTERNAL'
      ? 'EXTERNAL'
      : undefined

  const { data: tests = [], isLoading } = useMyTests({
    search: search.trim() || undefined,
    type: typeParam,
  })

  // Filter completed tab client-side if selected
  const displayedTests = useMemo(() => {
    if (filterTab === 'COMPLETED') {
      return tests.filter((t) => Boolean(t.mySubmission))
    }
    return tests
  }, [tests, filterTab])

  // Statistics calculation
  const totalCount = tests.length
  const completedTests = tests.filter((t) => Boolean(t.mySubmission))
  const completedCount = completedTests.length
  const avgScore =
    completedCount > 0
      ? Math.round(
          completedTests.reduce((acc, t) => acc + (t.mySubmission?.percentage || 0), 0) /
            completedCount,
        )
      : 0

  const handleStartTest = (test: TestItem) => {
    setActiveTest(test)
    setPlayerMode('play')
    setIsPlayerOpen(true)
  }

  const handleViewResult = (test: TestItem) => {
    setActiveTest(test)
    setPlayerMode('result')
    setIsPlayerOpen(true)
  }

  const handleExternalComplete = async (test: TestItem) => {
    try {
      await submitMutation.mutateAsync({
        id: test.id,
        data: {
          timeSpentSeconds: 60,
        },
      })
      toast.success('Квиз отмечен как пройденный!')
    } catch {
      toast.error('Не удалось сохранить статус')
    }
  }

  const getQuestionCount = (test: TestItem): number => {
    if (!test.questionsJson) return 0
    try {
      let parsed: any = test.questionsJson
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed)
      }
      if (
        parsed &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed) &&
        Array.isArray((parsed as Record<string, unknown>).questions)
      ) {
        parsed = (parsed as Record<string, unknown>).questions
      }
      return Array.isArray(parsed) ? parsed.length : 0
    } catch {
      return 0
    }
  }

  const getSafeUrl = (url?: string): string => {
    if (!url) return ''
    const trimmed = url.trim()
    if (!trimmed) return ''
    return trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`
  }

  const formatDeadline = (dateStr?: string): { label: string; isPast: boolean } => {
    if (!dateStr) return { label: '', isPast: false }
    try {
      const d = new Date(dateStr)
      const now = new Date()
      const isPast = d < now
      const isToday = d.toDateString() === now.toDateString()

      if (isToday) {
        return {
          label: `Сегодня до ${d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
          isPast,
        }
      }

      return {
        label: d.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        isPast,
      }
    } catch {
      return { label: dateStr, isPast: false }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Тесты и Квизы</h1>
        <p className="text-muted-foreground text-sm">
          Интерактивные тестирования от преподавателя, проверка знаний и ссылки на квизы
        </p>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Всего тестов
              </p>
              <p className="text-2xl font-black text-foreground mt-0.5">
                {totalCount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Пройдено
              </p>
              <p className="text-2xl font-black text-foreground mt-0.5">
                {completedCount} <span className="text-xs font-normal text-muted-foreground">из {totalCount}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Средний балл
              </p>
              <p className="text-2xl font-black text-foreground mt-0.5">
                {completedCount > 0 ? `${avgScore}%` : '—'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            variant={filterTab === 'ALL' ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs font-medium"
            onClick={() => setFilterTab('ALL')}
          >
            Все тесты ({totalCount})
          </Button>
          <Button
            variant={filterTab === 'INTERNAL' ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs font-medium gap-1.5"
            onClick={() => setFilterTab('INTERNAL')}
          >
            <BrainCircuit className="h-3.5 w-3.5" />
            <span>Внутренние тесты</span>
          </Button>
          <Button
            variant={filterTab === 'EXTERNAL' ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs font-medium gap-1.5"
            onClick={() => setFilterTab('EXTERNAL')}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Внешние квизы</span>
          </Button>
          <Button
            variant={filterTab === 'COMPLETED' ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs font-medium gap-1.5"
            onClick={() => setFilterTab('COMPLETED')}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Пройденные ({completedCount})</span>
          </Button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию или теме..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      {/* Test Cards List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-border p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </Card>
          ))}
        </div>
      ) : displayedTests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedTests.map((test) => {
            const isInternal = test.type === 'INTERNAL'
            const qCount = getQuestionCount(test)
            const submission = test.mySubmission
            const isPassed = Boolean(submission)
            const deadlineInfo = formatDeadline(test.deadline)

            return (
              <Card
                key={test.id}
                className={`flex flex-col justify-between border transition-all bg-card overflow-hidden ${
                  isPassed
                    ? 'border-emerald-500/30 hover:border-emerald-500/50'
                    : 'border-border hover:border-primary/40 hover:shadow-xs'
                }`}
              >
                <CardHeader className="pb-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${
                          isInternal
                            ? 'bg-primary/10 text-primary'
                            : 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                        }`}
                      >
                        {isInternal ? (
                          <BrainCircuit className="h-4 w-4" />
                        ) : (
                          <ExternalLink className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-sm font-bold truncate">
                          {test.title}
                        </CardTitle>
                        {test.topic && (
                          <p className="text-[11px] text-muted-foreground truncate">
                            {test.topic}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {isPassed ? (
                        <Badge
                          variant="secondary"
                          className="text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{submission?.percentage}%</span>
                        </Badge>
                      ) : deadlineInfo.label ? (
                        <Badge
                          variant="outline"
                          className={`text-[10px] gap-1 font-semibold ${
                            deadlineInfo.isPast
                              ? 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          <Calendar className="h-3 w-3" />
                          <span>{deadlineInfo.label}</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          Доступен
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="py-2 flex-1 space-y-2.5">
                  {test.description ? (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {test.description}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Без описания</p>
                  )}

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {test.targetType === 'GROUP' ? (
                      <Badge
                        variant="outline"
                        className="text-[11px] gap-1 bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 font-medium"
                      >
                        <Users className="h-3 w-3" />
                        <span>Групповой</span>
                      </Badge>
                    ) : test.targetType === 'INDIVIDUAL' ? (
                      <Badge
                        variant="outline"
                        className="text-[11px] gap-1 bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 font-medium"
                      >
                        <User className="h-3 w-3" />
                        <span>Персональный</span>
                      </Badge>
                    ) : null}

                    {isInternal ? (
                      <Badge
                        variant="outline"
                        className="text-[11px] bg-muted/30 text-foreground border-border"
                      >
                        <Sparkles className="h-3 w-3 mr-1 text-primary" />
                        {qCount} {qCount === 1 ? 'вопрос' : 'вопросов'}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[11px] bg-sky-500/5 text-sky-700 dark:text-sky-300 border-sky-500/20"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Внешний квиз
                      </Badge>
                    )}

                    {test.timeLimitMinutes && (
                      <Badge variant="outline" className="text-[11px] gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{test.timeLimitMinutes} мин</span>
                      </Badge>
                    )}

                    {isPassed && submission && (
                      <span className="text-[11px] font-medium text-muted-foreground ml-auto">
                        Балл: {submission.score}/{submission.totalQuestions}
                      </span>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="pt-3 border-t border-border flex items-center justify-between gap-2 bg-muted/10">
                  {isInternal ? (
                    isPassed ? (
                      <div className="flex items-center gap-2 w-full">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs font-semibold gap-1.5 h-8"
                          onClick={() => handleViewResult(test)}
                        >
                          <BookOpen className="h-3.5 w-3.5 text-primary" />
                          <span>Результат</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs gap-1 h-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleStartTest(test)}
                          title="Пройти тест заново"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Пересдать</span>
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full text-xs font-semibold gap-1.5 h-8"
                        onClick={() => handleStartTest(test)}
                      >
                        <BrainCircuit className="h-3.5 w-3.5" />
                        <span>Пройти тестирование</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                      </Button>
                    )
                  ) : (
                    /* EXTERNAL TEST ACTIONS */
                    <div className="flex items-center gap-2 w-full">
                      <Button
                        size="sm"
                        className="flex-1 text-xs font-semibold gap-1.5 h-8"
                        onClick={() => {
                          const safe = getSafeUrl(test.externalUrl)
                          if (safe) {
                            window.open(safe, '_blank', 'noopener,noreferrer')
                          } else {
                            toast.error('Ссылка на внешний тест отсутствует')
                          }
                        }}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Перейти к квизу</span>
                      </Button>

                      {!isPassed && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 gap-1 shrink-0"
                          onClick={() => handleExternalComplete(test)}
                          title="Отметить как выполненный"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Сдано</span>
                        </Button>
                      )}
                    </div>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-base">Тесты пока не назначены</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Когда преподаватель подготовит или назначит тест/квиз, он появится в этом списке.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Test Player Modal */}
      <StudentTestPlayerModal
        test={activeTest}
        open={isPlayerOpen}
        onOpenChange={setIsPlayerOpen}
        initialViewMode={playerMode}
      />
    </div>
  )
}
