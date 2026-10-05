import { useState, useMemo, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  BrainCircuit,
  ExternalLink,
  Copy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Clock,
  Check,
  AlertCircle,
} from 'lucide-react'
import type { TestItem, QuizQuestion } from '@/types'

interface TestPreviewModalProps {
  test: TestItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TestPreviewModal({
  test,
  open,
  onOpenChange,
}: TestPreviewModalProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  // Reset state when test or open changes
  useEffect(() => {
    if (open) {
      setSelectedAnswers({})
      setIsSubmitted(false)
      setIsCopied(false)
    }
  }, [open, test?.id])

  const safeDomain = useMemo(() => {
    if (!test?.externalUrl) return 'Внешний тест'
    try {
      const normalized =
        test.externalUrl.startsWith('http://') || test.externalUrl.startsWith('https://')
          ? test.externalUrl
          : `https://${test.externalUrl}`
      return new URL(normalized).hostname.replace(/^www\./, '')
    } catch {
      return 'Внешний тест'
    }
  }, [test?.externalUrl])

  const safeExternalUrl = useMemo(() => {
    if (!test?.externalUrl) return ''
    const trimmed = test.externalUrl.trim()
    if (!trimmed) return ''
    return trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`
  }, [test?.externalUrl])

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

  const score = useMemo(() => {
    if (!isSubmitted) return 0
    let correct = 0
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOptionIndex) {
        correct++
      }
    })
    return correct
  }, [isSubmitted, questions, selectedAnswers])

  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0

  // All hooks have been called above; now safe to return null if no test
  if (!test) return null

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (isSubmitted) return
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))
  }

  const handleCheckAnswers = () => {
    if (questions.length === 0) return
    if (Object.keys(selectedAnswers).length < questions.length) {
      toast.info('Ответьте на все вопросы перед проверкой')
      return
    }
    setIsSubmitted(true)
  }

  const handleReset = () => {
    setSelectedAnswers({})
    setIsSubmitted(false)
  }

  const handleCopyLink = () => {
    if (safeExternalUrl) {
      navigator.clipboard.writeText(safeExternalUrl)
      setIsCopied(true)
      toast.success('Ссылка на тест скопирована в буфер обмена')
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-6 overflow-hidden">
        {/* Header */}
        <DialogHeader className="pb-3 border-b border-border">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
                {test.type === 'INTERNAL' ? (
                  <BrainCircuit className="h-6 w-6" />
                ) : (
                  <ExternalLink className="h-6 w-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg font-bold tracking-tight">
                    {test.title}
                  </DialogTitle>
                  <Badge variant="secondary" className="text-xs">
                    {test.type === 'INTERNAL' ? 'Интерактивный' : 'Внешний квиз'}
                  </Badge>
                </div>
                <DialogDescription className="text-xs mt-0.5">
                  {test.topic && <span className="font-medium text-foreground">{test.topic} • </span>}
                  {test.timeLimitMinutes && `${test.timeLimitMinutes} минут • `}
                  {test.type === 'INTERNAL'
                    ? `${questions.length} вопросов`
                    : 'Ссылка на сторонний сервис'}
                </DialogDescription>
              </div>
            </div>

            {test.timeLimitMinutes && (
              <Badge variant="outline" className="gap-1 text-xs shrink-0">
                <Clock className="h-3 w-3" />
                <span>{test.timeLimitMinutes} мин</span>
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4">
          {test.description && (
            <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border">
              {test.description}
            </p>
          )}

          {/* EXTERNAL VIEW */}
          {test.type === 'EXTERNAL' ? (
            <div className="space-y-4 p-6 rounded-xl border border-border bg-card text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
                <ExternalLink className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-base font-bold">Внешний интерактивный квиз</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                  Этот тест размещен на платформе{' '}
                  <span className="font-semibold text-foreground">{safeDomain}</span>.
                  Вы можете открыть его в новой вкладке или скопировать ссылку для ученика.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  size="default"
                  className="gap-2 w-full sm:w-auto"
                  onClick={() => {
                    if (safeExternalUrl) {
                      window.open(safeExternalUrl, '_blank', 'noopener,noreferrer')
                    } else {
                      toast.error('Ссылка на внешний тест отсутствует')
                    }
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Открыть тест на сайте</span>
                </Button>

                <Button
                  variant="outline"
                  size="default"
                  className="gap-2 w-full sm:w-auto"
                  onClick={handleCopyLink}
                  disabled={!safeExternalUrl}
                >
                  {isCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  <span>{isCopied ? 'Скопировано!' : 'Скопировать ссылку'}</span>
                </Button>
              </div>
            </div>
          ) : questions.length === 0 ? (
            /* EMPTY INTERNAL QUIZ */
            <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-border bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-sm">В тесте пока нет вопросов</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
                Отредактируйте этот тест в списке тестов, чтобы добавить вопросы и варианты ответов.
              </p>
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Закрыть
              </Button>
            </div>
          ) : (
            /* INTERNAL QUIZ QUESTIONS */
            <div className="space-y-4">
              {/* Score result banner */}
              {isSubmitted && (
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    percentage >= 80
                      ? 'bg-emerald-50/50 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800'
                      : percentage >= 50
                        ? 'bg-amber-50/50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-800'
                        : 'bg-destructive/10 border-destructive/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <span className="font-bold text-base">
                        Результат: {score} из {questions.length} ({percentage}%)
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {percentage === 100
                        ? 'Превосходно! Все ответы верны!'
                        : percentage >= 70
                          ? 'Хороший результат! Посмотрите пояснения ниже.'
                          : 'Есть ошибки. Рекомендуется повторить пройденный материал.'}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={handleReset}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Пройти заново</span>
                  </Button>
                </div>
              )}

              {/* Questions list */}
              {questions.map((q, qIdx) => {
                const selectedOpt = selectedAnswers[qIdx]
                const isCorrect = isSubmitted && selectedOpt === q.correctOptionIndex
                const options = q.options || []

                return (
                  <Card
                    key={q.id || `q-${qIdx}`}
                    className={`p-4 border transition-all ${
                      isSubmitted
                        ? isCorrect
                          ? 'border-emerald-500/60 bg-emerald-50/10'
                          : 'border-destructive/60 bg-destructive/5'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="font-semibold text-sm text-foreground">
                        {qIdx + 1}. {q.question}
                      </span>
                      {isSubmitted && (
                        <div>
                          {isCorrect ? (
                            <Badge className="bg-emerald-600 gap-1 text-[11px]">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Верно</span>
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1 text-[11px]">
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Неверно</span>
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Options */}
                    <div className="space-y-2">
                      {options.map((opt, optIdx) => {
                        const isChosen = selectedOpt === optIdx
                        const isThisCorrect = isSubmitted && optIdx === q.correctOptionIndex
                        const isThisWrong = isSubmitted && isChosen && !isThisCorrect

                        let optionStyle =
                          'border-border hover:bg-muted/40 text-foreground'
                        if (isSubmitted) {
                          if (isThisCorrect) {
                            optionStyle =
                              'border-emerald-500 bg-emerald-100/40 text-emerald-900 dark:text-emerald-300 font-semibold'
                          } else if (isThisWrong) {
                            optionStyle =
                              'border-destructive bg-destructive/10 text-destructive line-through'
                          } else {
                            optionStyle = 'opacity-60 border-border'
                          }
                        } else if (isChosen) {
                          optionStyle =
                            'border-primary bg-primary/10 text-foreground font-semibold'
                        }

                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectOption(qIdx, optIdx)}
                            className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${optionStyle}`}
                          >
                            <div
                              className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isChosen
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-muted-foreground/40'
                              }`}
                            >
                              {isChosen && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                            </div>
                            <span className="flex-1">{opt || `Вариант ${optIdx + 1}`}</span>
                            {isThisCorrect && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Explanation */}
                    {isSubmitted && q.explanation && (
                      <div className="mt-3 p-2.5 rounded-md bg-muted/40 border border-border text-[11px] text-muted-foreground">
                        <strong className="text-foreground">Пояснение: </strong>
                        {q.explanation}
                      </div>
                    )}
                  </Card>
                )
              })}

              {!isSubmitted && (
                <Button
                  className="w-full h-10 font-semibold text-xs"
                  onClick={handleCheckAnswers}
                >
                  Проверить ответы
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
