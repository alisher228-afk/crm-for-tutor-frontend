import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useMyProfile } from '@/hooks/useStudents'
import { useMyHomework } from '@/hooks/useHomework'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  UserCircle,
  Calendar,
  BookOpen,
  Receipt,
  LogOut,
  Menu,
  Library,
  BrainCircuit,
} from 'lucide-react'
import { LogoutConfirmDialog } from '@/components/LogoutConfirmDialog'
import { Logo } from '@/components/brand/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageToggle } from '@/components/LanguageToggle'
import { useLanguage } from '@/i18n'

interface StudentNavItem {
  to: string
  end?: boolean
  label: string
  icon: typeof UserCircle
  count?: string
}

export function StudentLayout() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)

  const handleConfirmLogout = () => {
    setMobileOpen(false)
    logout()
    navigate('/login')
  }

  const { data: profile } = useMyProfile()
  const { data: myHomework = [] } = useMyHomework()
  const pendingCount = (myHomework || []).filter((h) => h.status === 'ASSIGNED').length

  const studentNavItems: StudentNavItem[] = [
    { to: '/student', end: true, label: t('nav.my_profile'), icon: UserCircle },
    { to: '/student/lessons', end: false, label: t('nav.schedule'), icon: Calendar },
    {
      to: '/student/homework',
      end: false,
      label: t('nav.homework_short'),
      icon: BookOpen,
      count: pendingCount > 0 ? String(pendingCount) : undefined,
    },
    { to: '/student/tests', end: false, label: t('nav.tests_and_quizzes'), icon: BrainCircuit },
    { to: '/student/materials', end: false, label: t('nav.materials'), icon: Library },
    { to: '/student/payments', end: false, label: t('nav.payments_and_balance'), icon: Receipt },
  ]

  const studentFullName =
    profile?.name ||
    [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') ||
    user?.email ||
    t('profile.student_title')
  const userInitial = studentFullName.charAt(0).toUpperCase() || 'S'

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Header */}
      <header className="border-b border-border bg-card/90 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto max-w-[1280px] flex h-14 items-center justify-between px-4 sm:px-6">
          {/* Logo & Role Badge with red dot */}
          <div className="flex items-center gap-3">
            <Logo variant="full" size="md" />
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-none border border-border bg-muted/40 text-[11px] text-muted-foreground font-mono">
              <span className="h-1.5 w-1.5 bg-red-accent" />
              {t('nav.role_student')}
            </div>
            {profile?.tutorName && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 rounded-none border border-border/80 bg-muted/20 text-[11px] text-muted-foreground">
                <span className="text-muted-foreground/70">{t('nav.teacher_label')}</span>
                <span className="font-semibold text-foreground">{profile.tutorName}</span>
              </div>
            )}
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 bg-muted/40 p-1 rounded-none border border-border">
            {studentNavItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-1 rounded-none text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-background text-foreground shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <span className="h-1.5 w-1.5 bg-red-accent shrink-0" />
                      ) : (
                        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                      )}
                      <span>{item.label}</span>
                      {item.count && (
                        <span className="inline-flex items-center justify-center px-1 rounded-none border border-red-500/20 text-[9px] font-mono font-semibold bg-red-soft text-red-foreground">
                          {item.count}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>

          {/* User Info, ThemeToggle & Logout (Desktop) */}
          <div className="hidden md:flex items-center gap-2.5">
            <LanguageToggle />
            <ThemeToggle />

            <div className="flex items-center gap-2 pl-1">
              <Avatar size="sm">
                <AvatarFallback className="bg-muted text-foreground font-semibold text-xs border border-border">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-foreground max-w-[150px] truncate">
                  {studentFullName}
                </span>
                {studentFullName !== user?.email && (
                  <span className="text-[10px] text-muted-foreground max-w-[150px] truncate font-mono">
                    {user?.email}
                  </span>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLogoutConfirmOpen(true)}
              className="text-muted-foreground hover:text-destructive"
              aria-label={t('nav.logout')}
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
              <span className="sr-only">{t('nav.logout')}</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon-sm" aria-label={t('nav.open_menu')} />
                }
              >
                <Menu className="h-5 w-5" strokeWidth={1.75} />
              </SheetTrigger>
              <SheetContent side="right" className="p-0 w-72 flex flex-col justify-between">
                <SheetHeader className="sr-only">
                  <SheetTitle>{t('nav.navigation')}</SheetTitle>
                </SheetHeader>

                <div className="p-5 space-y-6">
                  {/* Brand & User Card */}
                  <div className="flex items-center gap-3">
                    <Avatar size="default">
                      <AvatarFallback className="bg-muted text-foreground font-semibold border border-border">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {studentFullName}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-accent" />
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {profile?.tutorName
                            ? `${t('nav.teacher_label')} ${profile.tutorName}`
                            : t('nav.role_student')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Nav Links */}
                  <nav className="space-y-1">
                    {studentNavItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.end}
                          onClick={() => setMobileOpen(false)}
                          className={({ isActive }) =>
                            `relative flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                              isActive
                                ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              {isActive && (
                                <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-red-accent" />
                              )}
                              <div className="flex items-center gap-3">
                                <Icon className="h-4 w-4" strokeWidth={1.75} />
                                <span>{item.label}</span>
                              </div>
                              {item.count && (
                                <span className="inline-flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] font-mono font-semibold bg-red-soft text-red-foreground">
                                  {item.count}
                                </span>
                              )}
                            </>
                          )}
                        </NavLink>
                      )
                    })}
                  </nav>
                </div>

                {/* Mobile Settings & Logout Button */}
                <div className="p-5 border-t border-border space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-2.5 py-1.5 text-xs text-muted-foreground border border-border/60 rounded-md bg-muted/30">
                      <span>{t('language.title')}</span>
                      <LanguageToggle />
                    </div>
                    <div className="flex items-center justify-between px-2.5 py-1.5 text-xs text-muted-foreground border border-border/60 rounded-md bg-muted/30">
                      <span>{t('nav.theme')}</span>
                      <ThemeToggle />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setMobileOpen(false)
                      setLogoutConfirmOpen(true)
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" strokeWidth={1.75} />
                    {t('nav.logout')}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-[1280px] p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      <LogoutConfirmDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        onConfirm={handleConfirmLogout}
      />
    </div>
  )
}
