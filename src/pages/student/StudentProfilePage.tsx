import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/AuthContext'
import { useMyProfile } from '@/hooks/useStudents'
import {
  Sparkles,
  Calendar,
  BookOpen,
  Receipt,
  Mail,
  Phone,
  Send,
  GraduationCap,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Info,
  ShieldCheck,
} from 'lucide-react'

export function StudentProfilePage() {
  const { user } = useAuth()
  const { data: profile, isLoading, isError, refetch } = useMyProfile()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-56 md:col-span-1 rounded-xl" />
          <Skeleton className="h-56 md:col-span-2 rounded-xl" />
        </div>

        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Личный кабинет</h1>
          <p className="text-muted-foreground text-sm">
            Информация о вашем профиле и балансе занятий
          </p>
        </div>

        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground text-lg">
                Не удалось загрузить данные профиля
              </p>
              <p className="text-sm text-muted-foreground max-w-md">
                Возможно, профиль ещё формируется или возникли временные неполадки с соединением
              </p>
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              Повторить попытку
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const balance = profile.balance ?? profile.lessonBalance ?? 0
  const fullName =
    profile.name ||
    [profile.firstName, profile.lastName].filter(Boolean).join(' ') ||
    user?.email ||
    'Ученик'

  const userInitial = fullName.charAt(0).toUpperCase() || 'У'

  const getBalanceStatus = (val: number) => {
    if (val > 2) {
      return {
        label: 'Баланс в норме',
        badgeClass:
          'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        textColor: 'text-emerald-600 dark:text-emerald-400',
      }
    }
    if (val > 0) {
      return {
        label: 'Осталось мало уроков',
        badgeClass:
          'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        textColor: 'text-amber-600 dark:text-amber-400',
      }
    }
    return {
      label: 'Требуется пополнение',
      badgeClass:
        'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900',
      textColor: 'text-rose-600 dark:text-rose-400',
    }
  }

  const balanceStatus = getBalanceStatus(balance)

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Личный кабинет</h1>
        <p className="text-muted-foreground text-sm">
          Ваш профиль, информация об обучении и баланс занятий
        </p>
      </div>

      {/* Hero Grid: Balance Card & Profile Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <Card className="md:col-span-1 border-border flex flex-col justify-between bg-gradient-to-br from-card to-muted/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                Баланс уроков
              </span>
              <Badge variant="outline" className={balanceStatus.badgeClass}>
                {balanceStatus.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-5xl font-black tracking-tight ${balanceStatus.textColor}`}
                >
                  {balance}
                </span>
                <span className="text-xl font-bold text-muted-foreground">
                  {balance === 1 ? 'урок' : balance > 1 && balance < 5 ? 'урока' : 'уроков'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Оплаченные и готовые к планированию занятия
              </p>
            </div>

            <div className="pt-2 border-t border-border/60">
              <Link
                to="/student/payments"
                className={buttonVariants({
                  variant: 'outline',
                  className:
                    'w-full gap-2 text-xs h-9 inline-flex items-center justify-center',
                })}
              >
                <Receipt className="h-3.5 w-3.5 text-primary" />
                <span>История оплат и списаний</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Profile Card */}
        <Card className="md:col-span-2 border-border flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg font-bold">{fullName}</CardTitle>
                  <CardDescription className="text-xs">
                    {profile.email || user?.email}
                  </CardDescription>
                </div>
              </div>

              <Badge
                variant="outline"
                className="bg-primary/5 text-primary border-primary/20 text-xs font-medium"
              >
                {profile.status === 'ARCHIVED' ? 'Архив' : 'Обучается'}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-t border-border pt-4">
              {/* Contact: Phone */}
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-muted text-muted-foreground">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Телефон</p>
                  <p className="font-medium text-foreground text-xs sm:text-sm">
                    {profile.phone || 'Не указан'}
                  </p>
                </div>
              </div>

              {/* Contact: Telegram */}
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Send className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span>Telegram</span>
                    {profile.telegramLinked && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="h-3 w-3" /> привязан
                      </span>
                    )}
                  </p>
                  <p className="font-medium text-foreground text-xs sm:text-sm">
                    {profile.telegram
                      ? profile.telegram.startsWith('@')
                        ? profile.telegram
                        : `@${profile.telegram}`
                      : 'Не привязан'}
                  </p>
                </div>
              </div>

              {/* Level */}
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Текущий уровень</p>
                  <p className="font-medium text-foreground text-xs sm:text-sm">
                    {profile.currentLevel || 'Не указан'}
                  </p>
                </div>
              </div>

              {/* Hourly Rate */}
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ставка занятия</p>
                  <p className="font-medium text-foreground text-xs sm:text-sm">
                    {profile.hourlyRate
                      ? `${profile.hourlyRate.toLocaleString('ru-RU')} ₽ / урок`
                      : 'Индивидуально'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tutor / Mentor info card if available */}
      {(profile.tutorName || profile.tutorEmail) && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Ваш преподаватель</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
            <div className="space-y-0.5">
              <p className="font-medium text-foreground">{profile.tutorName || 'Репетитор'}</p>
              {profile.tutorEmail && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{profile.tutorEmail}</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-border hover:border-primary/50 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                <span>Расписание занятий</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Смотрите время предстоящих уроков и ссылки на видеовстречи
              </p>
            </div>
            <Link
              to="/student/lessons"
              className={buttonVariants({
                size: 'sm',
                variant: 'secondary',
                className: 'shrink-0 ml-3',
              })}
            >
              Перейти
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-primary/50 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <BookOpen className="h-4 w-4 text-primary" />
                <span>Домашние задания</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Задачи от преподавателя, файлы, дедлайны и проверка
              </p>
            </div>
            <Link
              to="/student/homework"
              className={buttonVariants({
                size: 'sm',
                variant: 'secondary',
                className: 'shrink-0 ml-3',
              })}
            >
              Перейти
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Read-only notification banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground">
        <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <p>
          Все параметры профиля и баланса синхронизируются с вашим репетитором. Если вам нужно
          изменить контактные данные или пополнить баланс уроков, свяжитесь с вашим преподавателем.
        </p>
      </div>
    </div>
  )
}
