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
import { Textarea } from '@/components/ui/textarea'
import { useStudents } from '@/hooks/useStudents'
import { useCreateLesson, useUpdateLesson } from '@/hooks/useLessons'
import { toast } from 'sonner'
import { Loader2, Video, Search, UserCheck } from 'lucide-react'
import type { Lesson, StudentProfile } from '@/types'
import type { AxiosError } from 'axios'

interface LessonFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Lesson | null
  onSuccess?: (lesson: Lesson) => void
}

function toLocalInputDateTime(isoOrDate?: string | Date): string {
  const d = isoOrDate ? new Date(isoOrDate) : new Date()
  if (isNaN(d.getTime())) return ''
  // Format as YYYY-MM-DDTHH:mm using local timezone
  const pad = (n: number) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const min = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

function getDefaultStartTime(): string {
  const now = new Date()
  now.setMinutes(0, 0, 0)
  now.setHours(now.getHours() + 1)
  return toLocalInputDateTime(now)
}

function getDefaultEndTime(startVal: string): string {
  if (!startVal) return ''
  const d = new Date(startVal)
  if (isNaN(d.getTime())) return ''
  d.setMinutes(d.getMinutes() + 60)
  return toLocalInputDateTime(d)
}

export function LessonFormDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: LessonFormDialogProps) {
  const isEditing = Boolean(initialData?.id)

  const { data: studentsData, isLoading: isLoadingStudents } = useStudents({
    size: 100,
  })
  const students = studentsData?.content || []

  const [studentId, setStudentId] = useState('')
  const [studentSearch, setStudentSearch] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [topic, setTopic] = useState('')
  const [meetingUrl, setMeetingUrl] = useState('')
  const [notes, setNotes] = useState('')

  const createMutation = useCreateLesson()
  const updateMutation = useUpdateLesson()
  const isPending = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (open) {
      if (initialData) {
        setStudentId(initialData.studentId || '')
        setStartTime(toLocalInputDateTime(initialData.startTime))
        setEndTime(toLocalInputDateTime(initialData.endTime))
        setTopic(initialData.topic || '')
        setMeetingUrl(initialData.meetingUrl || '')
        setNotes(initialData.notes || '')
      } else {
        const defaultStart = getDefaultStartTime()
        setStudentId(students[0]?.id || '')
        setStartTime(defaultStart)
        setEndTime(getDefaultEndTime(defaultStart))
        setTopic('')
        setMeetingUrl('')
        setNotes('')
      }
      setStudentSearch('')
    }
  }, [open, initialData])

  const handleStartTimeChange = (val: string) => {
    setStartTime(val)
    if (!endTime || new Date(val) >= new Date(endTime)) {
      setEndTime(getDefaultEndTime(val))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!studentId) {
      toast.error('Пожалуйста, выберите ученика')
      return
    }

    if (!startTime) {
      toast.error('Укажите время начала урока')
      return
    }

    if (!endTime) {
      toast.error('Укажите время окончания урока')
      return
    }

    if (new Date(startTime) >= new Date(endTime)) {
      toast.error('Время окончания урока должно быть позже времени начала')
      return
    }

    // Convert local datetime-local format to ISO-8601 string for backend
    const startIso = new Date(startTime).toISOString()
    const endIso = new Date(endTime).toISOString()

    const payload = {
      studentId,
      startTime: startIso,
      endTime: endIso,
      topic: topic.trim() || undefined,
      meetingUrl: meetingUrl.trim() || undefined,
      notes: notes.trim() || undefined,
    }

    try {
      if (isEditing && initialData?.id) {
        const updated = await updateMutation.mutateAsync({
          id: initialData.id,
          data: payload,
        })
        toast.success('Урок успешно обновлен')
        onOpenChange(false)
        onSuccess?.(updated)
      } else {
        const created = await createMutation.mutateAsync(payload)
        toast.success('Урок успешно запланирован')
        onOpenChange(false)
        onSuccess?.(created)
      }
    } catch (err) {
      const axiosError = err as AxiosError<{
        message?: string
        error?: string
        detail?: string
      }>
      // Show exact backend text (e.g. overlap error)
      const backendMessage =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.detail ||
        axiosError.response?.data?.error ||
        axiosError.message ||
        (isEditing ? 'Не удалось обновить урок' : 'Не удалось запланировать урок')
      toast.error(backendMessage)
    }
  }

  const filteredStudents = students.filter((s: StudentProfile) => {
    const fullName =
      s.name || [s.firstName, s.lastName].filter(Boolean).join(' ') || ''
    return fullName.toLowerCase().includes(studentSearch.toLowerCase())
  })

  const selectedStudent = students.find((s) => s.id === studentId)
  const selectedStudentName =
    selectedStudent?.name ||
    [selectedStudent?.firstName, selectedStudent?.lastName]
      .filter(Boolean)
      .join(' ') ||
    (initialData?.studentName ?? 'Выберите ученика')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Редактировать урок' : 'Запланировать новый урок'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Измените время, тему или ссылку на видеовстречу'
              : 'Укажите ученика, время проведения и тему занятия'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Student selection with search */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>
                Ученик <span className="text-destructive">*</span>
              </span>
              {selectedStudent && (
                <span className="text-xs text-muted-foreground font-normal flex items-center gap-1">
                  <UserCheck className="h-3 w-3 text-emerald-600" /> Выбран:{' '}
                  {selectedStudentName}
                </span>
              )}
            </Label>

            {/* Custom searchable select list */}
            <div className="border border-border rounded-lg p-2 bg-muted/20 space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Поиск по списку учеников..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-8 h-8 text-xs bg-background"
                  disabled={isPending || isLoadingStudents}
                />
              </div>

              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {isLoadingStudents ? (
                  <p className="text-xs text-muted-foreground p-2 text-center">
                    Загрузка учеников...
                  </p>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((s) => {
                    const name =
                      s.name ||
                      [s.firstName, s.lastName].filter(Boolean).join(' ') ||
                      'Ученик'
                    const isSelected = s.id === studentId
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setStudentId(s.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-md text-xs text-left transition-colors ${
                          isSelected
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        <span className="truncate">{name}</span>
                        {s.currentLevel && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              isSelected
                                ? 'bg-primary-foreground/20 text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {s.currentLevel}
                          </span>
                        )}
                      </button>
                    )
                  })
                ) : (
                  <p className="text-xs text-muted-foreground p-2 text-center">
                    Ученики не найдены
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startTime">
                Начало <span className="text-destructive">*</span>
              </Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                disabled={isPending}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endTime">
                Окончание <span className="text-destructive">*</span>
              </Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={isPending}
                required
              />
            </div>
          </div>

          {/* Topic */}
          <div className="space-y-1.5">
            <Label htmlFor="topic">Тема урока</Label>
            <Input
              id="topic"
              placeholder="Напр. Времена глаголов, решение задач 13-15"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isPending}
            />
          </div>

          {/* Meeting URL */}
          <div className="space-y-1.5">
            <Label htmlFor="meetingUrl" className="flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Ссылка на онлайн-урок (Google Meet, Zoom, Telegram)</span>
            </Label>
            <Input
              id="meetingUrl"
              type="url"
              placeholder="https://meet.google.com/xyz-abcd-efg"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              disabled={isPending}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Заметки к уроку</Label>
            <Textarea
              id="notes"
              placeholder="Материалы, ссылки, домашнее задание к уроку..."
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isPending}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Сохранить изменения' : 'Запланировать урок'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
