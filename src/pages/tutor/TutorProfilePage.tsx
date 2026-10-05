import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserProfile, useUpdateProfile } from '@/hooks/useProfile'
import { ChangePasswordCard } from '@/components/profile/ChangePasswordCard'
import { toast } from 'sonner'
import {
  Mail,
  Phone,
  Briefcase,
  CheckCircle2,
  Loader2,
  Calendar,
  AlertCircle,
  IdCard,
} from 'lucide-react'

export function TutorProfilePage() {
  const { data: profile, isLoading, isError, refetch } = useUserProfile()
  const updateProfileMutation = useUpdateProfile()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [specialization, setSpecialization] = useState('')

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '')
      setLastName(profile.lastName || '')
      setPhone(profile.phone || '')
      setSpecialization(profile.specialization || '')
    }
  }, [profile])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48 md:col-span-1 rounded-xl" />
          <Skeleton className="h-64 md:col-span-2 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Профиль преподавателя</h1>
          <p className="text-muted-foreground text-sm">
            Управление персональными данными и безопасностью
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
                Возникли неполадки с получением данных. Пожалуйста, попробуйте еще раз.
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

  const fullName = [firstName, lastName].filter(Boolean).join(' ') || profile.email
  const initial = (firstName || profile.email).charAt(0).toUpperCase()

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateProfileMutation.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        specialization: specialization.trim(),
      })
      toast.success('Данные профиля успешно сохранены')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Не удалось сохранить профиль'
      toast.error(msg)
    }
  }

  const formattedDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Недавно'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Профиль преподавателя</h1>
        <p className="text-muted-foreground text-sm">
          Управление личными данными, специализацией и безопасностью аккаунта
        </p>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Summary */}
        <Card className="md:col-span-1 border-border flex flex-col justify-between bg-gradient-to-br from-card to-muted/20">
          <CardHeader className="pb-3">
            <div className="flex flex-col items-center text-center space-y-3">
              <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-xs">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-foreground">{fullName}</h2>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-mono text-xs">
                  Преподаватель
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 border-t border-border/60 pt-4 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">{profile.email}</span>
            </div>
            {profile.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span>{profile.phone}</span>
              </div>
            )}
            {profile.specialization && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate">{profile.specialization}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0 text-primary" />
              <span>Регистрация: {formattedDate}</span>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        <Card className="md:col-span-2 border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-primary/10 text-primary">
                <IdCard className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Личные данные</CardTitle>
                <CardDescription className="text-xs">
                  Информация, отображаемая в вашей CRM и при взаимодействии с учениками
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="tutorFirstName" className="text-xs font-medium">
                    Имя
                  </Label>
                  <div className="relative">
                    <Input
                      id="tutorFirstName"
                      type="text"
                      placeholder="Иван"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={updateProfileMutation.isPending}
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="tutorLastName" className="text-xs font-medium">
                    Фамилия
                  </Label>
                  <div className="relative">
                    <Input
                      id="tutorLastName"
                      type="text"
                      placeholder="Иванов"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={updateProfileMutation.isPending}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="space-y-1.5">
                  <Label htmlFor="tutorPhone" className="text-xs font-medium">
                    Номер телефона
                  </Label>
                  <Input
                    id="tutorPhone"
                    type="tel"
                    placeholder="+7 (700) 000-00-00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={updateProfileMutation.isPending}
                  />
                </div>

                {/* Email (Read-only) */}
                <div className="space-y-1.5">
                  <Label htmlFor="tutorEmail" className="text-xs font-medium text-muted-foreground">
                    Email аккаунта (логин)
                  </Label>
                  <Input
                    id="tutorEmail"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-muted/50 cursor-not-allowed text-muted-foreground"
                  />
                </div>
              </div>

              {/* Specialization */}
              <div className="space-y-1.5">
                <Label htmlFor="tutorSpecialization" className="text-xs font-medium">
                  Специализация / Преподаваемые предметы
                </Label>
                <Input
                  id="tutorSpecialization"
                  type="text"
                  placeholder="Математика, Физика, Подготовка к олимпиадам"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  disabled={updateProfileMutation.isPending}
                />
                <p className="text-[11px] text-muted-foreground">
                  Укажите ваши основные направления и предметы для удобной организации работы.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Сохранить изменения
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Security & Password Change */}
      <ChangePasswordCard />
    </div>
  )
}
