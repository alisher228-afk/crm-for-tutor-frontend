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

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '—'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs} сек.`
  return `${mins} мин. ${secs} сек.`
}

function formatSubmissionDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleString('ru-RU', {
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

export function TestSubmissionsModal({
  test,
  open,
  onOpenChange,
}: TestSubmissionsModalProps) {
  const { data: submissions = [], isLoading } = useTestSubmissions(test?.id)

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
                <span>Результаты тестирования</span>
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs">
                {test?.title} • {test?.topic || 'Без темы'}
              </DialogDescription>
            </div>

            {test && (
              <Badge variant="outline" className="text-xs">
                {test.type === 'INTERNAL' ? 'Внутренний тест' : 'Внешний квиз'}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-2">
          <div className="p-3 rounded-lg border border-border bg-muted/30 text-center">
            <p className="text-[11px] font-medium text-muted-foreground flex items-center justify-center gap-1">
              <Users className="h-3 w-3" /> Сдали тест
            </p>
            <p className="text-xl font-bold text-foreground mt-0.5">
              {submissions.length} ученик{submissions.length === 1 ? '' : submissions.length < 5 ? 'а' : 'ов'}
            </p>
          </div>

          <div className="p-3 rounded-lg border border-border bg-muted/30 text-center">
            <p className="text-[11px] font-medium text-muted-foreground flex items-center justify-center gap-1">
              <Award className="h-3 w-3 text-amber-500" /> Средний балл
            </p>
            <p className="text-xl font-bold text-foreground mt-0.5">
              {submissions.length > 0 ? `${avgPercentage}%` : '—'}
            </p>
          </div>

          <div className="p-3 rounded-lg border border-border bg-muted/30 text-center col-span-2 sm:col-span-1">
            <p className="text-[11px] font-medium text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" /> Лимит времени
            </p>
            <p className="text-xl font-bold text-foreground mt-0.5">
              {test?.timeLimitMinutes ? `${test.timeLimitMinutes} мин.` : 'Без лимита'}
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
                    <TableHead>Ученик</TableHead>
                    <TableHead className="text-center">Балл</TableHead>
                    <TableHead className="text-center">Процент</TableHead>
                    <TableHead>Время</TableHead>
                    <TableHead className="text-right">Дата сдачи</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((sub) => {
                    const stInitial = sub.studentName?.charAt(0).toUpperCase() || 'У'
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
                Пока никто из учеников не сдавал этот тест
              </p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Когда ученики откроют раздел «Тесты и квизы» и сдадут этот тест, результаты и баллы отобразятся здесь.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
