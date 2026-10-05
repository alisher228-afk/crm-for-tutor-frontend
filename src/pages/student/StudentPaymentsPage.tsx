import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMyPayments } from '@/hooks/usePayments'
import { useMyProfile } from '@/hooks/useStudents'
import {
  Sparkles,
  DollarSign,
  Hash,
  Calendar,
  AlertCircle,
  ShieldCheck,
  Receipt,
} from 'lucide-react'

function formatPaymentDate(dateStr?: string): string {
  if (!dateStr) return '—'
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number)
    const d = new Date(year, month - 1, day)
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function StudentPaymentsPage() {
  const { data: paymentsData, isLoading: isLoadingPayments, isError: isErrorPayments, refetch: refetchPayments } =
    useMyPayments()

  const { data: profile, isLoading: isLoadingProfile } = useMyProfile()

  const payments = useMemo(() => {
    if (!paymentsData) return []
    if (Array.isArray(paymentsData)) return paymentsData
    if (Array.isArray(paymentsData.payments)) return paymentsData.payments
    return []
  }, [paymentsData])

  const currentBalance =
    paymentsData?.lessonBalance ??
    profile?.balance ??
    profile?.lessonBalance ??
    0

  const stats = useMemo(() => {
    const totalAmount = payments.reduce((acc, p) => acc + (p.amount || 0), 0)
    const totalLessonsPaid = payments.reduce(
      (acc, p) => acc + (p.lessonsCount || 0),
      0,
    )
    const count = payments.length
    return { totalAmount, totalLessonsPaid, count }
  }, [payments])

  const isLoading = isLoadingPayments || isLoadingProfile

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">История оплат и баланс</h1>
        <p className="text-muted-foreground text-sm">
          Информация о совершенных платежах и текущем остатке оплаченных занятий
        </p>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Remaining Lessons Card */}
        <Card className="border-border bg-gradient-to-br from-card to-muted/20">
          <CardContent className="p-5 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Текущий баланс
              </p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-foreground">
                  {currentBalance}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {currentBalance === 1
                    ? 'урок'
                    : currentBalance > 1 && currentBalance < 5
                    ? 'урока'
                    : 'уроков'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Money Deposited */}
        <Card className="border-border">
          <CardContent className="p-5 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Всего оплачено
              </p>
              <p className="text-2xl sm:text-3xl font-black text-foreground mt-0.5">
                {stats.totalAmount.toLocaleString('ru-RU')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Lessons Credited */}
        <Card className="border-border">
          <CardContent className="p-5 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              <Hash className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Оплачено уроков
              </p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-foreground">
                  {stats.totalLessonsPaid}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  за всё время
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments History Table */}
      <Card className="border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : isErrorPayments ? (
            <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <div className="space-y-1">
                <p className="font-semibold text-foreground">
                  Не удалось загрузить историю платежей
                </p>
                <p className="text-xs text-muted-foreground">
                  Проверьте подключение к сети или повторите попытку позже
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetchPayments()}>
                Повторить попытку
              </Button>
            </div>
          ) : payments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="w-[160px]">Дата платежа</TableHead>
                    <TableHead className="w-[150px]">Сумма</TableHead>
                    <TableHead className="w-[130px]">Начислено уроков</TableHead>
                    <TableHead>Назначение / Комментарий</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-muted/30">
                      {/* Date */}
                      <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{formatPaymentDate(payment.paymentDate)}</span>
                        </div>
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="whitespace-nowrap">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          +{payment.amount.toLocaleString('ru-RU')}
                        </span>
                      </TableCell>

                      {/* Lessons Count */}
                      <TableCell className="whitespace-nowrap text-xs sm:text-sm">
                        {payment.lessonsCount !== undefined ? (
                          <Badge variant="outline" className="font-medium">
                            +{payment.lessonsCount} ур.
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      {/* Notes */}
                      <TableCell className="text-xs sm:text-sm text-muted-foreground">
                        {payment.notes ? (
                          <span className="text-foreground">{payment.notes}</span>
                        ) : (
                          <span className="text-muted-foreground/60 italic">
                            Пополнение баланса
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            /* Empty State */
            <div className="py-16 px-4 text-center flex flex-col items-center justify-center space-y-3">
              <div className="p-3.5 rounded-full bg-muted text-muted-foreground">
                <Receipt className="h-7 w-7" />
              </div>
              <div className="max-w-xs space-y-1">
                <p className="font-semibold text-foreground">Платежей пока не было</p>
                <p className="text-xs text-muted-foreground">
                  Когда репетитор зафиксирует оплату за занятия, история и чек отобразятся здесь.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info notice */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p>
          Все оплаты фиксируются вашим репетитором. Для продления абонемента или уточнения реквизитов
          свяжитесь с преподавателем напрямую.
        </p>
      </div>
    </div>
  )
}
