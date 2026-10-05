import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import { Loader2 } from 'lucide-react'
import type { AxiosError } from 'axios'
import { Logo } from '@/components/brand/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'

export function TutorRegisterPage() {
  const navigate = useNavigate()
  const { registerTutor } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

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
      toast.error('Пароль должен быть не менее 6 символов')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Пароли не совпадают')
      return
    }

    setIsLoading(true)
    try {
      const response = await registerTutor(trimmedEmail, password)
      toast.success('Регистрация репетитора прошла успешно!')

      if (response?.accessToken) {
        navigate('/tutor/students')
      } else {
        navigate('/login')
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      const serverMessage =
        axiosError.response?.data?.message || axiosError.response?.data?.error
      const errorMessage =
        serverMessage ||
        (axiosError.code === 'ERR_NETWORK' || !axiosError.response
          ? 'Не удалось связаться с сервером (Network Error). Проверьте бэкенд.'
          : 'Ошибка при регистрации. Возможно, данный email уже занят.')
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md border-border bg-card shadow-soft">
        <CardHeader className="space-y-3 text-center pb-2">
          <Link to="/" className="mx-auto flex flex-col items-center gap-1 group cursor-pointer focus-visible:outline-none">
            <Logo variant="full" size="lg" className="group-hover:opacity-90 transition-opacity" />
          </Link>
          <CardTitle className="text-xl font-bold tracking-tight">Регистрация репетитора</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Создайте профиль для управления расписанием, учениками и оплатами
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tutor@example.com"
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
              {isLoading ? 'Создание аккаунта...' : 'Зарегистрироваться'}
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
