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
import { Loader2, Send } from 'lucide-react'
import type { AxiosError } from 'axios'
import { Logo } from '@/components/brand/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageToggle } from '@/components/LanguageToggle'
import { useLanguage } from '@/i18n'

export function LoginPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const {
    login,
    isTelegramWebApp,
    telegramUser,
    telegramLinkRequired,
    loginWithTelegram,
    isLoading: isAuthLoading,
  } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Telegram link code state
  const [telegramCode, setTelegramCode] = useState('')
  const [isTelegramSubmitting, setIsTelegramSubmitting] = useState(false)
  const [showPasswordLogin, setShowPasswordLogin] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      toast.error(t('auth.err_enter_email'))
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      toast.error(t('auth.err_invalid_email'))
      return
    }

    if (!password) {
      toast.error(t('auth.err_enter_password'))
      return
    }

    if (password.length < 6) {
      toast.error(t('auth.err_password_len'))
      return
    }

    setIsLoading(true)
    try {
      const response = await login(trimmedEmail, password)
      toast.success(t('auth.login_success'))

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
          ? t('auth.err_network')
          : t('auth.err_login_failed'))
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTelegramLinkSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmedCode = telegramCode.trim()
    if (!trimmedCode) {
      toast.error(t('auth.err_enter_code'))
      return
    }

    setIsTelegramSubmitting(true)
    try {
      const response = await loginWithTelegram(trimmedCode)
      toast.success(t('auth.tg_linked_success'))

      const role = (response.role as string)?.replace(/^ROLE_/, '')
      if (role === 'TUTOR') {
        navigate('/tutor/students')
      } else {
        navigate('/student')
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>
      const serverMessage =
        axiosError.response?.data?.message || axiosError.response?.data?.error
      toast.error(serverMessage || t('auth.err_invalid_code'))
    } finally {
      setIsTelegramSubmitting(false)
    }
  }

  // If opened inside Telegram and user hasn't explicitly chosen password login
  if (isTelegramWebApp && !showPasswordLogin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>

        <Card className="w-full max-w-md border-border bg-card shadow-soft">
          <CardHeader className="space-y-3 text-center pb-2">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Send className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold">
              {telegramUser?.first_name
                ? t('auth.tg_welcome', { name: telegramUser.first_name })
                : t('auth.tg_title_default')}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              {isAuthLoading
                ? t('auth.tg_auth_loading')
                : telegramLinkRequired
                  ? t('auth.tg_link_code_desc')
                  : t('auth.tg_profile_loading')}
            </CardDescription>
          </CardHeader>

          {isAuthLoading ? (
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">{t('auth.tg_entering')}</p>
            </CardContent>
          ) : (
            <form onSubmit={handleTelegramLinkSubmit}>
              <CardContent className="space-y-4 pt-2">
                <div className="space-y-1.5 text-center">
                  <Label htmlFor="telegramCode" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    {t('auth.tg_code_label')}
                  </Label>
                  <Input
                    id="telegramCode"
                    type="text"
                    placeholder={t('auth.tg_code_placeholder')}
                    maxLength={8}
                    value={telegramCode}
                    onChange={(e) => setTelegramCode(e.target.value.toUpperCase())}
                    disabled={isTelegramSubmitting}
                    className="h-12 text-center text-2xl font-mono tracking-widest font-bold"
                    autoFocus
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3 mt-2">
                <Button
                  type="submit"
                  className="w-full h-11 font-medium text-base"
                  disabled={isTelegramSubmitting || !telegramCode.trim()}
                >
                  {isTelegramSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('auth.tg_connecting')}
                    </>
                  ) : (
                    t('auth.tg_connect_button')
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => setShowPasswordLogin(true)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors pt-2 underline underline-offset-4 cursor-pointer"
                >
                  {t('auth.tg_switch_password')}
                </button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    )
  }

  // Normal login view
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md border-border bg-card shadow-soft">
        <CardHeader className="space-y-3 text-center pb-2">
          <Link to="/" className="mx-auto flex flex-col items-center gap-1 group cursor-pointer focus-visible:outline-none">
            <Logo variant="full" size="lg" className="group-hover:opacity-90 transition-opacity" />
          </Link>
          <CardDescription className="text-muted-foreground text-sm">
            {t('auth.login_subtitle')}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-foreground text-sm font-medium">
                {t('auth.email')}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.email_placeholder')}
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground text-sm font-medium">
                  {t('auth.password')}
                </Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder={t('auth.password_placeholder')}
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
              {isLoading ? t('auth.logging_in') : t('auth.login_button')}
            </Button>

            {isTelegramWebApp && (
              <button
                type="button"
                onClick={() => setShowPasswordLogin(false)}
                className="text-xs text-primary hover:underline cursor-pointer"
              >
                {t('auth.tg_back_to_telegram')}
              </button>
            )}

            <div className="text-center text-sm text-muted-foreground space-y-1">
              <p>
                {t('auth.not_registered_tutor')}{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                >
                  {t('auth.register_link')}
                </Link>
              </p>
              <p className="text-xs text-muted-foreground/80">
                {t('auth.student_notice')}
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

