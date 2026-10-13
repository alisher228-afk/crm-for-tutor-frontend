import { useState, useEffect, useMemo, type FormEvent } from 'react'
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
import { useCreateLesson, useUpdateLesson, useLessons } from '@/hooks/useLessons'
import { toBackendDateTime, formatDateToLocalIso, toLocalInputDateTime } from '@/lib/dateUtils'
import { toast } from 'sonner'
import {
  Loader2,
  Video,
  Search,
  UserCheck,
  Users,
  User,
  AlertCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import type { Lesson, StudentProfile } from '@/types'
import type { AxiosError } from 'axios'
import { useLanguage } from '@/i18n'

interface LessonFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Lesson | null
  existingLessons?: Lesson[]
  onSuccess?: (lesson: Lesson) => void
}

function getDefaultStartTime(): string {
  const now = new Date()
  now.setMinutes(0, 0, 0)
  now.setHours(now.getHours() + 1)
  return toLocalInputDateTime(now)
}

const DURATION_PRESETS = [
  { key: 'preset_45m', minutes: 45 },
  { key: 'preset_1h', minutes: 60 },
  { key: 'preset_1_5h', minutes: 90 },
  { key: 'preset_2h', minutes: 120 },
  { key: 'preset_3h', minutes: 180 },
] as const

function calculateEndTime(startVal: string, durationMinutes: number): string {
  if (!startVal) return ''
  const d = new Date(startVal)
  if (isNaN(d.getTime())) return ''
  d.setMinutes(d.getMinutes() + durationMinutes)
  return toLocalInputDateTime(d)
}

function formatStartTimeDisplay(isoOrLocal: string, locale: string): string {
  if (!isoOrLocal) return '—'
  const d = new Date(isoOrLocal)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
}

function formatEndDisplay(startVal: string, endVal: string, locale: string): string {
  if (!endVal) return '—'
  const end = new Date(endVal)
  if (isNaN(end.getTime())) return '—'

  const timeStr = end.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })

  if (startVal) {
    const start = new Date(startVal)
    if (!isNaN(start.getTime()) && start.toDateString() !== end.toDateString()) {
      const dateStr = end.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'short',
      })
      return `${timeStr} (${dateStr})`
    }
  }

  return timeStr
}

function formatDurationLabel(
  minutes: number,
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (hours > 0 && remainingMinutes > 0) {
    return t('tutor_lessons.duration_hours_min', { hour: hours, min: remainingMinutes })
  }
  if (hours > 0) {
    return t('tutor_lessons.duration_hour', { hour: hours })
  }
  return t('tutor_lessons.duration_min', { min: minutes })
}

export function LessonFormDialog({
  open,
  onOpenChange,
  initialData,
  existingLessons,
  onSuccess,
}: LessonFormDialogProps) {
  const { t, language } = useLanguage()
  const timeLocale = language === 'en' ? 'en-US' : language === 'kk' ? 'kk-KZ' : 'ru-RU'
  const isEditing = Boolean(initialData?.id)

  const { data: studentsData, isLoading: isLoadingStudents } = useStudents({
    size: 100,
  })
  const students = studentsData?.content || []

  const [studentId, setStudentId] = useState('')
  const [studentSearch, setStudentSearch] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [selectedDuration, setSelectedDuration] = useState<number | null>(60)
  const [isCustomDuration, setIsCustomDuration] = useState(false)
  const [topic, setTopic] = useState('')
  const [meetingUrl, setMeetingUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [format, setFormat] = useState<'INDIVIDUAL' | 'GROUP'>('INDIVIDUAL')
  const [groupName, setGroupName] = useState('')

  const createMutation = useCreateLesson()
  const updateMutation = useUpdateLesson()
  const isPending = createMutation.isPending || updateMutation.isPending

  const availableGroups = Array.from(
    new Set(
      students
        .map((s) => s.groupName?.trim())
        .filter((g): g is string => Boolean(g))
    )
  ).sort()

  const groupStudents = students.filter(
    (s) => (s.groupName || '').trim().toLowerCase() === groupName.trim().toLowerCase()
  )

  useEffect(() => {
    if (open) {
      if (initialData?.id) {
        setStudentId(initialData.studentId || '')
        const localStart = toLocalInputDateTime(initialData.startTime)
        const localEnd = toLocalInputDateTime(initialData.endTime)
        setStartTime(localStart)
        setEndTime(localEnd)
        setTopic(initialData.topic || '')
        setMeetingUrl(initialData.meetingUrl || '')
        setNotes(initialData.notes || '')
        if (initialData.groupName?.trim()) {
          setFormat('GROUP')
          setGroupName(initialData.groupName.trim())
        } else {
          setFormat('INDIVIDUAL')
          setGroupName('')
        }

        if (localStart && localEnd) {
          const s = new Date(localStart).getTime()
          const e = new Date(localEnd).getTime()
          const diffMinutes = Math.round((e - s) / 60000)
          const isPreset = DURATION_PRESETS.some((p) => p.minutes === diffMinutes)
          if (isPreset) {
            setSelectedDuration(diffMinutes)
            setIsCustomDuration(false)
          } else {
            setSelectedDuration(diffMinutes > 0 ? diffMinutes : null)
            setIsCustomDuration(true)
          }
        } else {
          setSelectedDuration(60)
          setIsCustomDuration(false)
        }
      } else {
        const defaultStart = getDefaultStartTime()
        const defaultEnd = calculateEndTime(defaultStart, 60)
        const firstStudent = students[0]
        setStudentId(initialData?.studentId || firstStudent?.id || '')
        setStartTime(defaultStart)
        setEndTime(defaultEnd)
        setSelectedDuration(60)
        setIsCustomDuration(false)
        setTopic(initialData?.topic || '')
        setMeetingUrl(initialData?.meetingUrl || '')
        setNotes(initialData?.notes || '')
        if (initialData?.groupName?.trim()) {
          setFormat('GROUP')
          setGroupName(initialData.groupName.trim())
        } else {
          setFormat('INDIVIDUAL')
          setGroupName('')
        }
      }
      setStudentSearch('')
    }
  }, [open, initialData])

  const handleStartTimeChange = (val: string) => {
    setStartTime(val)
    if (val) {
      if (!isCustomDuration && selectedDuration) {
        setEndTime(calculateEndTime(val, selectedDuration))
      } else if (endTime && new Date(val) >= new Date(endTime)) {
        setEndTime(calculateEndTime(val, selectedDuration || 60))
      }
    }
  }

  const handleDurationSelect = (minutes: number) => {
    setSelectedDuration(minutes)
    setIsCustomDuration(false)
    if (startTime) {
      setEndTime(calculateEndTime(startTime, minutes))
    }
  }

  const handleCustomEndTimeChange = (val: string) => {
    setEndTime(val)
    if (startTime && val) {
      const s = new Date(startTime).getTime()
      const e = new Date(val).getTime()
      if (!isNaN(s) && !isNaN(e) && e > s) {
        const diff = Math.round((e - s) / 60000)
        const match = DURATION_PRESETS.find((p) => p.minutes === diff)
        if (match) {
          setSelectedDuration(match.minutes)
        } else {
          setSelectedDuration(diff)
        }
      }
    }
  }

  const calculatedDurationMinutes = useMemo(() => {
    if (!startTime || !endTime) return 0
    const s = new Date(startTime).getTime()
    const e = new Date(endTime).getTime()
    if (isNaN(s) || isNaN(e) || e <= s) return 0
    return Math.round((e - s) / 60000)
  }, [startTime, endTime])

  const conflictDateRange = useMemo(() => {
    if (!open || !startTime) return undefined
    const d = new Date(startTime)
    if (isNaN(d.getTime())) return undefined
    const from = new Date(d)
    from.setHours(0, 0, 0, 0)
    const to = new Date(d)
    to.setHours(23, 59, 59, 999)
    return { from: formatDateToLocalIso(from), to: formatDateToLocalIso(to) }
  }, [open, startTime])

  const { data: fetchedLessons } = useLessons(existingLessons ? undefined : conflictDateRange)
  const lessonsToCheck = existingLessons || fetchedLessons || []

  const conflicts = useMemo(() => {
    if (!startTime || !endTime) return []
    const s = new Date(startTime).getTime()
    const e = new Date(endTime).getTime()
    if (isNaN(s) || isNaN(e) || e <= s) return []

    return lessonsToCheck.filter((l) => {
      if (initialData?.id && String(l.id) === String(initialData.id)) return false
      if (l.status === 'CANCELLED_BY_TUTOR' || l.status === 'CANCELLED_BY_STUDENT') return false
      if (
        format === 'GROUP' &&
        groupName &&
        l.groupName &&
        l.groupName.trim().toLowerCase() === groupName.trim().toLowerCase() &&
        new Date(l.startTime).getTime() === s
      ) {
        return false
      }

      const ls = new Date(l.startTime).getTime()
      const le = new Date(l.endTime).getTime()
      return ls < e && le > s
    })
  }, [lessonsToCheck, startTime, endTime, initialData?.id, format, groupName])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (format === 'GROUP') {
      const trimmedGroup = groupName.trim()
      if (!trimmedGroup) {
        toast.error(t('tutor_lessons.err_group_req'))
        return
      }
      const matching = students.filter(
        (s) => (s.groupName || '').trim().toLowerCase() === trimmedGroup.toLowerCase()
      )
      if (matching.length === 0) {
        toast.error(
          t('tutor_lessons.err_group_no_students', { group: trimmedGroup }),
        )
        return
      }
    } else {
      if (!studentId) {
        toast.error(t('tutor_lessons.err_student_req'))
        return
      }
    }

    if (!startTime) {
      toast.error(t('tutor_lessons.err_start_req'))
      return
    }

    if (!endTime) {
      toast.error(t('tutor_lessons.err_end_req'))
      return
    }

    if (new Date(startTime) >= new Date(endTime)) {
      toast.error(t('tutor_lessons.err_end_after_start'))
      return
    }

    const startIso = toBackendDateTime(startTime)
    const endIso = toBackendDateTime(endTime)

    if (!startIso || !endIso) {
      toast.error(t('tutor_lessons.err_time_format'))
      return
    }

    const payload = {
      studentId: format === 'INDIVIDUAL' ? studentId : undefined,
      startTime: startIso,
      endTime: endIso,
      topic: topic.trim() || undefined,
      meetingUrl: meetingUrl.trim() || undefined,
      groupName: format === 'GROUP' ? groupName.trim() : undefined,
      notes: notes.trim() || undefined,
    }

    try {
      if (isEditing && initialData?.id) {
        const updated = await updateMutation.mutateAsync({
          id: initialData.id,
          data: payload,
        })
        toast.success(t('tutor_lessons.toast_updated'))
        onOpenChange(false)
        onSuccess?.(updated)
      } else {
        const created = await createMutation.mutateAsync(payload)
        if (format === 'GROUP') {
          const matchingCount = students.filter(
            (s) => (s.groupName || '').trim().toLowerCase() === groupName.trim().toLowerCase(),
          ).length
          const noun =
            matchingCount === 1
              ? t('tutor_lessons.student_noun_1')
              : matchingCount < 5
              ? t('tutor_lessons.student_noun_few')
              : t('tutor_lessons.student_noun_many')
          toast.success(
            t('tutor_lessons.toast_created_group', {
              group: groupName.trim(),
              count: matchingCount,
              noun,
            }),
          )
        } else {
          toast.success(t('tutor_lessons.toast_created_indiv'))
        }
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
        (isEditing ? t('tutor_lessons.toast_update_err') : t('tutor_lessons.toast_create_err'))
      toast.error(backendMessage)
    }
  }

  const filteredStudents = students.filter((s: StudentProfile) => {
    const fullName =
      s.name || [s.firstName, s.lastName].filter(Boolean).join(' ') || ''
    return fullName.toLowerCase().includes(studentSearch.toLowerCase())
  })

  const selectedStudent = students.find((s) => String(s.id) === String(studentId))
  const selectedStudentName =
    selectedStudent?.name ||
    [selectedStudent?.firstName, selectedStudent?.lastName]
      .filter(Boolean)
      .join(' ') ||
    initialData?.studentName ||
    [initialData?.studentFirstName, initialData?.studentLastName].filter(Boolean).join(' ') ||
    t('tutor_lessons.choose_student_placeholder')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('tutor_lessons.form_title_edit') : t('tutor_lessons.form_title_create')}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('tutor_lessons.form_desc_edit')
              : t('tutor_lessons.form_desc_create')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Format selection */}
          <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
            <Label className="text-xs font-semibold">{t('tutor_lessons.format_label')}</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={format === 'INDIVIDUAL' ? 'default' : 'outline'}
                size="sm"
                className="w-full text-xs flex items-center gap-1.5"
                onClick={() => setFormat('INDIVIDUAL')}
              >
                <User className="h-3.5 w-3.5" />
                {t('tutor_lessons.format_individual')}
              </Button>
              <Button
                type="button"
                variant={format === 'GROUP' ? 'default' : 'outline'}
                size="sm"
                className="w-full text-xs flex items-center gap-1.5"
                onClick={() => setFormat('GROUP')}
              >
                <Users className="h-3.5 w-3.5" />
                {t('tutor_lessons.format_group')}
              </Button>
            </div>
          </div>

          {format === 'INDIVIDUAL' ? (
            /* Student selection with search */
            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                <span>
                  {t('tutor_lessons.label_student')} <span className="text-destructive">*</span>
                </span>
                {selectedStudent && (
                  <span className="text-xs text-muted-foreground font-normal flex items-center gap-1">
                    <UserCheck className="h-3 w-3 text-emerald-600" /> {t('tutor_lessons.selected_label')}{' '}
                    {selectedStudentName}
                  </span>
                )}
              </Label>

              {/* Custom searchable select list */}
              <div className="border border-border rounded-lg p-2 bg-muted/20 space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder={t('tutor_lessons.search_student_placeholder')}
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-8 h-8 text-xs bg-background"
                    disabled={isPending || isLoadingStudents}
                  />
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                  {isLoadingStudents ? (
                    <p className="text-xs text-muted-foreground p-2 text-center">
                      {t('tutor_lessons.students_loading')}
                    </p>
                  ) : filteredStudents.length > 0 ? (
                    filteredStudents.map((s) => {
                      const name =
                        s.name ||
                        [s.firstName, s.lastName].filter(Boolean).join(' ') ||
                        t('tutor_lessons.default_student')
                      const isSelected = s.id === studentId
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setStudentId(s.id)
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-md text-xs text-left transition-colors ${
                            isSelected
                              ? 'bg-primary text-primary-foreground font-medium'
                              : 'hover:bg-muted text-foreground'
                          }`}
                        >
                          <span className="truncate">{name}</span>
                          <div className="flex items-center gap-1.5">
                            {s.groupName && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 font-medium">
                                {s.groupName}
                              </span>
                            )}
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
                          </div>
                        </button>
                      )
                    })
                  ) : (
                    <p className="text-xs text-muted-foreground p-2 text-center">
                      {t('tutor_lessons.students_not_found')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Group selection */
            <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
              <Label htmlFor="lesson-group" className="text-xs font-semibold flex items-center justify-between">
                <span>
                  {t('tutor_lessons.label_group_name')} <span className="text-destructive">*</span>
                </span>
                {groupStudents.length > 0 && (
                  <span className="text-xs text-emerald-600 font-normal flex items-center gap-1">
                    <UserCheck className="h-3 w-3" /> {t('tutor_lessons.group_students_count', { count: groupStudents.length })}
                  </span>
                )}
              </Label>
              <Input
                id="lesson-group"
                placeholder={t('tutor_lessons.group_placeholder')}
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                disabled={isPending}
                required={format === 'GROUP'}
              />

              {availableGroups.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] text-muted-foreground">{t('tutor_lessons.existing_groups_label')}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {availableGroups.map((g) => {
                      const isSelected = groupName.trim().toLowerCase() === g.toLowerCase()
                      const count = students.filter(
                        (s) => (s.groupName || '').trim().toLowerCase() === g.toLowerCase(),
                      ).length
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGroupName(g)}
                          className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground font-medium'
                              : 'border-border bg-background hover:bg-muted text-foreground'
                          }`}
                        >
                          {g} <span className="opacity-70">({count})</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {groupName.trim() && groupStudents.length > 0 && (
                <div className="pt-2 border-t border-border/50 text-xs">
                  <span className="text-muted-foreground">{t('tutor_lessons.group_broadcast_notice')}</span>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {groupStudents.map((s) => {
                      const name =
                        s.name ||
                        [s.firstName, s.lastName].filter(Boolean).join(' ') ||
                        t('tutor_lessons.default_student')
                      return (
                        <span
                          key={s.id}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-primary/10 text-primary font-medium"
                        >
                          {name}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {groupName.trim() && groupStudents.length === 0 && (
                <div className="pt-2 text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    {t('tutor_lessons.group_empty_warning', { name: groupName })}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Time & Duration */}
          <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3">
            <div className="space-y-1.5">
              <Label htmlFor="startTime" className="text-xs font-semibold flex items-center justify-between">
                <span>
                  {t('tutor_lessons.label_start_time')} <span className="text-destructive">*</span>
                </span>
                {endTime && startTime && (
                  <span className="text-xs font-normal text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    {t('tutor_lessons.label_end_time')}{' '}
                    <span className="font-semibold text-foreground">
                      {formatEndDisplay(startTime, endTime, timeLocale)}
                    </span>
                  </span>
                )}
              </Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                disabled={isPending}
                required
                className="bg-background"
              />
            </div>

            {/* Duration Selector */}
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t('tutor_lessons.label_duration')}
                </Label>
                <button
                  type="button"
                  onClick={() => {
                    const next = !isCustomDuration
                    setIsCustomDuration(next)
                    if (!next && selectedDuration && startTime) {
                      setEndTime(calculateEndTime(startTime, selectedDuration))
                    }
                  }}
                  className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                >
                  {isCustomDuration ? t('tutor_lessons.btn_select_duration') : t('tutor_lessons.btn_specify_end_manually')}
                </button>
              </div>

              {/* Quick preset buttons */}
              <div className="grid grid-cols-5 gap-1.5">
                {DURATION_PRESETS.map((preset) => {
                  const isSelected = !isCustomDuration && selectedDuration === preset.minutes
                  return (
                    <Button
                      key={preset.minutes}
                      type="button"
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      className={`h-8 text-xs font-medium cursor-pointer transition-all ${
                        isSelected
                          ? 'shadow-sm font-semibold'
                          : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => handleDurationSelect(preset.minutes)}
                      disabled={isPending}
                    >
                      {t(`tutor_lessons.${preset.key}`)}
                    </Button>
                  )
                })}
              </div>

              {/* Manual End Time input if custom mode is enabled */}
              {isCustomDuration && (
                <div className="pt-2 space-y-1.5 animate-in fade-in-50 duration-150">
                  <Label htmlFor="endTime" className="text-xs font-medium text-foreground">
                    {t('tutor_lessons.label_exact_end')} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => handleCustomEndTimeChange(e.target.value)}
                    disabled={isPending}
                    required
                    className="bg-background"
                  />
                </div>
              )}

              {/* Calculated Schedule Preview Box */}
              {startTime && endTime && (
                <div className="flex items-center justify-between text-xs rounded-md bg-background/80 border border-border/80 px-3 py-2 mt-2">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    {t('tutor_lessons.schedule_preview_label')}
                  </span>
                  <span className="font-semibold text-foreground">
                    {formatStartTimeDisplay(startTime, timeLocale)} — {formatEndDisplay(startTime, endTime, timeLocale)}
                    {calculatedDurationMinutes > 0 && (
                      <span className="text-muted-foreground font-normal ml-1.5">
                        ({formatDurationLabel(calculatedDurationMinutes, t)})
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Time Conflict Soft Warning */}
          {conflicts.length > 0 && (
            <div className="rounded-lg border border-amber-300 dark:border-amber-700/60 bg-amber-50/80 dark:bg-amber-950/40 p-3 text-xs text-amber-900 dark:text-amber-200 space-y-1.5 animate-in fade-in-50 duration-150">
              <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>{t('tutor_lessons.conflict_title')}</span>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-300/90 leading-relaxed">
                {conflicts.length === 1
                  ? t('tutor_lessons.conflict_desc_1')
                  : t('tutor_lessons.conflict_desc_few', { count: conflicts.length })}
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] font-medium">
                {conflicts.map((cl) => {
                  const name = cl.groupName?.trim()
                    ? t('tutor_lessons.group_prefix', { name: cl.groupName.trim() })
                    : (cl.studentName || [cl.studentFirstName, cl.studentLastName].filter(Boolean).join(' ') || t('tutor_lessons.default_student'))
                  const time = `${formatStartTimeDisplay(cl.startTime, timeLocale)} — ${formatEndDisplay(cl.startTime, cl.endTime, timeLocale)}`
                  return (
                    <li key={cl.id}>
                      <span className="font-semibold text-foreground">{name}</span> ({time})
                    </li>
                  )
                })}
              </ul>
              <p className="text-[10px] text-muted-foreground pt-0.5">
                {t('tutor_lessons.conflict_notice')}
              </p>
            </div>
          )}

          {/* Topic */}
          <div className="space-y-1.5">
            <Label htmlFor="topic">{t('tutor_lessons.label_topic')}</Label>
            <Input
              id="topic"
              placeholder={t('tutor_lessons.placeholder_topic')}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isPending}
            />
          </div>

          {/* Meeting URL */}
          <div className="space-y-1.5">
            <Label htmlFor="meetingUrl" className="flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{t('tutor_lessons.label_meeting_url')}</span>
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
            <Label htmlFor="notes">{t('tutor_lessons.label_notes')}</Label>
            <Textarea
              id="notes"
              placeholder={t('tutor_lessons.placeholder_notes')}
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
              {t('tutor_lessons.btn_cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? t('tutor_lessons.btn_save_changes') : t('tutor_lessons.btn_submit_create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
