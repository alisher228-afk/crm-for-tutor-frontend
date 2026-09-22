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
import { GraduationCap, Loader2 } from 'lucide-react'
import type { AxiosError } from 'axios'

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

      if (response.role === 'TUTOR') {
        navigate('/tutor/students')
      } else if (response.role === 'STUDENT') {
        navigate('/student')
      } else {
        navigate('/')
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        'Не удалось войти. Проверьте правильность email и пароля.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">CRM for Tutor</CardTitle>
          <CardDescription>
            Войдите в свой аккаунт для продолжения работы
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Пароль</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 mt-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Вход...' : 'Войти'}
            </Button>

            <div className="text-center text-sm text-muted-foreground space-y-1">
              <p>
                Вы репетитор и ещё не с нами?{' '}
                <Link
                  to="/register"
                  className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
                >
                  Зарегистрироваться
                </Link>
              </p>
              <p className="text-xs text-muted-foreground/80">
                Ученики регистрируются по ссылке-приглашению от репетитора.
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
