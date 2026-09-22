import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { useStudents } from '@/hooks/useStudents'
import { StudentFormDialog } from './students/StudentFormDialog'
import { StudentDetailsSheet } from './students/StudentDetailsSheet'
import { ArchiveConfirmDialog } from './students/ArchiveConfirmDialog'
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
} from 'lucide-react'
import type { StudentProfile } from '@/types'

export function TutorStudentsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const pageSize = 10

  // Dialog & Sheet states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null)

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const [archiveCandidate, setArchiveCandidate] = useState<StudentProfile | null>(null)
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false)

  const { data, isLoading, isError, refetch } = useStudents({
    page,
    size: pageSize,
    search: search.trim() || undefined,
  })

  const students = data?.content || []
  const totalPages = data?.totalPages || 0
  const totalElements = data?.totalElements || 0

  const handleRowClick = (student: StudentProfile) => {
    setSelectedStudentId(student.id)
    setIsDetailsOpen(true)
  }

  const handleOpenCreate = () => {
    setEditingStudent(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (student: StudentProfile) => {
    setEditingStudent(student)
    setIsFormOpen(true)
  }

  const handleOpenArchive = (student: StudentProfile) => {
    setArchiveCandidate(student)
    setIsArchiveConfirmOpen(true)
  }

  const handleArchiveSuccess = () => {
    setIsDetailsOpen(false)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(0)
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ученики</h1>
          <p className="text-muted-foreground text-sm">
            База учеников, расписание занятий, баланс и приглашения
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="self-start sm:self-auto gap-2">
          <UserPlus className="h-4 w-4" />
          <span>Добавить ученика</span>
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени ученика..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-8"
          />
          {search && (
            <button
              onClick={() => handleSearchChange('')}
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
              <TableHead className="w-[280px]">Имя</TableHead>
              <TableHead>Телефон / Telegram</TableHead>
              <TableHead>Уровень</TableHead>
              <TableHead>Баланс уроков</TableHead>
              <TableHead className="text-right">Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
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
                  <TableCell className="text-right">
                    <Skeleton className="h-5 w-16 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
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
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                      Повторить попытку
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : students.length > 0 ? (
              students.map((student) => {
                const fullName =
                  student.name ||
                  [student.firstName, student.lastName].filter(Boolean).join(' ') ||
                  'Без имени'
                const initial = fullName.charAt(0).toUpperCase() || 'У'
                const balance = student.balance ?? 0

                return (
                  <TableRow
                    key={student.id}
                    onClick={() => handleRowClick(student)}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                  >
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
                              {student.hourlyRate} ₽/час
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>

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

                    <TableCell>
                      <span className="text-sm font-medium">
                        {student.currentLevel || '—'}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          balance < 0
                            ? 'bg-destructive/10 text-destructive'
                            : balance === 0
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                        }`}
                      >
                        {balance} ур.
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
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
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-base">Ученики не найдены</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {search
                          ? `По запросу "${search}" ничего не найдено`
                          : 'Добавьте первого ученика, чтобы начать работу'}
                      </p>
                    </div>
                    {search ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSearchChange('')}
                      >
                        Сбросить поиск
                      </Button>
                    ) : (
                      <Button size="sm" onClick={handleOpenCreate}>
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

        {/* Pagination Bar */}
        {totalElements > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card/40 text-xs text-muted-foreground">
            <div>
              Показано{' '}
              <span className="font-medium text-foreground">
                {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalElements)}
              </span>{' '}
              из <span className="font-medium text-foreground">{totalElements}</span>{' '}
              учеников
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || isLoading}
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
                disabled={page + 1 >= totalPages || isLoading}
                className="h-8 gap-1 px-2.5"
              >
                <span>Вперед</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create / Edit Dialog */}
      <StudentFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={editingStudent}
      />

      {/* Details Sheet */}
      <StudentDetailsSheet
        studentId={selectedStudentId}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onEdit={handleOpenEdit}
        onArchive={handleOpenArchive}
      />

      {/* Archive Confirm Dialog */}
      <ArchiveConfirmDialog
        open={isArchiveConfirmOpen}
        onOpenChange={setIsArchiveConfirmOpen}
        student={archiveCandidate}
        onSuccess={handleArchiveSuccess}
      />
    </div>
  )
}
