import { useState, useEffect, type FormEvent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateTest, useUpdateTest } from '@/hooks/useTests'
import { useStudentGroups, useStudents } from '@/hooks/useStudents'
import { toast } from 'sonner'
import {
  Loader2,
  Plus,
  Trash2,
  CheckCircle2,
  Link as LinkIcon,
  BrainCircuit,
  Sparkles,
  Globe,
  Users,
  User,
} from 'lucide-react'

import type { TestItem, TestType, TestTargetType, QuizQuestion } from '@/types'
import type { AxiosError } from 'axios'

interface TestFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: TestItem | null
  initialTargetType?: TestTargetType
  initialGroupName?: string
  initialStudentId?: string | number
  onSuccess?: (test: TestItem) => void
}

const PRESET_SERVICES = [
  { name: 'Quizland', example: 'https://quizland.io/quiz/...' },
  { name: 'Quizlet', example: 'https://quizlet.com/...' },
  { name: 'Google Forms', example: 'https://forms.gle/...' },
  { name: 'Kahoot', example: 'https://kahoot.it/challenge/...' },
  { name: 'Яндекс.Формы', example: 'https://forms.yandex.ru/...' },
]

export function TestFormDialog({
  open,
  onOpenChange,
  initialData,
  initialTargetType,
  initialGroupName,
  initialStudentId,
  onSuccess,
}: TestFormDialogProps) {
  const isEditing = Boolean(initialData?.id)

  const [type, setType] = useState<TestType>('INTERNAL')
  const [targetType, setTargetType] = useState<TestTargetType>('ALL')
  const [groupName, setGroupName] = useState<string>('')
  const [studentId, setStudentId] = useState<string>('')

  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('')
  const [description, setDescription] = useState('')
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<string>('')
  const [deadline, setDeadline] = useState('')
  const [externalUrl, setExternalUrl] = useState('')

  const { data: groups = [] } = useStudentGroups()
  const { data: studentsData } = useStudents({ size: 100 })
  const students = studentsData?.content || []

  // Questions for internal quiz
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: '1',
      question: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      explanation: '',
    },
  ])

  const createMutation = useCreateTest()
  const updateMutation = useUpdateTest()
  const isPending = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (open) {
      if (initialData) {
        setType(initialData.type || 'INTERNAL')
        setTargetType(initialData.targetType || 'ALL')
        setGroupName(initialData.groupName || '')
        setStudentId(initialData.studentId ? String(initialData.studentId) : '')
        setTitle(initialData.title || '')
        setTopic(initialData.topic || '')
        setDescription(initialData.description || '')
        setTimeLimitMinutes(
          initialData.timeLimitMinutes ? String(initialData.timeLimitMinutes) : '',
        )
        setDeadline(initialData.deadline ? initialData.deadline.slice(0, 16) : '')
        setExternalUrl(initialData.externalUrl || '')

        if (initialData.questionsJson) {
          try {
            const parsed = JSON.parse(initialData.questionsJson)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setQuestions(parsed)
            } else {
              setQuestions([
                {
                  id: '1',
                  question: '',
                  options: ['', '', '', ''],
                  correctOptionIndex: 0,
                  explanation: '',
                },
              ])
            }
          } catch {
            setQuestions([
              {
                id: '1',
                question: '',
                options: ['', '', '', ''],
                correctOptionIndex: 0,
                explanation: '',
              },
            ])
          }
        }
      } else {
        setType('INTERNAL')
        setTargetType(initialTargetType || 'ALL')
        setGroupName(initialGroupName || '')
        setStudentId(initialStudentId ? String(initialStudentId) : '')
        setTitle('')
        setTopic('')
        setDescription('')
        setTimeLimitMinutes('')
        setDeadline('')
        setExternalUrl('')
        setQuestions([
          {
            id: '1',
            question: '',
            options: ['', '', '', ''],
            correctOptionIndex: 0,
            explanation: '',
          },
        ])
      }
    }
  }, [open, initialData, initialTargetType, initialGroupName, initialStudentId])

  // Question manipulation
  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        question: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        explanation: '',
      },
    ])
  }

  const handleRemoveQuestion = (qIndex: number) => {
    if (questions.length <= 1) {
      toast.info('В тесте должен быть хотя бы один вопрос')
      return
    }
    setQuestions((prev) => prev.filter((_, idx) => idx !== qIndex))
  }

  const handleQuestionTextChange = (qIndex: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === qIndex ? { ...q, question: text } : q)),
    )
  }

  const handleOptionTextChange = (qIndex: number, optIndex: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q
        const newOptions = [...q.options]
        newOptions[optIndex] = text
        return { ...q, options: newOptions }
      }),
    )
  }

  const handleAddOption = (qIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q
        if (q.options.length >= 6) {
          toast.info('Максимум 6 вариантов ответа')
          return q
        }
        return { ...q, options: [...q.options, ''] }
      }),
    )
  }

  const handleRemoveOption = (qIndex: number, optIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q
        if (q.options.length <= 2) {
          toast.info('Должно быть минимум 2 варианта ответа')
          return q
        }
        const newOptions = q.options.filter((_, oIdx) => oIdx !== optIndex)
        let newCorrect = q.correctOptionIndex
        if (newCorrect >= newOptions.length) {
          newCorrect = newOptions.length - 1
        }
        return { ...q, options: newOptions, correctOptionIndex: newCorrect }
      }),
    )
  }

  const handleSelectCorrectOption = (qIndex: number, optIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qIndex ? { ...q, correctOptionIndex: optIndex } : q,
      ),
    )
  }

  const handleExplanationChange = (qIndex: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === qIndex ? { ...q, explanation: text } : q)),
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      toast.error('Укажите название теста')
      return
    }

    let finalExternalUrl: string | undefined = undefined
    let finalQuestionsJson: string | undefined = undefined

    if (type === 'EXTERNAL') {
      const trimmedUrl = externalUrl.trim()
      if (!trimmedUrl) {
        toast.error('Укажите ссылку на внешний тест (Quizland, Quizlet и др.)')
        return
      }
      finalExternalUrl = trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')
        ? trimmedUrl
        : `https://${trimmedUrl}`
    } else {
      // Validate internal questions
      const cleanedQuestions: QuizQuestion[] = []
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        const trimmedQuestion = q.question.trim()
        if (!trimmedQuestion) {
          toast.error(`Введите текст вопроса №${i + 1}`)
          return
        }
        const filledOptions = q.options.map((o) => o.trim()).filter((o) => o.length > 0)
        if (filledOptions.length < 2) {
          toast.error(`В вопросе №${i + 1} заполните минимум 2 варианта ответа`)
          return
        }
        let safeCorrectIdx = q.correctOptionIndex
        if (safeCorrectIdx >= filledOptions.length) {
          safeCorrectIdx = 0
        }
        cleanedQuestions.push({
          id: q.id || String(i + 1),
          question: trimmedQuestion,
          options: filledOptions,
          correctOptionIndex: safeCorrectIdx,
          explanation: q.explanation?.trim() || undefined,
        })
      }
      finalQuestionsJson = JSON.stringify(cleanedQuestions)
    }

    if (targetType === 'GROUP' && !groupName.trim()) {
      toast.error('Выберите группу для теста')
      return
    }
    if (targetType === 'INDIVIDUAL' && !studentId) {
      toast.error('Выберите ученика для теста')
      return
    }

    const payload = {
      title: trimmedTitle,
      topic: topic.trim() || undefined,
      description: description.trim() || undefined,
      type,
      timeLimitMinutes: timeLimitMinutes ? Number(timeLimitMinutes) : undefined,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      externalUrl: finalExternalUrl,
      questionsJson: finalQuestionsJson,
      targetType,
      groupName: targetType === 'GROUP' ? groupName.trim() : undefined,
      studentId: targetType === 'INDIVIDUAL' ? studentId : undefined,
    }

    try {
      if (isEditing && initialData?.id) {
        const updated = await updateMutation.mutateAsync({
          id: initialData.id,
          data: payload,
        })
        toast.success('Тест успешно обновлен')
        onOpenChange(false)
        onSuccess?.(updated)
      } else {
        const created = await createMutation.mutateAsync(payload)
        toast.success('Тест успешно создан')
        onOpenChange(false)
        onSuccess?.(created)
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      const msg =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        'Не удалось сохранить тест'
      toast.error(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">
                {isEditing ? 'Редактировать тест' : 'Создать тест или квиз'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Создайте интерактивный тест на сайте или прикрепите ссылку на Quizland / Quizlet
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-3 space-y-4">
          {/* Test Type Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Формат теста</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('INTERNAL')}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  type === 'INTERNAL'
                    ? 'border-primary bg-primary/5 shadow-xs'
                    : 'border-border hover:bg-muted/40'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    type === 'INTERNAL'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-xs text-foreground">
                    Интерактивный на сайте
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Конструктор вопросов с автопроверкой
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setType('EXTERNAL')}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  type === 'EXTERNAL'
                    ? 'border-primary bg-primary/5 shadow-xs'
                    : 'border-border hover:bg-muted/40'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    type === 'EXTERNAL'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <LinkIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-xs text-foreground">
                    Внешний квиз / ссылка
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Quizland, Quizlet, Kahoot, Forms
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Target Audience Selector */}
          <div className="space-y-2 p-3.5 rounded-xl border border-border bg-muted/20">
            <Label className="text-xs font-semibold">Кому назначен тест</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTargetType('ALL')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                  targetType === 'ALL'
                    ? 'border-primary bg-primary/10 text-primary font-medium shadow-xs'
                    : 'border-border text-muted-foreground hover:bg-muted/40'
                }`}
              >
                <Globe className="h-4 w-4 mb-1" />
                <span className="text-xs">Всем ученикам</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('GROUP')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                  targetType === 'GROUP'
                    ? 'border-primary bg-primary/10 text-primary font-medium shadow-xs'
                    : 'border-border text-muted-foreground hover:bg-muted/40'
                }`}
              >
                <Users className="h-4 w-4 mb-1" />
                <span className="text-xs">Группе</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('INDIVIDUAL')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                  targetType === 'INDIVIDUAL'
                    ? 'border-primary bg-primary/10 text-primary font-medium shadow-xs'
                    : 'border-border text-muted-foreground hover:bg-muted/40'
                }`}
              >
                <User className="h-4 w-4 mb-1" />
                <span className="text-xs">Индивидуально</span>
              </button>
            </div>

            {targetType === 'GROUP' && (
              <div className="space-y-1.5 pt-1.5">
                <Label htmlFor="target-group" className="text-xs">
                  Выберите группу <span className="text-destructive">*</span>
                </Label>
                {groups.length === 0 ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    У вас пока нет созданных групп. Создайте группу в разделе «Ученики» или выберите индивидуального ученика.
                  </p>
                ) : (
                  <select
                    id="target-group"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-hidden focus:ring-1 focus:ring-ring text-foreground"
                    required
                  >
                    <option value="">-- Выберите учебную группу --</option>
                    {groups.map((g) => (
                      <option key={g.name} value={g.name}>
                        {g.name} ({g.studentCount} {g.studentCount === 1 ? 'ученик' : 'учеников'})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {targetType === 'INDIVIDUAL' && (
              <div className="space-y-1.5 pt-1.5">
                <Label htmlFor="target-student" className="text-xs">
                  Выберите ученика <span className="text-destructive">*</span>
                </Label>
                {students.length === 0 ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    У вас пока нет добавленных учеников.
                  </p>
                ) : (
                  <select
                    id="target-student"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-hidden focus:ring-1 focus:ring-ring text-foreground"
                    required
                  >
                    <option value="">-- Выберите ученика --</option>
                    {students.map((s) => {
                      const fullName = [s.firstName, s.lastName].filter(Boolean).join(' ')
                      const grp = s.groupName ? ` [Группа: ${s.groupName}]` : ' [Индивидуально]'
                      return (
                        <option key={s.id} value={s.id}>
                          {fullName}{grp}
                        </option>
                      )
                    })}
                  </select>
                )}
              </div>
            )}
          </div>

          {/* Title & Topic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="test-title">
                Название теста <span className="text-destructive">*</span>
              </Label>
              <Input
                id="test-title"
                placeholder="Например: Past Simple vs Present Perfect"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isPending}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="test-topic">Предмет / Тема</Label>
              <Input
                id="test-topic"
                placeholder="Например: Английский язык, B1"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="test-desc">Описание / Инструкция</Label>
            <Input
              id="test-desc"
              placeholder="Инструкция для ученика перед началом..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
            />
          </div>

          {/* Time Limit & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="test-time">Время на тест (мин)</Label>
              <Input
                id="test-time"
                type="number"
                min="1"
                max="180"
                placeholder="Напр. 15 (или без лимита)"
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(e.target.value)}
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="test-deadline">Срок сдачи (дедлайн)</Label>
              <Input
                id="test-deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          {/* EXTERNAL URL SECTION */}
          {type === 'EXTERNAL' && (
            <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/20">
              <div className="space-y-1.5">
                <Label htmlFor="test-url">
                  Ссылка на квиз / тест <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="test-url"
                    placeholder="https://quizland.io/... или https://quizlet.com/..."
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    className="pl-9 text-sm"
                    disabled={isPending}
                    required={type === 'EXTERNAL'}
                  />
                </div>
              </div>

              {/* Service chips */}
              <div className="space-y-1">
                <p className="text-[11px] text-muted-foreground font-medium">
                  Поддерживаемые сервисы (нажмите для примера):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_SERVICES.map((srv) => (
                    <button
                      key={srv.name}
                      type="button"
                      onClick={() => {
                        if (!externalUrl) setExternalUrl(srv.example)
                      }}
                      className="text-[11px] px-2 py-0.5 rounded-md border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {srv.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* INTERNAL QUESTIONS BUILDER */}
          {type === 'INTERNAL' && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Вопросы теста ({questions.length})
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Отметьте правильный вариант ответа зеленой радиокнопкой
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddQuestion}
                  className="h-8 gap-1 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Добавить вопрос</span>
                </Button>
              </div>

              <div className="space-y-4">
                {questions.map((q, qIdx) => (
                  <div
                    key={q.id || qIdx}
                    className="p-4 rounded-xl border border-border bg-card space-y-3 relative shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                        Вопрос {qIdx + 1}
                      </span>
                      {questions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveQuestion(qIdx)}
                          title="Удалить вопрос"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>

                    {/* Question text */}
                    <Input
                      placeholder={`Введите формулировку вопроса №${qIdx + 1}...`}
                      value={q.question}
                      onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                      className="font-medium text-sm"
                      required
                    />

                    {/* Options list */}
                    <div className="space-y-2 pt-1">
                      <Label className="text-[11px] font-semibold text-muted-foreground">
                        Варианты ответов:
                      </Label>
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = q.correctOptionIndex === optIdx
                        return (
                          <div key={optIdx} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSelectCorrectOption(qIdx, optIdx)}
                              className={`flex items-center justify-center h-6 w-6 rounded-full border transition-all ${
                                isCorrect
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-muted-foreground/40 hover:border-emerald-600'
                              }`}
                              title={isCorrect ? 'Правильный ответ' : 'Сделать правильным ответом'}
                            >
                              {isCorrect && <CheckCircle2 className="h-4 w-4" />}
                            </button>

                            <Input
                              placeholder={`Вариант ${optIdx + 1}`}
                              value={opt}
                              onChange={(e) =>
                                handleOptionTextChange(qIdx, optIdx, e.target.value)
                              }
                              className={`text-xs h-8 ${
                                isCorrect
                                  ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                                  : ''
                              }`}
                              required
                            />

                            {q.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(qIdx, optIdx)}
                                className="text-muted-foreground hover:text-destructive p-1"
                                title="Удалить вариант"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        )
                      })}

                      {q.options.length < 6 && (
                        <button
                          type="button"
                          onClick={() => handleAddOption(qIdx)}
                          className="text-xs text-primary hover:underline flex items-center gap-1 pt-1"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Добавить вариант ответа</span>
                        </button>
                      )}
                    </div>

                    {/* Explanation */}
                    <div className="pt-1">
                      <Input
                        placeholder="Пояснение к ответу (необязательно)..."
                        value={q.explanation || ''}
                        onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                        className="text-xs h-7 text-muted-foreground"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleAddQuestion}
                className="w-full gap-2 text-xs py-2 h-9 border-dashed"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Добавить еще один вопрос</span>
              </Button>
            </div>
          )}
        </form>

        <DialogFooter className="pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Отмена
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isPending || !title.trim()}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Сохранить изменения' : 'Создать тест'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
