import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useTranslation } from '@/i18n'
import {
  Users,
  UserPlus,
  Calendar,
  BookPlus,
  Phone,
  Send,
  ArrowRightLeft,
  Eye,
  Edit,
  BrainCircuit,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import type { StudentGroup, StudentProfile } from '@/types'

interface GroupDetailsModalProps {
  group: StudentGroup | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddStudent: (groupName: string) => void
  onViewStudent: (student: StudentProfile) => void
  onEditStudent: (student: StudentProfile) => void
  onMoveStudent: (student: StudentProfile) => void
  onScheduleLesson?: (groupName: string) => void
  onAssignHomework?: (groupName: string) => void
  onAssignTest?: (groupName: string) => void
}

export function GroupDetailsModal({
  group,
  open,
  onOpenChange,
  onAddStudent,
  onViewStudent,
  onEditStudent,
  onMoveStudent,
  onScheduleLesson,
  onAssignHomework,
  onAssignTest,
}: GroupDetailsModalProps) {
  const { t, language } = useTranslation()
  const numLocale = language === 'en' ? 'en-US' : language === 'kk' ? 'kk-KZ' : 'ru-RU'
  const navigate = useNavigate()
  const students = group?.students || []

  if (!group) return null

  const handleScheduleLesson = () => {
    onOpenChange(false)
    if (onScheduleLesson) {
      onScheduleLesson(group.name)
    } else {
      navigate('/tutor/lessons')
    }
  }

  const handleAssignHomework = () => {
    onOpenChange(false)
    if (onAssignHomework) {
      onAssignHomework(group.name)
    } else {
      navigate('/tutor/homework')
    }
  }

  const handleAssignTest = () => {
    onOpenChange(false)
    if (onAssignTest) {
      onAssignTest(group.name)
    } else {
      navigate(`/tutor/tests?create=true&targetType=GROUP&groupName=${encodeURIComponent(group.name)}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-6 overflow-hidden">
        {/* Header */}
        <DialogHeader className="pb-3 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-xl font-bold tracking-tight">
                    {group.name}
                  </DialogTitle>
                  <Badge variant="secondary" className="font-semibold text-xs">
                    {students.length} {students.length === 1 ? t('tutor_groups.student_1') : students.length < 5 ? t('tutor_groups.student_few') : t('tutor_groups.student_many')}
                  </Badge>
                </div>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {t('tutor_groups.modal_details_subtitle')}
                </DialogDescription>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs"
                onClick={handleScheduleLesson}
              >
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>{t('tutor_groups.action_lesson')}</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs"
                onClick={handleAssignHomework}
              >
                <BookPlus className="h-3.5 w-3.5 text-emerald-600" />
                <span>{t('tutor_groups.action_homework')}</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs"
                onClick={handleAssignTest}
              >
                <BrainCircuit className="h-3.5 w-3.5 text-purple-600" />
                <span>{t('tutor_groups.action_test')}</span>
              </Button>

              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => onAddStudent(group.name)}
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>{t('tutor_groups.action_add_to_group')}</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Students Table / List */}
        <div className="flex-1 overflow-y-auto py-2">
          {students.length > 0 ? (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[220px]">{t('tutor_students.th_student')}</TableHead>
                    <TableHead>{t('tutor_students.th_contacts')}</TableHead>
                    <TableHead>{t('tutor_students.th_level')}</TableHead>
                    <TableHead>{t('tutor_students.th_balance')}</TableHead>
                    <TableHead>{t('tutor_students.th_status')}</TableHead>
                    <TableHead className="text-right">{t('tutor_students.th_actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const fullName =
                      student.name ||
                      [student.firstName, student.lastName].filter(Boolean).join(' ') ||
                      t('tutor_students.no_name')
                    const initial = fullName.charAt(0).toUpperCase() || '?'
                    const balance = student.lessonBalance ?? student.balance ?? 0

                    return (
                      <TableRow
                        key={student.id}
                        className="hover:bg-muted/40 transition-colors"
                      >
                        {/* Student Name */}
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar size="sm">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                {initial}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium text-sm text-foreground truncate">
                                {fullName}
                              </p>
                              {student.hourlyRate ? (
                                <p className="text-xs text-muted-foreground">
                                  {t('tutor_students.per_hour', { rate: student.hourlyRate.toLocaleString(numLocale) })}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </TableCell>

                        {/* Contacts */}
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
                          <span className="text-xs font-medium">
                            {student.currentLevel || '—'}
                          </span>
                        </TableCell>

                        {/* Balance */}
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
                            {balance} {t('tutor_students.unit_lesson')}
                          </span>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge
                            variant={student.status === 'ACTIVE' ? 'default' : 'secondary'}
                            className="text-[11px] py-0"
                          >
                            {student.status === 'ACTIVE' ? t('tutor_students.status_active') : t('tutor_students.status_archived')}
                          </Badge>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              title={t('tutor_groups.action_student_profile')}
                              onClick={() => onViewStudent(student)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-primary"
                              title={t('tutor_students.action_edit')}
                              onClick={() => onEditStudent(student)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                              title={t('tutor_groups.action_move_exclude')}
                              onClick={() => onMoveStudent(student)}
                            >
                              <ArrowRightLeft className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-border">
              <Users className="h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="font-semibold text-base">{t('tutor_groups.empty_group_students')}</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
                {t('tutor_groups.empty_modal_desc')}
              </p>
              <Button size="sm" onClick={() => onAddStudent(group.name)}>
                <UserPlus className="mr-2 h-4 w-4" />
                {t('tutor_students.btn_add_student')}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
