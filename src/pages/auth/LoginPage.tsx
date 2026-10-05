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
} from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import type { AxiosError } from 'axios'
import { Logo } from '@/components/brand/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      toast.error('Пароль должен содержать не менее 6 символов')
      return
    }

    setIsLoading(true)
    try {
      const response = await login(trimmedEmail, password)
      toast.success('Авторизация успешна')

      const role = (response.role as string)?.replace(/^ROLE_/, '')
      if (role === 'TUTOR') {
        navigate('/tutor/students')
      } else if (role === 'STUDENT') {
        navigate('/student')
      } else {
        navigate('/')
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      const serverMessage =
        axiosError.response?.data?.message || axiosError.response?.data?.error
      const errorMessage =
        serverMessage ||
        (axiosError.code === 'ERR_NETWORK' || !axiosError.response
          ? 'Не удалось связаться с сервером (Network Error). Проверьте бэкенд.'
          : 'Не удалось войти. Проверьте правильность email и пароля.')
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
          <CardDescription className="text-muted-foreground text-sm">
            Войдите в личный кабинет для управления занятиями и расписанием
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-foreground text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="teacher@studly.crm"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground text-sm font-medium">Пароль</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-10"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 mt-2">
            <Button type="submit" className="w-full h-10 font-medium" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Вход...' : 'Войти в аккаунт'}
            </Button>

            <div className="text-center text-sm text-muted-foreground space-y-1">
              <p>
                Вы репетитор и ещё не с нами?{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                >
                  Зарегистрироваться
                </Link>
              </p>
              <p className="text-xs text-muted-foreground/80">
                Ученики регистрируются по персональной ссылке-приглашению.
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
