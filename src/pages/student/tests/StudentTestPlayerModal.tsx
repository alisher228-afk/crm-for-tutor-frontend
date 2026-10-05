import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useSubmitMyTest } from '@/hooks/useTests'
import { toast } from 'sonner'
import {
  BrainCircuit,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  BookOpen,
  Check,
  Loader2,
} from 'lucide-react'
import type { TestItem, QuizQuestion, TestSubmission } from '@/types'

interface StudentTestPlayerModalProps {
  test: TestItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  initialViewMode?: 'play' | 'result'
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function getScoreFeedback(percentage: number): {
  title: string
  color: string
  badgeClass: string
  description: string
} {
  if (percentage >= 90) {
    return {
      title: 'Превосходно!',
      color: 'text-emerald-600 dark:text-emerald-400',
      badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      description: 'Отличный результат! Материал усвоен на высшем уровне.',
    }
  }
  if (percentage >= 75) {
    return {
      title: 'Хорошо!',
      color: 'text-sky-600 dark:text-sky-400',
      badgeClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30',
      description: 'Хороший результат! Большинство вопросов решено правильно.',
    }
  }
  if (percentage >= 50) {
    return {
      title: 'Удовлетворительно',
      color: 'text-amber-600 dark:text-amber-400',
      badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
      description: 'Тест сдан, но есть пробелы в некоторых темах. Рекомендуется повторить материал.',
    }
  }
  return {
    title: 'Нужно повторить',
    color: 'text-rose-600 dark:text-rose-400',
    badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30',
    description: 'Много ошибок. Ознакомьтесь с разбором ответов и попробуйте пройти тест снова.',
  }
}

export function StudentTestPlayerModal({
  test,
  open,
  onOpenChange,
  initialViewMode = 'play',
}: StudentTestPlayerModalProps) {
  const submitMutation = useSubmitMyTest()

  // Parse questions
  const questions: QuizQuestion[] = useMemo(() => {
    if (!test?.questionsJson) return []
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
      if (!Array.isArray(parsed)) return []

      return parsed.map((item, idx) => ({
        id: String(item?.id ?? idx + 1),
        question: String(item?.question ?? `Вопрос ${idx + 1}`),
        options: Array.isArray(item?.options)
          ? item.options.map((opt: unknown) => String(opt ?? ''))
          : [],
        correctOptionIndex:
          typeof item?.correctOptionIndex === 'number' && !isNaN(item.correctOptionIndex)
            ? item.correctOptionIndex
            : 0,
        explanation: item?.explanation ? String(item.explanation) : undefined,
      }))
    } catch {
      return []
    }
  }, [test?.questionsJson])

  // Modes: 'testing' | 'result'
  const [viewMode, setViewMode] = useState<'testing' | 'result'>('testing')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false)
  const [lastSubmission, setLastSubmission] = useState<TestSubmission | null>(null)

  // Timer states
  const timeLimitSeconds = (test?.timeLimitMinutes || 0) * 60
  const [secondsRemaining, setSecondsRemaining] = useState<number>(timeLimitSeconds)
  const [timeSpent, setTimeSpent] = useState<number>(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Initialize state on open
  useEffect(() => {
    if (open && test) {
      if (initialViewMode === 'result' && test.mySubmission) {
        setViewMode('result')
        setLastSubmission(test.mySubmission)
        // Load past answers if stored
        if (test.mySubmission.answersJson) {
          try {
            setSelectedAnswers(JSON.parse(test.mySubmission.answersJson))
          } catch {
            setSelectedAnswers({})
          }
        }
      } else {
        setViewMode('testing')
        setCurrentIdx(0)
        setSelectedAnswers({})
        setLastSubmission(null)
        setSecondsRemaining(timeLimitSeconds > 0 ? timeLimitSeconds : 0)
        setTimeSpent(0)
      }
    }
  }, [open, test?.id, initialViewMode, timeLimitSeconds])

  // Timer tick
  useEffect(() => {
    if (!open || viewMode !== 'testing') {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setTimeSpent((prev) => prev + 1)

      if (timeLimitSeconds > 0) {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            handleAutoSubmit()
            return 0
          }
          return prev - 1
        })
      }
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [open, viewMode, timeLimitSeconds])

  // Submission handler
  const executeSubmit = useCallback(async () => {
    if (!test?.id) return

    try {
      const result = await submitMutation.mutateAsync({
        id: test.id,
        data: {
          answersJson: JSON.stringify(selectedAnswers),
          timeSpentSeconds: timeSpent,
        },
      })
      setLastSubmission(result)
      setViewMode('result')
      setConfirmSubmitOpen(false)
      toast.success('Тест успешно завершён!')
    } catch {
      toast.error('Не удалось отправить результаты теста')
    }
  }, [test?.id, selectedAnswers, timeSpent, submitMutation])

  const handleAutoSubmit = useCallback(() => {
    toast.warning('Время на прохождение теста истекло! Завершаем тест...')
    executeSubmit()
  }, [executeSubmit])

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (viewMode !== 'testing') return
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIdx]: optIdx,
    }))
  }

  const handleRetake = () => {
    setViewMode('testing')
    setCurrentIdx(0)
    setSelectedAnswers({})
    setLastSubmission(null)
    setSecondsRemaining(timeLimitSeconds > 0 ? timeLimitSeconds : 0)
    setTimeSpent(0)
  }

  const answeredCount = Object.keys(selectedAnswers).length
  const totalCount = questions.length
  const currentQ = questions[currentIdx]

  // Time warning condition (< 2 minutes if limit exists)
  const isTimeCritical = timeLimitSeconds > 0 && secondsRemaining <= 120

  const activeSubmission = lastSubmission || test?.mySubmission
  const feedback = activeSubmission ? getScoreFeedback(activeSubmission.percentage) : null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-3xl max-h-[92vh] flex flex-col p-0 overflow-hidden"
          onKeyDown={(e) => {
            if (viewMode === 'testing') {
              if (e.key === 'ArrowLeft' && currentIdx > 0) {
                setCurrentIdx((i) => i - 1)
              } else if (e.key === 'ArrowRight' && currentIdx < totalCount - 1) {
                setCurrentIdx((i) => i + 1)
              }
            }
          }}
        >
          {/* Top Header */}
          <DialogHeader className="p-4 sm:p-5 border-b border-border bg-card">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <DialogTitle className="text-base sm:text-lg font-bold truncate">
                    {test?.title || 'Тестирование'}
                  </DialogTitle>
                  <DialogDescription className="text-xs truncate">
                    {test?.topic ? `${test.topic} • ` : ''}
                    {totalCount} {totalCount === 1 ? 'вопрос' : 'вопросов'}
                  </DialogDescription>
                </div>
              </div>

              {/* Timer & Controls */}
              {viewMode === 'testing' && (
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all ${
                      isTimeCritical
                        ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 animate-pulse'
                        : 'border-border bg-muted/50 text-foreground'
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {timeLimitSeconds > 0
                        ? formatTime(secondsRemaining)
                        : formatTime(timeSpent)}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => setConfirmSubmitOpen(true)}
                    className="text-xs font-semibold h-8"
                  >
                    Завершить тест
                  </Button>
                </div>
              )}

              {viewMode === 'result' && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRetake}
                    className="text-xs gap-1.5 h-8"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Пройти заново</span>
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>

          {/* MAIN CONTENT */}
          {viewMode === 'testing' ? (
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
              {/* Question Navigator Palette (как в Платонусе) */}
              <div className="p-3 sm:px-6 bg-muted/20 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Вопросы: {answeredCount} из {totalCount} отвечено
                  </p>
                  <span className="text-xs text-muted-foreground font-medium">
                    Вопрос {currentIdx + 1}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {questions.map((_, idx) => {
                    const isAnswered = selectedAnswers[idx] !== undefined
                    const isCurrent = idx === currentIdx

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentIdx(idx)}
                        className={`h-7 min-w-7 px-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/40'
                            : isAnswered
                            ? 'bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25'
                            : 'bg-card text-muted-foreground border border-border hover:bg-muted'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Question Area */}
              {currentQ ? (
                <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                        Вопрос №{currentIdx + 1}
                      </span>
                      <p className="text-base sm:text-lg font-bold text-foreground leading-relaxed whitespace-pre-wrap">
                        {currentQ.question}
                      </p>
                    </div>

                    {/* Options list */}
                    <div className="space-y-2.5 pt-2">
                      {currentQ.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[currentIdx] === optIdx
                        const letter = String.fromCharCode(65 + optIdx) // A, B, C, D...

                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectOption(currentIdx, optIdx)}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                              isSelected
                                ? 'border-primary bg-primary/10 shadow-xs text-foreground ring-1 ring-primary/30'
                                : 'border-border bg-card hover:bg-muted/40 hover:border-muted-foreground/30 text-foreground'
                            }`}
                          >
                            <div
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                                isSelected
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {isSelected ? <Check className="h-3.5 w-3.5" /> : letter}
                            </div>
                            <span className="text-sm font-medium leading-snug">
                              {opt}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Navigation footer */}
                  <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                      disabled={currentIdx === 0}
                      className="gap-1.5"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Предыдущий</span>
                    </Button>

                    <div className="text-xs text-muted-foreground">
                      {currentIdx + 1} / {totalCount}
                    </div>

                    {currentIdx < totalCount - 1 ? (
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={() => setCurrentIdx((i) => Math.min(totalCount - 1, i + 1))}
                        className="gap-1.5"
                      >
                        <span>Следующий</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={() => setConfirmSubmitOpen(true)}
                        className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Завершить тест</span>
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  Вопросы не найдены в этом тесте
                </div>
              )}
            </div>
          ) : (
            /* RESULTS VIEW */
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {activeSubmission && feedback && (
                <Card className="border-border overflow-hidden bg-gradient-to-br from-card to-muted/20">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="relative flex items-center justify-center h-24 w-24 rounded-full border-4 border-primary/20 bg-primary/5">
                        <span className="text-3xl font-black text-foreground">
                          {activeSubmission.percentage}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className={`text-xl font-black ${feedback.color}`}>
                        {feedback.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                        {feedback.description}
                      </p>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 max-w-md mx-auto pt-2">
                      <div className="p-2.5 rounded-lg border border-border bg-background/50 text-center">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">
                          Балл
                        </p>
                        <p className="text-lg font-black text-foreground mt-0.5">
                          {activeSubmission.score} / {activeSubmission.totalQuestions}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg border border-border bg-background/50 text-center">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">
                          Время
                        </p>
                        <p className="text-lg font-black text-foreground mt-0.5">
                          {activeSubmission.timeSpentSeconds
                            ? formatTime(activeSubmission.timeSpentSeconds)
                            : '—'}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg border border-border bg-background/50 text-center">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">
                          Статус
                        </p>
                        <p className="text-lg font-black text-foreground mt-0.5">
                          {activeSubmission.percentage >= 50 ? 'Сдан' : 'Не сдан'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Question-by-Question Review */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-bold text-foreground">
                    Подробный разбор вопросов:
                  </h4>
                </div>

                <div className="space-y-3">
                  {questions.map((q, idx) => {
                    const studentAnsIdx = selectedAnswers[idx]
                    const isCorrect = studentAnsIdx === q.correctOptionIndex
                    const isAnswered = studentAnsIdx !== undefined

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border space-y-3 transition-colors ${
                          isCorrect
                            ? 'border-emerald-500/30 bg-emerald-500/5'
                            : isAnswered
                            ? 'border-rose-500/30 bg-rose-500/5'
                            : 'border-border bg-muted/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold bg-muted text-foreground shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-sm font-bold text-foreground">
                              {q.question}
                            </p>
                          </div>

                          <div className="shrink-0">
                            {isCorrect ? (
                              <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-semibold gap-1 text-[11px]">
                                <CheckCircle2 className="h-3 w-3" />
                                Верно (+1)
                              </Badge>
                            ) : isAnswered ? (
                              <Badge className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 font-semibold gap-1 text-[11px]">
                                <XCircle className="h-3 w-3" />
                                Неверно (0)
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground text-[11px]">
                                Без ответа
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Options preview with correct/student indicator */}
                        <div className="space-y-1.5 pl-7">
                          {q.options.map((opt, optIdx) => {
                            const isCorrectOpt = optIdx === q.correctOptionIndex
                            const isStudentOpt = optIdx === studentAnsIdx
                            const letter = String.fromCharCode(65 + optIdx)

                            let optStyle = 'border-border/60 bg-card text-muted-foreground'
                            if (isCorrectOpt) {
                              optStyle =
                                'border-emerald-500/50 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 font-semibold'
                            } else if (isStudentOpt && !isCorrectOpt) {
                              optStyle =
                                'border-rose-500/50 bg-rose-500/15 text-rose-800 dark:text-rose-200 font-semibold line-through'
                            }

                            return (
                              <div
                                key={optIdx}
                                className={`flex items-center gap-2 p-2 rounded-lg border text-xs ${optStyle}`}
                              >
                                <span className="font-bold">{letter}.</span>
                                <span>{opt}</span>
                                {isCorrectOpt && (
                                  <span className="ml-auto text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                    Правильный ответ
                                  </span>
                                )}
                                {isStudentOpt && !isCorrectOpt && (
                                  <span className="ml-auto text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                    Ваш выбор
                                  </span>
                                )}
                              </div>
                            )
                          })}
                        </div>

                        {/* Explanation if present */}
                        {q.explanation && (
                          <div className="ml-7 p-2.5 rounded-lg bg-background/80 border border-border text-xs text-muted-foreground space-y-1">
                            <span className="font-semibold text-foreground flex items-center gap-1">
                              <Sparkles className="h-3 w-3 text-amber-500" /> Пояснение учителя:
                            </span>
                            <p className="italic">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog before submitting */}
      <Dialog open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <DialogTitle className="text-base font-bold">
                Завершить тестирование?
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="py-2 text-sm text-foreground/80 space-y-2">
            <p>
              Вы ответили на <strong>{answeredCount}</strong> из{' '}
              <strong>{totalCount}</strong> вопросов.
            </p>
            {answeredCount < totalCount && (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Внимание: вы оставили {totalCount - answeredCount} вопросов без
                ответа. Они будут зачтены как неверные.
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              После отправки тест будет проверен автоматически, и вы сразу
              увидите оценку и разбор ответов.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmSubmitOpen(false)}
              disabled={submitMutation.isPending}
            >
              Вернуться к тесту
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={executeSubmit}
              disabled={submitMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              {submitMutation.isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              <span>Да, завершить</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
