import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useStudents } from '@/hooks/useStudents'
import { useStudentPayments } from '@/hooks/usePayments'
import { PaymentFormDialog } from './payments/PaymentFormDialog'
import { DeletePaymentConfirmDialog } from './payments/DeletePaymentConfirmDialog'
import { IncomeAnalyticsView } from './payments/IncomeAnalyticsView'
import {
  Plus,
  DollarSign,
  TrendingUp,
  User,
  Search,
  Calendar,
  Pencil,
  Trash2,
  CreditCard,
  Hash,
  Wallet,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import type { Payment, StudentProfile } from '@/types'

function formatPaymentDate(dateStr?: string): string {
  if (!dateStr) return '—'
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number)
    const d = new Date(year, month - 1, day)
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function TutorPaymentsPage() {
  const [activeTab, setActiveTab] = useState<'payments' | 'analytics'>('payments')

  // Students list for selector
  const { data: studentsData, isLoading: isLoadingStudents } = useStudents({
    size: 100,
  })
  const students = useMemo(() => studentsData?.content || [], [studentsData])

  const [studentSearch, setStudentSearch] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')

  // Determine current student ID
  const currentStudentId =
    selectedStudentId || (students.length > 0 ? students[0].id : '')

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === currentStudentId),
    [students, currentStudentId],
  )

  const selectedStudentName =
    selectedStudent?.name ||
    [selectedStudent?.firstName, selectedStudent?.lastName]
      .filter(Boolean)
      .join(' ') ||
    'Ученик'

  // Student payments query
  const {
    data: payments = [],
    isLoading: isLoadingPayments,
    isError: isErrorPayments,
    refetch: refetchPayments,
  } = useStudentPayments(currentStudentId)

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // Filtered students for quick selector
  const filteredStudents = useMemo(() => {
    return students.filter((s: StudentProfile) => {
      const fullName =
        s.name || [s.firstName, s.lastName].filter(Boolean).join(' ') || ''
      return fullName.toLowerCase().includes(studentSearch.toLowerCase())
    })
  }, [students, studentSearch])

  // Stats for the selected student
  const studentStats = useMemo(() => {
    const totalAmount = payments.reduce((acc, p) => acc + (p.amount || 0), 0)
    const totalLessonsPaid = payments.reduce(
      (acc, p) => acc + (p.lessonsCount || 0),
      0,
    )
    const count = payments.length
    return { totalAmount, totalLessonsPaid, count }
  }, [payments])

  const handleOpenCreate = () => {
    setEditingPayment(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (payment: Payment) => {
    setEditingPayment(payment)
    setIsFormOpen(true)
  }

  const handleOpenDelete = (payment: Payment) => {
    setDeletingPayment(payment)
    setIsDeleteOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Финансы и оплаты</h1>
          <p className="text-muted-foreground text-sm">
            Учёт поступления средств, баланс занятий учеников и аналитика дохода
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Добавить оплату</span>
          </Button>
        </div>
      </div>

      {/* Main Tabs: Payments History & Income Analytics */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as 'payments' | 'analytics')}
        className="space-y-6"
      >
        <TabsList className="grid w-full sm:w-[420px] grid-cols-2">
          <TabsTrigger value="payments" className="gap-2">
            <Wallet className="h-4 w-4" />
            <span>Оплаты учеников</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Аналитика дохода</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Student Payments History */}
        <TabsContent value="payments" className="space-y-6 mt-0">
          {/* Student Selector Card */}
          <Card className="border-border">
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <User className="h-4 w-4 text-primary" />
                  <span>Ученик:</span>
                  <span className="font-bold text-primary">
                    {selectedStudentName}
                  </span>
                  {(selectedStudent?.balance ??
                    selectedStudent?.lessonBalance) !== undefined && (
                    <Badge
                      variant="secondary"
                      className="ml-2 font-medium text-xs"
                    >
                      Баланс:{' '}
                      {selectedStudent?.balance ??
                        selectedStudent?.lessonBalance}{' '}
                      ур.
                    </Badge>
                  )}
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Поиск ученика..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-8 h-8 text-xs bg-background"
                  />
                </div>
              </div>

              {/* Horizontal Student Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
                {isLoadingStudents ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-28 rounded-full shrink-0" />
                  ))
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((s) => {
                    const name =
                      s.name ||
                      [s.firstName, s.lastName].filter(Boolean).join(' ') ||
                      'Ученик'
                    const isSelected = s.id === currentStudentId
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedStudentId(s.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all border ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-muted/40 hover:bg-muted text-foreground border-border'
                        }`}
                      >
                        <Avatar className="h-4 w-4">
                          <AvatarFallback
                            className={`text-[9px] ${
                              isSelected
                                ? 'bg-primary-foreground/20 text-primary-foreground'
                                : ''
                            }`}
                          >
                            {name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{name}</span>
                        {(s.balance ?? s.lessonBalance) !== undefined && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                              isSelected
                                ? 'bg-primary-foreground/20 text-primary-foreground'
                                : 'bg-background text-muted-foreground border'
                            }`}
                          >
                            {s.balance ?? s.lessonBalance} ур.
                          </span>
                        )}
                      </button>
                    )
                  })
                ) : (
                  <p className="text-xs text-muted-foreground py-1">
                    Ученики не найдены
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selected Student Summary Banner */}
          {selectedStudent && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card className="border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Всего внесено
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      {studentStats.totalAmount.toLocaleString('ru-RU')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                    <Hash className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Оплачено занятий
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      {studentStats.totalLessonsPaid} ур.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Текущий баланс
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      {(selectedStudent.balance ??
                        selectedStudent.lessonBalance) !== undefined
                        ? `${
                            selectedStudent.balance ??
                            selectedStudent.lessonBalance
                          } ур.`
                        : '—'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Payments Table Card */}
          <Card className="border-border">
            <CardContent className="p-0">
              {isLoadingPayments ? (
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
                      Не удалось загрузить историю оплат
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Проверьте соединение с сервером или повторите попытку позже
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
                        <TableHead className="w-[140px]">Дата</TableHead>
                        <TableHead className="w-[130px]">Сумма</TableHead>
                        <TableHead className="w-[110px]">Уроков</TableHead>
                        <TableHead>Заметка / Комментарий</TableHead>
                        <TableHead className="w-[100px] text-right">
                          Действия
                        </TableHead>
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
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              +{payment.amount.toLocaleString('ru-RU')}
                            </span>
                          </TableCell>

                          {/* Lessons Count */}
                          <TableCell className="whitespace-nowrap text-xs sm:text-sm">
                            {payment.lessonsCount !== undefined ? (
                              <Badge variant="outline" className="font-medium">
                                {payment.lessonsCount} ур.
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>

                          {/* Notes */}
                          <TableCell className="text-xs sm:text-sm text-muted-foreground max-w-[280px] truncate">
                            {payment.notes ? (
                              <span className="text-foreground">
                                {payment.notes}
                              </span>
                            ) : (
                              <span className="text-muted-foreground/60 italic">
                                Без заметки
                              </span>
                            )}
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => handleOpenEdit(payment)}
                                title="Редактировать оплату"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleOpenDelete(payment)}
                                title="Удалить запись"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                /* Empty state */
                <div className="py-14 px-4 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="p-3 rounded-full bg-muted text-muted-foreground">
                    <CreditCard className="h-7 w-7" />
                  </div>
                  <div className="max-w-xs space-y-1">
                    <p className="font-semibold text-foreground">
                      Платежей пока нет
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Для ученика {selectedStudentName} ещё не было зафиксировано
                      оплат
                    </p>
                  </div>
                  {currentStudentId && (
                    <Button
                      size="sm"
                      onClick={handleOpenCreate}
                      className="gap-2 mt-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Зафиксировать оплату</span>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Income Analytics */}
        <TabsContent value="analytics" className="mt-0">
          <IncomeAnalyticsView />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <PaymentFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        studentId={currentStudentId}
        studentName={selectedStudentName}
        initialData={editingPayment}
        studentsList={students}
        onSelectStudentId={(id) => setSelectedStudentId(id)}
      />

      <DeletePaymentConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        payment={deletingPayment}
        studentId={currentStudentId}
        studentName={selectedStudentName}
      />
    </div>
  )
}
