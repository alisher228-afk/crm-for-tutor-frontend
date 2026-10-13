import { useLanguage } from '@/i18n'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTestSubmissions } from '@/hooks/useTests'
import { Users, Clock, Award } from 'lucide-react'
import type { TestItem } from '@/types'

interface TestSubmissionsModalProps {
  test: TestItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TestSubmissionsModal({
  test,
  open,
  onOpenChange,
}: TestSubmissionsModalProps) {
  const { t, language } = useLanguage()
  const dateLocale = language === 'en' ? 'en-US' : language === 'kk' ? 'kk-KZ' : 'ru-RU'
  const { data: submissions = [], isLoading } = useTestSubmissions(test?.id)

  const formatDuration = (seconds?: number): string => {
    if (!seconds || seconds <= 0) return '—'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins === 0) return t('tutor_tests.duration_sec', { sec: secs })
    return t('tutor_tests.duration_min_sec', { min: mins, sec: secs })
  }

  const formatSubmissionDate = (dateStr: string): string => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleString(dateLocale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  const avgPercentage = submissions.length > 0
    ? Math.round(submissions.reduce((acc, s) => acc + s.percentage, 0) / submissions.length)
    : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span>{t('tutor_tests.modal_submissions_title')}</span>
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs">
                {test?.title} • {test?.topic || t('tutor_tests.no_topic')}
              </DialogDescription>
            </div>

            {test && (
              <Badge variant="outline" className="text-xs">
                {test.type === 'INTERNAL' ? t('tutor_tests.badge_internal') : t('tutor_tests.badge_external')}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-2">
          <div className="p-3 rounded-lg border border-border bg-muted/30 text-center">
            <p className="text-[11px] font-medium text-muted-foreground flex items-center justify-center gap-1">
              <Users className="h-3 w-3" /> {t('tutor_tests.stat_turned_in')}
            </p>
            <p className="text-xl font-bold text-foreground mt-0.5">
              {t('tutor_tests.submissions_count', { count: submissions.length })}
            </p>
          </div>

          <div className="p-3 rounded-lg border border-border bg-muted/30 text-center">
            <p className="text-[11px] font-medium text-muted-foreground flex items-center justify-center gap-1">
              <Award className="h-3 w-3 text-amber-500" /> {t('tutor_tests.stat_avg_score')}
            </p>
            <p className="text-xl font-bold text-foreground mt-0.5">
              {submissions.length > 0 ? `${avgPercentage}%` : '—'}
            </p>
          </div>

          <div className="p-3 rounded-lg border border-border bg-muted/30 text-center col-span-2 sm:col-span-1">
            <p className="text-[11px] font-medium text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" /> {t('tutor_tests.stat_time_limit')}
            </p>
            <p className="text-xl font-bold text-foreground mt-0.5">
              {test?.timeLimitMinutes ? t('tutor_tests.unit_minutes_period', { count: test.timeLimitMinutes }) : t('tutor_tests.no_time_limit')}
            </p>
          </div>
        </div>

        {/* Submissions List */}
        <div className="overflow-y-auto max-h-[50vh] pr-1">
          {isLoading ? (
            <div className="space-y-2 py-4">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ) : submissions.length > 0 ? (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('tutor_tests.th_student')}</TableHead>
                    <TableHead className="text-center">{t('tutor_tests.th_score')}</TableHead>
                    <TableHead className="text-center">{t('tutor_tests.th_percentage')}</TableHead>
                    <TableHead>{t('tutor_tests.th_time')}</TableHead>
                    <TableHead className="text-right">{t('tutor_tests.th_submitted_date')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((sub) => {
                    const stInitial = sub.studentName?.charAt(0).toUpperCase() || t('tutor_students.default_student_name').charAt(0).toUpperCase()
                    const isPassedWell = sub.percentage >= 80
                    const isPassedMedium = sub.percentage >= 50 && sub.percentage < 80

                    return (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar size="sm">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                {stInitial}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm text-foreground">
                              {sub.studentName}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-center font-bold text-foreground">
                          {sub.score} / {sub.totalQuestions}
                        </TableCell>

                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={`font-semibold ${
                              isPassedWell
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                                : isPassedMedium
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                            }`}
                          >
                            {sub.percentage}%
                          </Badge>
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground">
                          {formatDuration(sub.timeSpentSeconds)}
                        </TableCell>

                        <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                          {formatSubmissionDate(sub.submittedAt)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
              <div className="p-3 rounded-full bg-muted text-muted-foreground">
                <Users className="h-6 w-6" />
              </div>
              <p className="font-semibold text-sm text-foreground">
                {t('tutor_tests.empty_submissions_title')}
              </p>
              <p className="text-xs text-muted-foreground max-w-sm">
                {t('tutor_tests.empty_submissions_desc')}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
