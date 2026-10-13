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
import { AlertCircle, Loader2, KeyRound } from 'lucide-react'
import type { AxiosError } from 'axios'
import { Logo } from '@/components/brand/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageToggle } from '@/components/LanguageToggle'
import { useLanguage } from '@/i18n'

export function StudentRegisterPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
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
      toast.error(t('auth.err_missing_invite'))
      return
    }

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

    if (password !== confirmPassword) {
      toast.error(t('auth.err_passwords_match'))
      return
    }

    setIsLoading(true)
    try {
      const response = await registerStudent(token, trimmedEmail, password)
      toast.success(t('auth.student_register_success'))

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
          errorMessage = t('auth.err_invalid_invite')
        } else if (status === 409) {
          errorMessage = t('auth.err_email_taken')
        } else {
          errorMessage = t('auth.err_student_register_fallback')
        }
      }

      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const hasInitialToken = Boolean(inviteTokenFromUrl)

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
          <CardTitle className="text-xl font-bold tracking-tight">
            {t('auth.student_register_title')}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            {t('auth.student_register_subtitle')}
          </CardDescription>
        </CardHeader>

        {!hasInitialToken && !inviteToken && (
          <div className="mx-6 mb-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{t('auth.invite_missing_title')}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('auth.invite_missing_desc')}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="inviteToken" className="flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5" />
                {t('auth.invite_token')}
              </Label>
              <Input
                id="inviteToken"
                type="text"
                placeholder={t('auth.invite_token_placeholder')}
                value={inviteToken}
                onChange={(e) => setInviteToken(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.student_email_placeholder')}
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('auth.password_min_placeholder')}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">{t('auth.confirm_password')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t('auth.confirm_password_placeholder')}
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
              {isLoading ? t('auth.registering') : t('auth.register_button')}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t('auth.already_have_account')}{' '}
              <Link
                to="/login"
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
              >
                {t('auth.login_link')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

