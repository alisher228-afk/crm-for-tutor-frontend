import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useStudents, useStudentGroups } from '@/hooks/useStudents'
import {
  useStudentHomework,
  useGroupHomework,
  useUpdateHomeworkStatus,
  useDeleteHomework,
} from '@/hooks/useHomework'
import { useLanguage } from '@/i18n'
import { CreateHomeworkDialog } from './homework/CreateHomeworkDialog'
import { HomeworkDetailsSheet } from './homework/HomeworkDetailsSheet'
import { DeleteHomeworkConfirmDialog } from './homework/DeleteHomeworkConfirmDialog'
import { toast } from 'sonner'
import {
  BookCheck,
  BookPlus,
  Search,
  User,
  Users,
  UserCheck,
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  MessageSquare,
  Paperclip,
  Loader2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react'
import type { Homework } from '@/types'
import type { AxiosError } from 'axios'

function formatDeadline(isoStr: string | undefined, dateLocale: string, fallback: string): { text: string; isPast: boolean } {
  if (!isoStr) return { text: fallback, isPast: false }
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return { text: fallback, isPast: false }
  const isPast = d.getTime() < Date.now()
  const text = d.toLocaleDateString(dateLocale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
  return { text, isPast }
}

interface GroupAssignmentSummary {
  key: string
  title: string
  description?: string
  deadline?: string
  createdAt?: string
  totalCount: number
  submittedCount: number
  assignedCount: number
  reviewedCount: number
  submissions: Homework[]
}

export function TutorHomeworkPage() {
  const { t, language } = useLanguage()
  const dateLocale = language === 'en' ? 'en-US' : language === 'kk' ? 'kk-KZ' : 'ru-RU'

  const statusBadgeConfig: Record<
    string,
    { label: string; badgeClass: string; icon: typeof CheckCircle2 }
  > = {
    ASSIGNED: {
      label: t('tutor_homework.status_assigned'),
      badgeClass:
        'bg-muted text-muted-foreground border border-border font-medium',
      icon: Clock,
    },
    SUBMITTED: {
      label: t('tutor_homework.status_submitted'),
      badgeClass:
        'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/25 font-semibold',
      icon: AlertCircle,
    },
    REVIEWED: {
      label: t('tutor_homework.status_reviewed'),
      badgeClass:
        'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 font-medium',
      icon: CheckCircle2,
    },
  }

  // Main tab: individual or group
  const [activeMainTab, setActiveMainTab] = useState<'individual' | 'group'>('individual')

  // Sub-view inside group tab: group overview or per-student
  const [groupSubView, setGroupSubView] = useState<'group_overview' | 'per_student'>('group_overview')

  // Expanded assignment cards in group view
  const [expandedAssignments, setExpandedAssignments] = useState<Record<string, boolean>>({})

  // Fetch all students for individual tab and fallback
  const { data: studentsData, isLoading: isLoadingStudents } = useStudents({ size: 200 })
  const allStudents = useMemo(() => studentsData?.content || [], [studentsData])

  // Individual students (no group or empty group name)
  const individualStudents = useMemo(() => {
    const list = allStudents.filter(
      (s) => !s.groupName || s.groupName.trim() === ''
    )
    return list.length > 0 ? list : allStudents
  }, [allStudents])

  // Groups list
  const { data: groups = [], isLoading: isLoadingGroups } = useStudentGroups()

  // Selected state for Individual tab
  const [individualSearch, setIndividualSearch] = useState('')
  const [selectedIndividualId, setSelectedIndividualId] = useState<string>('')

  // Selected state for Group tab
  const [selectedGroupName, setSelectedGroupName] = useState<string>('')
  const [selectedGroupStudentId, setSelectedGroupStudentId] = useState<string>('')

  // Auto-select first individual student
  useEffect(() => {
    if (!selectedIndividualId && individualStudents.length > 0) {
      setSelectedIndividualId(individualStudents[0].id)
    }
  }, [individualStudents, selectedIndividualId])

  // Auto-select first group
  useEffect(() => {
    if (!selectedGroupName && groups.length > 0) {
      setSelectedGroupName(groups[0].name)
    }
  }, [groups, selectedGroupName])

  // Current active group
  const currentGroup = useMemo(
    () => groups.find((g) => g.name === selectedGroupName),
    [groups, selectedGroupName]
  )

  const groupStudents = useMemo(() => {
    if (!currentGroup) return []
    return currentGroup.students || []
  }, [currentGroup])

  // Auto-select first student in group for "per_student" mode
  useEffect(() => {
    if (groupStudents.length > 0) {
      if (!selectedGroupStudentId || !groupStudents.some((s) => s.id === selectedGroupStudentId)) {
        setSelectedGroupStudentId(groupStudents[0].id)
      }
    } else {
      setSelectedGroupStudentId('')
    }
  }, [groupStudents, selectedGroupStudentId])

  // Selected individual student profile
  const selectedIndividual = useMemo(
    () => individualStudents.find((s) => s.id === selectedIndividualId),
    [individualStudents, selectedIndividualId]
  )

  const selectedIndividualName =
    selectedIndividual?.name ||
    [selectedIndividual?.firstName, selectedIndividual?.lastName].filter(Boolean).join(' ') ||
    t('tutor_students.default_student_name')

  // Selected group student profile
  const selectedGroupStudent = useMemo(
    () => groupStudents.find((s) => s.id === selectedGroupStudentId),
    [groupStudents, selectedGroupStudentId]
  )

  const selectedGroupStudentName =
    selectedGroupStudent?.name ||
    [selectedGroupStudent?.firstName, selectedGroupStudent?.lastName].filter(Boolean).join(' ') ||
    t('tutor_students.default_student_name')

  // Homework query for Individual tab
  const {
    data: individualHomeworkList = [],
    isLoading: isLoadingIndividualHw,
    isError: isErrorIndividualHw,
    refetch: refetchIndividualHw,
  } = useStudentHomework(selectedIndividualId)

  // Homework query for Group (entire group)
  const {
    data: groupHomeworkList = [],
    isLoading: isLoadingGroupHw,
    isError: isErrorGroupHw,
    refetch: refetchGroupHw,
  } = useGroupHomework(selectedGroupName)

  // Homework query for Group -> per student
  const {
    data: groupStudentHwList = [],
    isLoading: isLoadingGroupStudentHw,
    isError: isErrorGroupStudentHw,
    refetch: refetchGroupStudentHw,
  } = useStudentHomework(selectedGroupStudentId)

  // Group assignments aggregation
  const groupAssignments = useMemo(() => {
    const map = new Map<string, GroupAssignmentSummary>()
    for (const hw of groupHomeworkList) {
      const key = `${hw.title.trim().toLowerCase()}__${hw.deadline || ''}`
      if (!map.has(key)) {
        map.set(key, {
          key,
          title: hw.title,
          description: hw.description,
          deadline: hw.deadline,
          createdAt: hw.createdAt,
          totalCount: 0,
          submittedCount: 0,
          assignedCount: 0,
          reviewedCount: 0,
          submissions: [],
        })
      }
      const ga = map.get(key)!
      ga.totalCount++
      if (hw.status === 'SUBMITTED') ga.submittedCount++
      else if (hw.status === 'REVIEWED') ga.reviewedCount++
      else ga.assignedCount++
      ga.submissions.push(hw)
    }
    return Array.from(map.values())
  }, [groupHomeworkList])

  // Mutations
  const updateStatusMutation = useUpdateHomeworkStatus()
  const deleteMutation = useDeleteHomework()

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createMode, setCreateMode] = useState<'student' | 'group'>('student')
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [deleteCandidate, setDeleteCandidate] = useState<Homework | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const toggleAssignmentExpand = (key: string) => {
    setExpandedAssignments((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleDeleteClick = (e: React.MouseEvent, hw: Homework) => {
    e.stopPropagation()
    setDeleteCandidate(hw)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return
    try {
      await deleteMutation.mutateAsync(deleteCandidate.id)
      toast.success(t('tutor_homework.toast_deleted', { title: deleteCandidate.title }))
      setIsDeleteOpen(false)
      if (selectedHomework?.id === deleteCandidate.id) {
        setIsDetailsOpen(false)
        setSelectedHomework(null)
      }
      setDeleteCandidate(null)
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      toast.error(
        axiosError.response?.data?.message || t('tutor_homework.toast_delete_err'),
      )
    }
  }

  const handleQuickReview = async (e: React.MouseEvent, hw: Homework) => {
    e.stopPropagation()
    try {
      await updateStatusMutation.mutateAsync({
        id: hw.id,
        status: 'REVIEWED',
      })
      toast.success(t('tutor_homework.toast_reviewed_success', { title: hw.title }))
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      toast.error(
        axiosError.response?.data?.message || t('tutor_homework.toast_status_err'),
      )
    }
  }

  const handleCardClick = (hw: Homework) => {
    setSelectedHomework(hw)
    setIsDetailsOpen(true)
  }

  // Filter individual students by search
  const filteredIndividualStudents = useMemo(() => {
    return individualStudents.filter((s) => {
      const fullName =
        s.name || [s.firstName, s.lastName].filter(Boolean).join(' ') || ''
      return fullName.toLowerCase().includes(individualSearch.toLowerCase())
    })
  }, [individualStudents, individualSearch])

  // Stats for individual student
  const individualStats = useMemo(() => {
    const total = individualHomeworkList.length
    const submitted = individualHomeworkList.filter((h) => h.status === 'SUBMITTED').length
    const assigned = individualHomeworkList.filter((h) => h.status === 'ASSIGNED').length
    const reviewed = individualHomeworkList.filter((h) => h.status === 'REVIEWED').length
    return { total, submitted, assigned, reviewed }
  }, [individualHomeworkList])

  // Stats for group as a whole
  const groupStats = useMemo(() => {
    const totalAssignments = groupAssignments.length
    const totalSubmissions = groupHomeworkList.length
    const submitted = groupHomeworkList.filter((h) => h.status === 'SUBMITTED').length
    const reviewed = groupHomeworkList.filter((h) => h.status === 'REVIEWED').length
    const assigned = groupHomeworkList.filter((h) => h.status === 'ASSIGNED').length
    return { totalAssignments, totalSubmissions, submitted, reviewed, assigned }
  }, [groupAssignments, groupHomeworkList])

  // Stats for selected student in group
  const groupStudentStats = useMemo(() => {
    const total = groupStudentHwList.length
    const submitted = groupStudentHwList.filter((h) => h.status === 'SUBMITTED').length
    const assigned = groupStudentHwList.filter((h) => h.status === 'ASSIGNED').length
    const reviewed = groupStudentHwList.filter((h) => h.status === 'REVIEWED').length
    return { total, submitted, assigned, reviewed }
  }, [groupStudentHwList])

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('tutor_homework.title')}</h1>
          <p className="text-muted-foreground text-sm">
            {t('tutor_homework.subtitle')}
          </p>
        </div>

        {/* Action Button based on Active Tab */}
        {activeMainTab === 'individual' && selectedIndividualId && (
          <Button
            onClick={() => {
              setCreateMode('student')
              setIsCreateOpen(true)
            }}
            className="self-start sm:self-auto gap-2"
          >
            <BookPlus className="h-4 w-4" />
            <span>{t('tutor_homework.btn_assign')}</span>
          </Button>
        )}

        {activeMainTab === 'group' && selectedGroupName && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {groupSubView === 'group_overview' ? (
              <Button
                onClick={() => {
                  setCreateMode('group')
                  setIsCreateOpen(true)
                }}
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                <span>{t('tutor_homework.btn_assign_group')}</span>
              </Button>
            ) : selectedGroupStudentId ? (
              <Button
                onClick={() => {
                  setCreateMode('student')
                  setIsCreateOpen(true)
                }}
                className="gap-2"
              >
                <BookPlus className="h-4 w-4" />
                <span>{t('tutor_homework.btn_assign_student')}</span>
              </Button>
            ) : null}
          </div>
        )}
      </div>

      {/* Main Tabs: Индивидуальные vs Групповые */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setActiveMainTab('individual')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeMainTab === 'individual'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <User className="h-4 w-4" />
          <span>{t('tutor_homework.tab_individual')}</span>
          <span
            className={`ml-1 px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
              activeMainTab === 'individual'
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {individualStudents.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('group')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeMainTab === 'group'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>{t('tutor_homework.tab_group')}</span>
          <span
            className={`ml-1 px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
              activeMainTab === 'group'
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {groups.length}
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: ИНДИВИДУАЛЬНЫЕ                                      */}
      {/* ============================================================== */}
      {activeMainTab === 'individual' && (
        <div className="space-y-6">
          {/* Individual Student Selector Card */}
          <Card className="border-border">
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <User className="h-4 w-4 text-primary" />
                  <span>{t('tutor_homework.label_student')}</span>
                  <span className="font-bold text-primary">
                    {selectedIndividualName}
                  </span>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder={t('tutor_homework.search_individual_placeholder')}
                    value={individualSearch}
                    onChange={(e) => setIndividualSearch(e.target.value)}
                    className="pl-8 h-8 text-xs bg-background"
                  />
                </div>
              </div>

              {/* Horizontal student pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
                {isLoadingStudents ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-28 rounded-full shrink-0" />
                  ))
                ) : filteredIndividualStudents.length > 0 ? (
                  filteredIndividualStudents.map((s) => {
                    const name =
                      s.name ||
                      [s.firstName, s.lastName].filter(Boolean).join(' ') ||
                      t('tutor_students.default_student_name')
                    const isSelected = s.id === selectedIndividualId
                    const initial = name.charAt(0).toUpperCase()

                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedIndividualId(s.id)}
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
                    {t('tutor_homework.empty_individual_search')}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Bar */}
          {selectedIndividual && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="border-border">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground font-medium">{t('tutor_homework.stat_total')}</p>
                  <p className="text-xl font-bold mt-0.5 text-foreground">
                    {individualStats.total}
                  </p>
                </CardContent>
              </Card>

              <Card
                className={`border-border ${
                  individualStats.submitted > 0
                    ? 'border-amber-300 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-900'
                    : ''
                }`}
              >
                <CardContent className="p-3 text-center">
                  <p
                    className={`text-xs font-medium ${
                      individualStats.submitted > 0
                        ? 'text-amber-700 dark:text-amber-300 font-semibold'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {t('tutor_homework.stat_submitted')}
                  </p>
                  <p
                    className={`text-xl font-bold mt-0.5 ${
                      individualStats.submitted > 0
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-foreground'
                    }`}
                  >
                    {individualStats.submitted}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground font-medium">{t('tutor_homework.stat_assigned')}</p>
                  <p className="text-xl font-bold mt-0.5 text-foreground">
                    {individualStats.assigned}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground font-medium">{t('tutor_homework.stat_reviewed')}</p>
                  <p className="text-xl font-bold mt-0.5 text-emerald-600 dark:text-emerald-400">
                    {individualStats.reviewed}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Homework Cards List */}
          {isLoadingIndividualHw ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : isErrorIndividualHw ? (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <div>
                  <p className="font-semibold text-base text-foreground">
                    {t('tutor_homework.err_load_hw_title')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    {t('tutor_homework.err_load_hw_desc')}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetchIndividualHw()}>
                  {t('tutor_homework.btn_retry')}
                </Button>
              </CardContent>
            </Card>
          ) : individualHomeworkList.length > 0 ? (
            <div className="space-y-3">
              {individualHomeworkList.map((hw) => {
                const statusInfo = statusBadgeConfig[hw.status] || {
                  label: hw.status,
                  badgeClass: 'bg-muted text-muted-foreground',
                  icon: Clock,
                }
                const { text: deadlineText, isPast } = formatDeadline(hw.deadline, dateLocale, t('tutor_homework.deadline_none'))
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
                              {t('tutor_homework.deadline_overdue')}
                            </span>
                          )}

                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {t('tutor_homework.deadline_prefix', { date: deadlineText })}
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
                              {t('tutor_homework.has_student_notes')}
                            </span>
                          )}
                          {hw.attachments && hw.attachments.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Paperclip className="h-3 w-3" />
                              {t('tutor_homework.attachments_count', { count: hw.attachments.length })}
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
                            <span>{t('tutor_homework.btn_reviewed_quick')}</span>
                          </Button>
                        )}

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => handleDeleteClick(e, hw)}
                          title={t('tutor_homework.tooltip_delete')}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

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
                  <p className="font-semibold text-base">{t('tutor_homework.empty_student_hw_title')}</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    {t('tutor_homework.empty_student_hw_desc', { name: selectedIndividualName })}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setCreateMode('student')
                    setIsCreateOpen(true)
                  }}
                >
                  <BookPlus className="mr-2 h-4 w-4" />
                  {t('tutor_homework.btn_create_first_hw')}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 2: ГРУППОВЫЕ                                           */}
      {/* ============================================================== */}
      {activeMainTab === 'group' && (
        <div className="space-y-6">
          {/* Groups Selector Card */}
          {isLoadingGroups ? (
            <Skeleton className="h-20 w-full rounded-xl" />
          ) : groups.length === 0 ? (
            <Card className="border-border">
              <CardContent className="h-48 flex flex-col items-center justify-center text-center p-6 space-y-2">
                <Users className="h-8 w-8 text-muted-foreground opacity-60" />
                <p className="font-semibold text-base">{t('tutor_homework.empty_groups_title')}</p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  {t('tutor_homework.empty_groups_desc')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <FolderKanban className="h-4 w-4 text-primary" />
                    <span>{t('tutor_homework.group_select_label')}</span>
                    <span className="font-bold text-primary">
                      {selectedGroupName || t('tutor_homework.group_not_selected')}
                    </span>
                    {currentGroup && (
                      <span className="text-xs font-normal text-muted-foreground">
                        {t('tutor_homework.group_students_count', { count: groupStudents.length })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Horizontal Group Selector Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
                  {groups.map((g) => {
                    const isSelected = g.name === selectedGroupName
                    return (
                      <button
                        key={g.name}
                        type="button"
                        onClick={() => setSelectedGroupName(g.name)}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border'
                        }`}
                      >
                        <Users className="h-3.5 w-3.5" />
                        <span>{g.name}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                            isSelected
                              ? 'bg-primary-foreground/20 text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {g.studentCount}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sub-mode switch inside group: Домашка для группы vs По отдельности каждому */}
          {currentGroup && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="inline-flex items-center p-1 bg-muted/60 rounded-lg border border-border/60">
                <button
                  type="button"
                  onClick={() => setGroupSubView('group_overview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    groupSubView === 'group_overview'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <FolderKanban className="h-3.5 w-3.5" />
                  <span>{t('tutor_homework.subview_group_overview')}</span>
                  <span className="ml-1 text-[10px] opacity-70">
                    ({groupAssignments.length})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setGroupSubView('per_student')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    groupSubView === 'per_student'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>{t('tutor_homework.subview_per_student')}</span>
                  <span className="ml-1 text-[10px] opacity-70">
                    ({groupStudents.length})
                  </span>
                </button>
              </div>

              {groupSubView === 'group_overview' && (
                <p className="text-xs text-muted-foreground">
                  {t('tutor_homework.group_overview_hint')}
                </p>
              )}
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* SUB-TAB 1: ДОМАШКА ДЛЯ ГРУППЫ (ОБЩАЯ)                   */}
          {/* -------------------------------------------------------- */}
          {currentGroup && groupSubView === 'group_overview' && (
            <div className="space-y-4">
              {/* Group Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="border-border">
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground font-medium">{t('tutor_homework.stat_group_assignments')}</p>
                    <p className="text-xl font-bold mt-0.5 text-foreground">
                      {groupStats.totalAssignments}
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className={`border-border ${
                    groupStats.submitted > 0
                      ? 'border-amber-300 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-900'
                      : ''
                  }`}
                >
                  <CardContent className="p-3 text-center">
                    <p
                      className={`text-xs font-medium ${
                        groupStats.submitted > 0
                          ? 'text-amber-700 dark:text-amber-300 font-semibold'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {t('tutor_homework.stat_submitted')}
                    </p>
                    <p
                      className={`text-xl font-bold mt-0.5 ${
                        groupStats.submitted > 0
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-foreground'
                      }`}
                    >
                      {groupStats.submitted}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground font-medium">{t('tutor_homework.stat_assigned')}</p>
                    <p className="text-xl font-bold mt-0.5 text-foreground">
                      {groupStats.assigned}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground font-medium">{t('tutor_homework.stat_reviewed')}</p>
                    <p className="text-xl font-bold mt-0.5 text-emerald-600 dark:text-emerald-400">
                      {groupStats.reviewed}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Group Assignments Cards */}
              {isLoadingGroupHw ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl" />
                  ))}
                </div>
              ) : isErrorGroupHw ? (
                <Card className="border-destructive/30 bg-destructive/5">
                  <CardContent className="h-48 flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                    <p className="font-semibold text-sm">{t('tutor_homework.err_load_group_hw')}</p>
                    <Button variant="outline" size="sm" onClick={() => refetchGroupHw()}>
                      {t('tutor_homework.btn_retry')}
                    </Button>
                  </CardContent>
                </Card>
              ) : groupAssignments.length > 0 ? (
                <div className="space-y-4">
                  {groupAssignments.map((ga) => {
                    const isExpanded = !!expandedAssignments[ga.key]
                    const { text: deadlineText, isPast } = formatDeadline(ga.deadline, dateLocale, t('tutor_homework.deadline_none'))
                    const submittedTotal = ga.submittedCount + ga.reviewedCount

                    return (
                      <Card key={ga.key} className="border-border overflow-hidden">
                        <CardContent className="p-4 sm:p-5 space-y-3">
                          {/* Assignment Header Row */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                                  <Users className="h-3 w-3" />
                                  <span>{t('tutor_homework.badge_for_entire_group')}</span>
                                </span>

                                {isPast && (
                                  <span className="text-[10px] font-semibold text-destructive">
                                    {t('tutor_homework.deadline_passed')}
                                  </span>
                                )}

                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {t('tutor_homework.deadline_due', { date: deadlineText })}
                                </span>
                              </div>

                              <h3 className="text-base font-semibold text-foreground tracking-tight">
                                {ga.title}
                              </h3>

                              {ga.description && (
                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                  {ga.description}
                                </p>
                              )}
                            </div>

                            {/* Summary Badges and Expand Toggle */}
                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleAssignmentExpand(ga.key)}
                                className="text-xs h-8 gap-1.5"
                              >
                                <span>{t('tutor_homework.btn_students_turned_in', { submitted: submittedTotal, total: ga.totalCount })}</span>
                                {isExpanded ? (
                                  <ChevronUp className="h-3.5 w-3.5" />
                                ) : (
                                  <ChevronDown className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground font-medium">
                                {t('tutor_homework.progress_turned_in', { submitted: submittedTotal, total: ga.totalCount })}
                              </span>
                              <div className="flex items-center gap-2 text-[11px]">
                                {ga.reviewedCount > 0 && (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                    {t('tutor_homework.stat_reviewed_count', { count: ga.reviewedCount })}
                                  </span>
                                )}
                                {ga.submittedCount > 0 && (
                                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                                    {t('tutor_homework.stat_submitted_count', { count: ga.submittedCount })}
                                  </span>
                                )}
                                {ga.assignedCount > 0 && (
                                  <span className="text-blue-600 dark:text-blue-400">
                                    {t('tutor_homework.stat_assigned_count', { count: ga.assignedCount })}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden flex">
                              <div
                                style={{
                                  width: `${(ga.reviewedCount / ga.totalCount) * 100}%`,
                                }}
                                className="bg-emerald-500 h-full transition-all"
                                title={t('tutor_homework.stat_reviewed')}
                              />
                              <div
                                style={{
                                  width: `${(ga.submittedCount / ga.totalCount) * 100}%`,
                                }}
                                className="bg-amber-500 h-full transition-all"
                                title={t('tutor_homework.stat_submitted')}
                              />
                              <div
                                style={{
                                  width: `${(ga.assignedCount / ga.totalCount) * 100}%`,
                                }}
                                className="bg-blue-400 h-full transition-all"
                                title={t('tutor_homework.stat_assigned')}
                              />
                            </div>
                          </div>

                          {/* Expanded list of each student's status */}
                          {isExpanded && (
                            <div className="pt-3 border-t border-border/80 space-y-2">
                              <p className="text-xs font-semibold text-foreground">
                                {t('tutor_homework.group_submissions_title')}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {ga.submissions.map((sub) => {
                                  const statusInfo = statusBadgeConfig[sub.status] || {
                                    label: sub.status,
                                    badgeClass: 'bg-muted text-muted-foreground',
                                    icon: Clock,
                                  }
                                  const sName = sub.studentName || t('tutor_students.default_student_name')
                                  const isSubSubmitted = sub.status === 'SUBMITTED'

                                  return (
                                    <div
                                      key={sub.id}
                                      onClick={() => handleCardClick(sub)}
                                      className="flex items-center justify-between p-2.5 rounded-lg border border-border/80 bg-background/80 hover:bg-muted/40 transition-colors cursor-pointer text-xs"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <Avatar size="sm" className="size-5 shrink-0">
                                          <AvatarFallback className="text-[10px]">
                                            {sName.charAt(0).toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                          <p className="font-medium text-foreground truncate">
                                            {sName}
                                          </p>
                                          {sub.studentNotes && (
                                            <p className="text-[10px] text-primary truncate">
                                              {t('tutor_homework.has_comment')}
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0">
                                        <span
                                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusInfo.badgeClass}`}
                                        >
                                          <statusInfo.icon className="h-2.5 w-2.5" />
                                          <span>{statusInfo.label}</span>
                                        </span>

                                        {isSubSubmitted && (
                                          <Button
                                            size="sm"
                                            onClick={(e) => handleQuickReview(e, sub)}
                                            disabled={updateStatusMutation.isPending}
                                            className="h-6 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white"
                                          >
                                            {t('tutor_homework.btn_reviewed_quick')}
                                          </Button>
                                        )}

                                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-50" />
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
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
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-base">{t('tutor_homework.empty_group_hw_title')}</p>
                      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                        {t('tutor_homework.empty_group_hw_desc', { name: selectedGroupName })}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setCreateMode('group')
                        setIsCreateOpen(true)
                      }}
                    >
                      <BookPlus className="mr-2 h-4 w-4" />
                      {t('tutor_homework.btn_assign_group_first')}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* SUB-TAB 2: ПО ОТДЕЛЬНОСТИ КАЖДОМУ В ГРУППЕ              */}
          {/* -------------------------------------------------------- */}
          {currentGroup && groupSubView === 'per_student' && (
            <div className="space-y-6">
              {/* Student Selector Card inside group */}
              <Card className="border-border">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <UserCheck className="h-4 w-4 text-primary" />
                      <span>{t('tutor_homework.label_group_student', { group: selectedGroupName })}</span>
                      <span className="font-bold text-primary">
                        {selectedGroupStudentName}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal student pills for this group */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
                    {groupStudents.map((s) => {
                      const name =
                        s.name ||
                        [s.firstName, s.lastName].filter(Boolean).join(' ') ||
                        t('tutor_students.default_student_name')
                      const isSelected = s.id === selectedGroupStudentId
                      const initial = name.charAt(0).toUpperCase()

                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedGroupStudentId(s.id)}
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
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Stats for this group student */}
              {selectedGroupStudent && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Card className="border-border">
                    <CardContent className="p-3 text-center">
                      <p className="text-xs text-muted-foreground font-medium">{t('tutor_homework.stat_total')}</p>
                      <p className="text-xl font-bold mt-0.5 text-foreground">
                        {groupStudentStats.total}
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className={`border-border ${
                      groupStudentStats.submitted > 0
                        ? 'border-amber-300 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-900'
                        : ''
                    }`}
                  >
                    <CardContent className="p-3 text-center">
                      <p
                        className={`text-xs font-medium ${
                          groupStudentStats.submitted > 0
                            ? 'text-amber-700 dark:text-amber-300 font-semibold'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {t('tutor_homework.stat_submitted')}
                      </p>
                      <p
                        className={`text-xl font-bold mt-0.5 ${
                          groupStudentStats.submitted > 0
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-foreground'
                        }`}
                      >
                        {groupStudentStats.submitted}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardContent className="p-3 text-center">
                      <p className="text-xs text-muted-foreground font-medium">{t('tutor_homework.stat_assigned')}</p>
                      <p className="text-xl font-bold mt-0.5 text-foreground">
                        {groupStudentStats.assigned}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardContent className="p-3 text-center">
                      <p className="text-xs text-muted-foreground font-medium">{t('tutor_homework.stat_reviewed')}</p>
                      <p className="text-xl font-bold mt-0.5 text-emerald-600 dark:text-emerald-400">
                        {groupStudentStats.reviewed}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Homework cards for this group student */}
              {isLoadingGroupStudentHw ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-xl" />
                  ))}
                </div>
              ) : isErrorGroupStudentHw ? (
                <Card className="border-destructive/30 bg-destructive/5">
                  <CardContent className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <AlertCircle className="h-10 w-10 text-destructive" />
                    <p className="font-semibold text-base text-foreground">
                      {t('tutor_homework.err_load_group_student_hw')}
                    </p>
                    <Button variant="outline" size="sm" onClick={() => refetchGroupStudentHw()}>
                      {t('tutor_homework.btn_retry')}
                    </Button>
                  </CardContent>
                </Card>
              ) : groupStudentHwList.length > 0 ? (
                <div className="space-y-3">
                  {groupStudentHwList.map((hw) => {
                    const statusInfo = statusBadgeConfig[hw.status] || {
                      label: hw.status,
                      badgeClass: 'bg-muted text-muted-foreground',
                      icon: Clock,
                    }
                    const { text: deadlineText, isPast } = formatDeadline(hw.deadline, dateLocale, t('tutor_homework.deadline_none'))
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
                                  {t('tutor_homework.deadline_overdue')}
                                </span>
                              )}

                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {t('tutor_homework.deadline_prefix', { date: deadlineText })}
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

                            <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground">
                              {hw.studentNotes && (
                                <span className="flex items-center gap-1 text-primary font-medium">
                                  <MessageSquare className="h-3 w-3" />
                                  {t('tutor_homework.has_student_notes')}
                                </span>
                              )}
                              {hw.attachments && hw.attachments.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Paperclip className="h-3 w-3" />
                                  {t('tutor_homework.attachments_count', { count: hw.attachments.length })}
                                </span>
                              )}
                            </div>
                          </div>

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
                                <span>{t('tutor_homework.btn_reviewed_quick')}</span>
                              </Button>
                            )}

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => handleDeleteClick(e, hw)}
                              title={t('tutor_homework.tooltip_delete')}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>

                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-60" />
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <Card className="border-border">
                  <CardContent className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <BookCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-base">{t('tutor_homework.empty_per_student_hw_title')}</p>
                      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                        {t('tutor_homework.empty_per_student_hw_desc', { name: selectedGroupStudentName })}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setCreateMode('student')
                        setIsCreateOpen(true)
                      }}
                    >
                      <BookPlus className="mr-2 h-4 w-4" />
                      {t('tutor_homework.btn_assign_personal')}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Dialog (Supports both single student and whole group) */}
      <CreateHomeworkDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        mode={createMode}
        studentId={
          activeMainTab === 'individual'
            ? selectedIndividualId
            : selectedGroupStudentId
        }
        studentName={
          activeMainTab === 'individual'
            ? selectedIndividualName
            : selectedGroupStudentName
        }
        groupName={selectedGroupName}
        onSuccess={() => {
          if (activeMainTab === 'individual') {
            refetchIndividualHw()
          } else {
            refetchGroupHw()
            refetchGroupStudentHw()
          }
        }}
      />

      {/* Details Sheet with attachments and review button */}
      <HomeworkDetailsSheet
        homeworkId={selectedHomework?.id || null}
        initialHomework={selectedHomework}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onDelete={(hw) => {
          setDeleteCandidate(hw)
          setIsDeleteOpen(true)
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteHomeworkConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        homework={deleteCandidate}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
