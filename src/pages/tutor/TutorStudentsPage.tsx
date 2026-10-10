import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useStudents, useStudentGroups } from '@/hooks/useStudents'
import { StudentFormDialog } from './students/StudentFormDialog'
import { StudentDetailsSheet } from './students/StudentDetailsSheet'
import { ArchiveConfirmDialog } from './students/ArchiveConfirmDialog'
import { MoveStudentGroupDialog } from './students/MoveStudentGroupDialog'
import { GroupDetailsModal } from './groups/GroupDetailsModal'
import { CreateGroupDialog } from './groups/CreateGroupDialog'
import { AddStudentToGroupModal } from './groups/AddStudentToGroupModal'
import { LessonFormDialog } from './lessons/LessonFormDialog'
import {
  UserPlus,
  Search,
  Users,
  Send,
  Phone,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  ArrowRightLeft,
  UserCheck,
  Eye,
  Edit,
  Archive,
  Plus,
  ArrowRight,
  GraduationCap,
  Sparkles,
} from 'lucide-react'
import type { StudentGroup, StudentProfile } from '@/types'

export function TutorStudentsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as 'individual' | 'groups') || 'individual'

  const setActiveTab = (tab: 'individual' | 'groups') => {
    setSearchParams(tab === 'individual' ? {} : { tab })
    setSearch('')
    setPage(0)
  }

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const pageSize = 15

  // Dialog & Sheet states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null)
  const [formDefaultGroup, setFormDefaultGroup] = useState<string | undefined>(undefined)

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const [archiveCandidate, setArchiveCandidate] = useState<StudentProfile | null>(null)
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false)

  const [moveCandidate, setMoveCandidate] = useState<StudentProfile | null>(null)
  const [isMoveGroupOpen, setIsMoveGroupOpen] = useState(false)

  // Groups modal & dialogs
  const [activeGroup, setActiveGroup] = useState<StudentGroup | null>(null)
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)

  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [targetGroupNameForAdd, setTargetGroupNameForAdd] = useState<string | null>(null)
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)

  const [isLessonFormOpen, setIsLessonFormOpen] = useState(false)

  // Queries
  const {
    data: individualData,
    isLoading: isIndividualLoading,
    isError: isIndividualError,
    refetch: refetchStudents,
  } = useStudents({
    page,
    size: pageSize,
    search: search.trim() || undefined,
    format: 'INDIVIDUAL',
  })

  const { data: allStudentsData } = useStudents({ size: 100 })
  const allStudents = allStudentsData?.content || []

  const {
    data: groups = [],
    isLoading: isGroupsLoading,
    isError: isGroupsError,
    refetch: refetchGroups,
  } = useStudentGroups()

  const existingGroupNames = useMemo(() => groups.map((g) => g.name), [groups])

  // Individual students (for group creation multi-select)
  const allIndividualStudents = useMemo(
    () => allStudents.filter((s) => !s.groupName || !s.groupName.trim()),
    [allStudents],
  )

  const individualStudents = individualData?.content || []
  const totalPages = individualData?.totalPages || 0
  const totalElements = individualData?.totalElements || 0

  // Filter groups
  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return groups
    return groups.filter((g) => {
      const matchName = g.name.toLowerCase().includes(q)
      const matchStudents = g.students.some((s) => {
        const fullName = [s.firstName, s.lastName, s.name].filter(Boolean).join(' ').toLowerCase()
        return fullName.includes(q)
      })
      return matchName || matchStudents
    })
  }, [groups, search])

  const totalGroupStudents = useMemo(
    () => groups.reduce((acc, g) => acc + (g.students?.length || 0), 0),
    [groups],
  )

  // Handlers
  const handleOpenCreateStudent = () => {
    setEditingStudent(null)
    setFormDefaultGroup(undefined)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (student: StudentProfile) => {
    setEditingStudent(student)
    setFormDefaultGroup(student.groupName || undefined)
    setIsFormOpen(true)
  }

  const handleOpenArchive = (student: StudentProfile) => {
    setArchiveCandidate(student)
    setIsArchiveConfirmOpen(true)
  }

  const handleOpenMoveGroup = (student: StudentProfile) => {
    setMoveCandidate(student)
    setIsMoveGroupOpen(true)
  }

  const handleRowClick = (student: StudentProfile) => {
    setSelectedStudentId(student.id)
    setIsDetailsOpen(true)
  }

  const handleArchiveSuccess = () => {
    setIsDetailsOpen(false)
  }

  const handleOpenGroupDetails = (group: StudentGroup) => {
    setActiveGroup(group)
    setIsGroupModalOpen(true)
  }

  const handleOpenAddStudentToGroup = (groupName: string) => {
    setTargetGroupNameForAdd(groupName)
    setIsAddStudentOpen(true)
  }

  const handleCreateNewStudentInGroup = (groupName: string) => {
    setEditingStudent(null)
    setFormDefaultGroup(groupName)
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ученики</h1>
          <p className="text-muted-foreground text-sm">
            Управление индивидуальными учениками и учебными группами
          </p>
        </div>

        {activeTab === 'individual' ? (
          <Button onClick={handleOpenCreateStudent} className="self-start sm:self-auto gap-2">
            <UserPlus className="h-4 w-4" />
            <span>Добавить ученика</span>
          </Button>
        ) : (
          <Button onClick={() => setIsCreateGroupOpen(true)} className="self-start sm:self-auto gap-2">
            <Plus className="h-4 w-4" />
            <span>Создать группу</span>
          </Button>
        )}
      </div>

      {/* Tabs Switcher: Индивидуальные vs Группы */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <Button
          variant={activeTab === 'individual' ? 'default' : 'outline'}
          size="sm"
          className="h-8 text-xs font-medium flex items-center gap-1.5 shadow-xs"
          onClick={() => setActiveTab('individual')}
        >
          <UserCheck className="h-3.5 w-3.5" />
          <span>Индивидуальные ({allIndividualStudents.length})</span>
        </Button>

        <Button
          variant={activeTab === 'groups' ? 'default' : 'outline'}
          size="sm"
          className="h-8 text-xs font-medium flex items-center gap-1.5 shadow-xs"
          onClick={() => setActiveTab('groups')}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Группы ({groups.length})</span>
        </Button>
      </div>

      {/* ==================== TAB 1: INDIVIDUAL STUDENTS ==================== */}
      {activeTab === 'individual' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск индивидуального ученика..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(0)
                }}
                className="pl-9 pr-8"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch('')
                    setPage(0)
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Students Table */}
          <Card className="border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[260px]">Ученик</TableHead>
                  <TableHead>Телефон / Telegram</TableHead>
                  <TableHead>Уровень</TableHead>
                  <TableHead>Баланс</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isIndividualLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="space-y-1.5">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-5 w-20 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : isIndividualError ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                          <AlertCircle className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-base text-foreground">
                            Ошибка загрузки списка учеников
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            Не удалось получить данные с сервера. Проверьте соединение.
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => refetchStudents()}>
                          Повторить попытку
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : individualStudents.length > 0 ? (
                  individualStudents.map((student) => {
                    const fullName =
                      student.name ||
                      [student.firstName, student.lastName].filter(Boolean).join(' ') ||
                      'Без имени'
                    const initial = fullName.charAt(0).toUpperCase() || 'У'
                    const balance = student.lessonBalance ?? student.balance ?? 0

                    return (
                      <TableRow
                        key={student.id}
                        onClick={() => handleRowClick(student)}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        {/* Name & Rate */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar size="default">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                {initial}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground leading-snug">
                                {fullName}
                              </p>
                              {student.hourlyRate ? (
                                <p className="text-xs text-muted-foreground">
                                  {student.hourlyRate.toLocaleString('ru-RU')}/час
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </TableCell>

                        {/* Phone / Telegram */}
                        <TableCell>
                          <div className="space-y-0.5 text-xs">
                            {student.phone && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <span>{student.phone}</span>
                              </div>
                            )}
                            {student.telegram && (
                              <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                                <Send className="h-3 w-3" />
                                <span>{student.telegram}</span>
                              </div>
                            )}
                            {!student.phone && !student.telegram && (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>

                        {/* Level */}
                        <TableCell>
                          <span className="text-sm font-medium">
                            {student.currentLevel || '—'}
                          </span>
                        </TableCell>

                        {/* Balance */}
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tabular-nums border ${
                              balance < 0
                                ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
                                : balance === 0
                                  ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20'
                            }`}
                          >
                            {balance < 0 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-red-accent mr-1 inline-block" />
                            )}
                            {balance} ур.
                          </span>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge
                            variant={
                              student.status === 'ACTIVE'
                                ? 'default'
                                : student.status === 'ARCHIVED'
                                  ? 'secondary'
                                  : 'outline'
                            }
                            className="text-xs"
                          >
                            {student.status === 'ACTIVE'
                              ? 'Активен'
                              : student.status === 'ARCHIVED'
                                ? 'В архиве'
                                : student.status || 'Активен'}
                          </Badge>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              title="Подробнее"
                              onClick={() => handleRowClick(student)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-primary"
                              title="Редактировать"
                              onClick={() => handleOpenEdit(student)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-muted"
                              title="Перенести в группу"
                              onClick={() => handleOpenMoveGroup(student)}
                            >
                              <ArrowRightLeft className="h-3.5 w-3.5" />
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              title="Архивировать"
                              onClick={() => handleOpenArchive(student)}
                            >
                              <Archive className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                          <UserCheck className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-base">
                            {search ? 'Ничего не найдено' : 'Индивидуальные ученики не найдены'}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {search
                              ? `По запросу "${search}" ничего не найдено`
                              : 'Добавьте первого ученика на индивидуальное обучение'}
                          </p>
                        </div>
                        {search ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearch('')
                              setPage(0)
                            }}
                          >
                            Сбросить поиск
                          </Button>
                        ) : (
                          <Button size="sm" onClick={handleOpenCreateStudent}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Добавить ученика
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted-foreground">
                <div>
                  Всего: <strong className="text-foreground">{totalElements}</strong> учеников
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0 || isIndividualLoading}
                    className="h-8 gap-1 px-2.5"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Назад</span>
                  </Button>

                  <span className="px-2 font-medium">
                    {page + 1} / {Math.max(1, totalPages)}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page + 1 >= totalPages || isIndividualLoading}
                    className="h-8 gap-1 px-2.5"
                  >
                    <span>Вперед</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ==================== TAB 2: GROUPS ==================== */}
      {activeTab === 'groups' && (
        <div className="space-y-6">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-4 w-4 text-primary" />
                <span>Всего групп</span>
              </div>
              <div className="text-2xl font-bold mt-1 text-foreground">{groups.length}</div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <GraduationCap className="h-4 w-4 text-emerald-600" />
                <span>Учеников в группах</span>
              </div>
              <div className="text-2xl font-bold mt-1 text-foreground">{totalGroupStudents}</div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Средний размер группы</span>
              </div>
              <div className="text-2xl font-bold mt-1 text-foreground">
                {groups.length > 0 ? (totalGroupStudents / groups.length).toFixed(1) : 0} уч.
              </div>
            </div>
          </div>

          {/* Search groups */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию группы или ученику..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-8"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Groups Grid */}
          {isGroupsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="p-5 rounded-xl border border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex -space-x-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
              ))}
            </div>
          ) : isGroupsError ? (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-border bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base">Ошибка при загрузке групп</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Не удалось получить список групп с сервера.
              </p>
              <Button variant="outline" size="sm" onClick={() => refetchGroups()}>
                Повторить попытку
              </Button>
            </div>
          ) : filteredGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGroups.map((group) => {
                const count = group.students?.length || 0
                const previewStudents = (group.students || []).slice(0, 4)
                const remainingCount = count - previewStudents.length

                return (
                  <Card
                    key={group.name}
                    className="group relative flex flex-col justify-between border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer bg-card overflow-hidden"
                    onClick={() => handleOpenGroupDetails(group)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <Users className="h-4 w-4" />
                          </div>
                          <div>
                            <CardTitle className="text-base font-bold text-foreground tracking-tight">
                              {group.name}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {count} {count === 1 ? 'ученик' : 'учеников'}
                            </p>
                          </div>
                        </div>

                        <Badge
                          variant="secondary"
                          className="bg-primary/5 text-primary border-primary/20 text-xs font-semibold"
                        >
                          {count} уч.
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="py-2 flex-1">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Состав группы:</span>
                          <span className="text-[11px] font-medium text-primary hover:underline">
                            Открыть окно
                          </span>
                        </div>

                        {count > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2 overflow-hidden py-1">
                              {previewStudents.map((st) => {
                                const name = st.firstName || st.name || 'У'
                                return (
                                  <Avatar
                                    key={st.id}
                                    className="inline-block ring-2 ring-background h-8 w-8"
                                  >
                                    <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-semibold">
                                      {name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                )
                              })}
                            </div>

                            {remainingCount > 0 && (
                              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                +{remainingCount}
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic py-1">
                            В группе пока нет учеников
                          </p>
                        )}

                        {count > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {previewStudents.map((st) => (
                              <span
                                key={st.id}
                                className="inline-block px-1.5 py-0.5 rounded text-[11px] bg-muted/60 text-muted-foreground font-medium truncate max-w-[120px]"
                              >
                                {st.firstName || st.name || 'Ученик'}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-3 border-t border-border flex items-center justify-between gap-2 bg-muted/10">
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        className="w-full text-xs font-semibold gap-1.5 h-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenGroupDetails(group)
                        }}
                      >
                        <span>Открыть состав группы</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base">
                {search ? 'Ничего не найдено' : 'Группы еще не созданы'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mt-1 mb-4">
                {search
                  ? `По запросу "${search}" групп не обнаружено.`
                  : 'Создайте первую группу, объединяйте учеников и проводите совместные занятия.'}
              </p>
              {search ? (
                <Button variant="outline" size="sm" onClick={() => setSearch('')}>
                  Сбросить поиск
                </Button>
              ) : (
                <Button size="sm" onClick={() => setIsCreateGroupOpen(true)}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Создать первую группу
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================== DIALOGS & MODALS ==================== */}

      {/* 1. Group Details Modal: "Окно со студентами группы" */}
      <GroupDetailsModal
        group={activeGroup}
        open={isGroupModalOpen}
        onOpenChange={setIsGroupModalOpen}
        onAddStudent={(groupName) => handleOpenAddStudentToGroup(groupName)}
        onViewStudent={(st) => {
          setSelectedStudentId(st.id)
          setIsDetailsOpen(true)
        }}
        onEditStudent={handleOpenEdit}
        onMoveStudent={handleOpenMoveGroup}
        onScheduleLesson={() => setIsLessonFormOpen(true)}
      />

      {/* 2. Create Group Dialog */}
      <CreateGroupDialog
        open={isCreateGroupOpen}
        onOpenChange={setIsCreateGroupOpen}
        individualStudents={allIndividualStudents}
        onSuccess={(groupName) => {
          const created = groups.find((g) => g.name === groupName)
          if (created) {
            setActiveGroup(created)
            setIsGroupModalOpen(true)
          }
        }}
      />

      {/* 3. Add Student to Group Modal */}
      <AddStudentToGroupModal
        groupName={targetGroupNameForAdd || ''}
        open={isAddStudentOpen}
        onOpenChange={setIsAddStudentOpen}
        availableStudents={allStudents}
        onCreateNewStudent={handleCreateNewStudentInGroup}
        onSuccess={() => {
          if (activeGroup) {
            const updated = groups.find((g) => g.name === activeGroup.name)
            if (updated) setActiveGroup(updated)
          }
        }}
      />

      {/* 4. Student Details Sheet */}
      <StudentDetailsSheet
        studentId={selectedStudentId}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onEdit={handleOpenEdit}
        onArchive={handleOpenArchive}
        onMoveGroup={handleOpenMoveGroup}
      />

      {/* 5. Student Create / Edit Dialog */}
      <StudentFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={editingStudent}
        defaultFormat={formDefaultGroup ? 'GROUP' : 'INDIVIDUAL'}
        defaultGroupName={formDefaultGroup}
      />

      {/* 6. Move Student Group Dialog */}
      <MoveStudentGroupDialog
        student={moveCandidate}
        open={isMoveGroupOpen}
        onOpenChange={setIsMoveGroupOpen}
        existingGroups={existingGroupNames}
        onSuccess={() => {
          if (activeGroup) {
            const updated = groups.find((g) => g.name === activeGroup.name)
            if (updated) setActiveGroup(updated)
          }
        }}
      />

      {/* 7. Archive Confirm Dialog */}
      <ArchiveConfirmDialog
        open={isArchiveConfirmOpen}
        onOpenChange={setIsArchiveConfirmOpen}
        student={archiveCandidate}
        onSuccess={handleArchiveSuccess}
      />

      {/* 8. Lesson Form Dialog */}
      <LessonFormDialog
        open={isLessonFormOpen}
        onOpenChange={setIsLessonFormOpen}
      />
    </div>
  )
}
