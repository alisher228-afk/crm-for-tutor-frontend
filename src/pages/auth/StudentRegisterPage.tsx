import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { AlertCircle, GraduationCap, Loader2, KeyRound } from 'lucide-react'
import type { AxiosError } from 'axios'

export function StudentRegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { registerStudent } = useAuth()

  const inviteTokenFromUrl = searchParams.get('token') || ''
  const [inviteToken, setInviteToken] = useState(inviteTokenFromUrl)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const token = inviteToken.trim()
    if (!token) {
      toast.error('Отсутствует токен приглашения. Перейдите по ссылке от репетитора.')
      return
    }

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      toast.error('Пожалуйста, введите email')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      toast.error('Введите корректный email адрес')
      return
    }

    if (!password) {
      toast.error('Пожалуйста, введите пароль')
      return
    }

    if (password.length < 6) {
      toast.error('Пароль должен содержать не менее 6 символов')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Пароли не совпадают')
      return
    }

    setIsLoading(true)
    try {
      const response = await registerStudent(token, trimmedEmail, password)
      toast.success('Регистрация ученика прошла успешно!')

      if (response?.accessToken) {
        navigate('/student')
      } else {
        navigate('/login')
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      const status = axiosError.response?.status
      let errorMessage =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error

      if (!errorMessage) {
        if (status === 400 || status === 404) {
          errorMessage = 'Недействительный или просроченный токен приглашения'
        } else if (status === 409) {
          errorMessage = 'Пользователь с таким email уже зарегистрирован'
        } else {
          errorMessage = 'Не удалось зарегистрироваться. Попробуйте снова или запросите новую ссылку у репетитора.'
        }
      }

      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const hasInitialToken = Boolean(inviteTokenFromUrl)

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Регистрация ученика</CardTitle>
          <CardDescription>
            Присоединяйтесь к платформе по приглашению вашего репетитора
          </CardDescription>
        </CardHeader>

        {!hasInitialToken && !inviteToken && (
          <div className="mx-6 mb-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Ссылка приглашения не найдена</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Вы можете ввести токен приглашения вручную ниже или открыть ссылку, полученную от репетитора.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="inviteToken" className="flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5" />
                Токен приглашения
              </Label>
              <Input
                id="inviteToken"
                type="text"
                placeholder="Вставьте токен приглашения"
                value={inviteToken}
                onChange={(e) => setInviteToken(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="student@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Минимум 6 символов"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Подтверждение пароля</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Повторите пароль"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 mt-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Уже есть аккаунт?{' '}
              <Link
                to="/login"
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
              >
                Войти
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
