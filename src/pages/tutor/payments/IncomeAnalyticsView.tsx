import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useIncomeAnalytics } from '@/hooks/usePayments'
import {
  TrendingUp,
  CreditCard,
  GraduationCap,
  Calculator,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  AlertCircle,
} from 'lucide-react'

const MONTHS = [
  { value: 1, label: 'Январь' },
  { value: 2, label: 'Февраль' },
  { value: 3, label: 'Март' },
  { value: 4, label: 'Апрель' },
  { value: 5, label: 'Май' },
  { value: 6, label: 'Июнь' },
  { value: 7, label: 'Июль' },
  { value: 8, label: 'Август' },
  { value: 9, label: 'Сентябрь' },
  { value: 10, label: 'Октябрь' },
  { value: 11, label: 'Ноябрь' },
  { value: 12, label: 'Декабрь' },
]

export function IncomeAnalyticsView() {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth)
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)

  const { data, isLoading, isError, refetch } = useIncomeAnalytics(
    selectedMonth,
    selectedYear,
  )

  const years = [
    currentYear - 2,
    currentYear - 1,
    currentYear,
    currentYear + 1,
  ]

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12)
      setSelectedYear((prev) => prev - 1)
    } else {
      setSelectedMonth((prev) => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1)
      setSelectedYear((prev) => prev + 1)
    } else {
      setSelectedMonth((prev) => prev + 1)
    }
  }

  const handleResetToCurrent = () => {
    setSelectedMonth(currentMonth)
    setSelectedYear(currentYear)
  }

  const isCurrentSelection =
    selectedMonth === currentMonth && selectedYear === currentYear

  const monthLabel =
    MONTHS.find((m) => m.value === selectedMonth)?.label || 'Месяц'

  const totalIncome =
    data?.totalIncome ?? (data as unknown as { income?: number })?.income ?? 0
  const paymentsCount = data?.paymentsCount
  const lessonCount = data?.lessonCount

  const averageCheck =
    paymentsCount && paymentsCount > 0 ? Math.round(totalIncome / paymentsCount) : null

  return (
    <div className="space-y-6">
      {/* Month & Year Selection Bar */}
      <Card className="border-border">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={handlePrevMonth}
              title="Предыдущий месяц"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              <Select
                value={String(selectedMonth)}
                onValueChange={(v) => {
                  if (v) setSelectedMonth(Number(v))
                }}
              >
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={String(selectedYear)}
                onValueChange={(v) => {
                  if (v) setSelectedYear(Number(v))
                }}
              >
                <SelectTrigger className="w-[105px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y} г.
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={handleNextMonth}
              title="Следующий месяц"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-sm font-medium text-muted-foreground">
              Период:{' '}
              <span className="text-foreground font-semibold">
                {monthLabel} {selectedYear}
              </span>
            </span>

            {!isCurrentSelection && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={handleResetToCurrent}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Текущий месяц</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Stats Display */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-44 md:col-span-2 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      ) : isError ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div>
              <p className="font-semibold text-foreground">
                Не удалось загрузить аналитику дохода
              </p>
              <p className="text-sm text-muted-foreground">
                Проверьте подключение к сети или повторите запрос
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Повторить попытку
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Big Hero Stat Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2 border-border bg-card relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-foreground/10" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-foreground" />
                    Доход за {monthLabel} {selectedYear}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 font-medium">
                    Зафиксировано
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-2 pb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-foreground tabular-nums">
                    {totalIncome.toLocaleString('ru-RU')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Фактически поступившие оплаты учеников за выбранный календарный период
                </p>
              </CardContent>
            </Card>

            {/* Average Check Card */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-primary" />
                    Средний платёж
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-bold text-foreground">
                    {averageCheck !== null
                      ? averageCheck.toLocaleString('ru-RU')
                      : '—'}
                  </span>
                </div>
                <CardDescription className="text-xs mt-2">
                  {paymentsCount && paymentsCount > 0
                    ? `На основе ${paymentsCount} платеж${
                        paymentsCount === 1
                          ? 'а'
                          : paymentsCount < 5
                          ? 'ей'
                          : 'ей'
                      }`
                    : 'В этом месяце платежей пока не было'}
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-500" />
                  Количество оплат
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-1">
                <div className="text-2xl font-bold text-foreground">
                  {paymentsCount !== undefined ? paymentsCount : '—'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Всего транзакций от учеников за месяц
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-amber-500" />
                  Проведено уроков
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-1">
                <div className="text-2xl font-bold text-foreground">
                  {lessonCount !== undefined ? lessonCount : '—'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Завершённых занятий за выбранный месяц
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
