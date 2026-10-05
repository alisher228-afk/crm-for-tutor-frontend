import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useStudentGroups, useStudents } from '@/hooks/useStudents'
import { GroupDetailsModal } from './groups/GroupDetailsModal'
import { CreateGroupDialog } from './groups/CreateGroupDialog'
import { AddStudentToGroupModal } from './groups/AddStudentToGroupModal'
import { StudentDetailsSheet } from './students/StudentDetailsSheet'
import { StudentFormDialog } from './students/StudentFormDialog'
import { MoveStudentGroupDialog } from './students/MoveStudentGroupDialog'
import { ArchiveConfirmDialog } from './students/ArchiveConfirmDialog'
import { LessonFormDialog } from './lessons/LessonFormDialog'
import {
  Users,
  UserCheck,
  Search,
  Plus,
  X,
  AlertCircle,
  GraduationCap,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import type { StudentGroup, StudentProfile } from '@/types'


export function TutorGroupsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  // Selected group for details modal ("Окно со студентами")
  const [activeGroup, setActiveGroup] = useState<StudentGroup | null>(null)
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)

  // Create Group dialog
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)

  // Add Student to active group dialog
  const [targetGroupNameForAdd, setTargetGroupNameForAdd] = useState<string | null>(null)
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)

  // Student Inspect & Edit states
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null)
  const [formDefaultGroup, setFormDefaultGroup] = useState<string | undefined>(undefined)
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false)

  const [moveCandidate, setMoveCandidate] = useState<StudentProfile | null>(null)
  const [isMoveGroupOpen, setIsMoveGroupOpen] = useState(false)

  const [archiveCandidate, setArchiveCandidate] = useState<StudentProfile | null>(null)
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false)

  // Lesson schedule for group
  const [isLessonFormOpen, setIsLessonFormOpen] = useState(false)

  // Queries
  const { data: groups = [], isLoading, isError, refetch } = useStudentGroups()
  const { data: allStudentsData } = useStudents({ size: 100 })
  const allStudents = allStudentsData?.content || []

  // Individual students (not yet assigned to any group)
  const individualStudents = useMemo(
    () => allStudents.filter((s) => !s.groupName || !s.groupName.trim()),
    [allStudents],
  )

  // Existing group names for move dialog
  const existingGroupNames = useMemo(() => groups.map((g) => g.name), [groups])

  // Filter groups by search
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

  // Stats
  const totalGroupStudents = useMemo(
    () => groups.reduce((acc, g) => acc + (g.students?.length || 0), 0),
    [groups],
  )

  // Handlers
  const handleOpenGroupDetails = (group: StudentGroup) => {
    setActiveGroup(group)
    setIsGroupModalOpen(true)
  }

  const handleOpenAddStudent = (groupName: string) => {
    setTargetGroupNameForAdd(groupName)
    setIsAddStudentOpen(true)
  }

  const handleCreateNewStudentInGroup = (groupName: string) => {
    setEditingStudent(null)
    setFormDefaultGroup(groupName)
    setIsStudentFormOpen(true)
  }

  const handleViewStudent = (student: StudentProfile) => {
    setSelectedStudentId(student.id)
    setIsDetailsOpen(true)
  }

  const handleEditStudent = (student: StudentProfile) => {
    setEditingStudent(student)
    setFormDefaultGroup(student.groupName || undefined)
    setIsStudentFormOpen(true)
  }

  const handleMoveStudent = (student: StudentProfile) => {
    setMoveCandidate(student)
    setIsMoveGroupOpen(true)
  }

  const handleOpenArchive = (student: StudentProfile) => {
    setArchiveCandidate(student)
    setIsArchiveConfirmOpen(true)
  }

  const handleArchiveSuccess = () => {
    setIsDetailsOpen(false)
  }

  const handleScheduleLessonForGroup = (_groupName: string) => {
    setIsLessonFormOpen(true)
  }


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Группы</h1>
          <p className="text-muted-foreground text-sm">
            Групповые занятия, составы учебных групп и совместное обучение
          </p>
        </div>

        <Button onClick={() => setIsCreateGroupOpen(true)} className="self-start sm:self-auto gap-2">
          <Plus className="h-4 w-4" />
          <span>Создать группу</span>
        </Button>
      </div>

      {/* Navigation Switcher Tabs (Individual vs Groups) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs font-medium flex items-center gap-1.5"
          onClick={() => navigate('/tutor/students')}
        >
          <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Индивидуальные ({individualStudents.length})</span>
        </Button>

        <Button
          variant="default"
          size="sm"
          className="h-8 text-xs font-medium flex items-center gap-1.5 shadow-xs"
        >
          <Users className="h-3.5 w-3.5" />
          <span>Группы ({groups.length})</span>
        </Button>
      </div>

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

      {/* Search Bar */}
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
      {isLoading ? (
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
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-border bg-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-base">Ошибка при загрузке групп</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Не удалось получить список групп с сервера.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
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
                  {/* Avatars and preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Состав группы:</span>
                      <span className="text-[11px] font-medium text-primary hover:underline">
                        Подробнее
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

                    {/* Student names tags preview */}
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
              ? `По запросу "${search}" групп не обнаружено. Попробуйте другой запрос.`
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

      {/* 1. Group Details Modal: "Окно со студентами группы" */}
      <GroupDetailsModal
        group={activeGroup}
        open={isGroupModalOpen}
        onOpenChange={setIsGroupModalOpen}
        onAddStudent={(groupName) => handleOpenAddStudent(groupName)}
        onViewStudent={handleViewStudent}
        onEditStudent={handleEditStudent}
        onMoveStudent={handleMoveStudent}
        onScheduleLesson={handleScheduleLessonForGroup}
      />

      {/* 2. Create Group Dialog */}
      <CreateGroupDialog
        open={isCreateGroupOpen}
        onOpenChange={setIsCreateGroupOpen}
        individualStudents={individualStudents}
        onSuccess={(groupName) => {
          // Open details for newly created group if desired
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
          // Re-sync active group if open
          if (activeGroup) {
            const updated = groups.find((g) => g.name === activeGroup.name)
            if (updated) setActiveGroup(updated)
          }
        }}
      />

      {/* 4. Student Inspect Sheet */}
      <StudentDetailsSheet
        studentId={selectedStudentId}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onEdit={handleEditStudent}
        onArchive={handleOpenArchive}
        onMoveGroup={handleMoveStudent}
      />

      {/* 5. Student Create / Edit Dialog */}
      <StudentFormDialog
        open={isStudentFormOpen}
        onOpenChange={setIsStudentFormOpen}
        initialData={editingStudent}
        defaultFormat="GROUP"
        defaultGroupName={formDefaultGroup}
      />

      {/* 6. Move / Change Group Dialog */}
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
