import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useUserProfile } from '@/hooks/useProfile'
import { useTutorHomeworkStats } from '@/hooks/useHomework'
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
  Users,
  Calendar,
  DollarSign,
  BookCheck,
  FolderKanban,
  LogOut,
  Menu,
  HelpCircle,
  UserCircle,
} from 'lucide-react'
import { LogoutConfirmDialog } from '@/components/LogoutConfirmDialog'
import { Logo } from '@/components/brand/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'

interface NavItem {
  to: string
  label: string
  icon: typeof Users
  badge?: string
  count?: string
}

export function TutorLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)

  const handleConfirmLogout = () => {
    setMobileOpen(false)
    logout()
    navigate('/login')
  }

  const { data: profile } = useUserProfile()
  const { data: stats } = useTutorHomeworkStats()
  const submittedCount = stats?.submittedCount ?? 0

  const navItems: NavItem[] = [
    { to: '/tutor/students', label: 'Ученики', icon: Users },
    { to: '/tutor/lessons', label: 'Расписание', icon: Calendar },
    { to: '/tutor/payments', label: 'Финансы', icon: DollarSign },
    {
      to: '/tutor/homework',
      label: 'Домашние задания',
      icon: BookCheck,
      count: submittedCount > 0 ? String(submittedCount) : undefined,
    },
    { to: '/tutor/materials', label: 'База знаний', icon: FolderKanban },
    { to: '/tutor/tests', label: 'Тесты', icon: HelpCircle },
    { to: '/tutor/profile', label: 'Профиль', icon: UserCircle },
  ]

  const tutorFullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ')
  const displayName = tutorFullName || user?.email || 'Репетитор'
  const userInitial = (profile?.firstName || tutorFullName || user?.email || 'T').charAt(0).toUpperCase()

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex h-full flex-col justify-between p-4 bg-sidebar text-sidebar-foreground">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center justify-between px-2 py-1 pr-8">
          <Logo variant="full" size="md" />
          {!onNavigate && (
            <ThemeToggle className="text-muted-foreground hover:text-foreground" />
          )}
        </div>

        {/* User Card linking to profile */}
        <NavLink
          to="/tutor/profile"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-2.5 hover:bg-sidebar-accent/80 transition-colors group cursor-pointer"
        >
          <div className="relative">
            <Avatar size="default">
              <AvatarFallback className="bg-muted text-foreground font-semibold text-xs border border-border group-hover:border-primary">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 h-2 w-2 bg-emerald-500 ring-2 ring-sidebar" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-sidebar-foreground group-hover:text-primary transition-colors">
              {displayName}
            </p>
            {tutorFullName && user?.email && (
              <p className="truncate text-[10px] text-muted-foreground font-mono">
                {user.email}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 bg-red-accent"></span>
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                В сети • Преподаватель
              </span>
            </div>
          </div>
        </NavLink>

        {/* Navigation with sharp active indicator line & micro-badges */}
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `group relative flex items-center justify-between rounded-none px-3 py-2 text-sm font-medium transition-all duration-150 ease-out ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-foreground font-semibold'
                      : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Precision red active indicator line on left edge */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-red-accent" />
                    )}

                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                      <span>{item.label}</span>
                    </div>

                    {/* Micro details on menu items */}
                    {item.badge && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground px-1.5 py-0.2 rounded-none border border-border/80 bg-muted/40">
                        <span className="h-1 w-1 bg-red-accent" />
                        {item.badge}
                      </span>
                    )}

                    {item.count && (
                      <span className="inline-flex items-center justify-center px-1.5 py-0.2 rounded-none border border-red-500/20 text-[10px] font-mono font-semibold bg-red-soft text-red-foreground">
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

      {/* Logout button at bottom (with theme toggle on mobile) */}
      <div className="pt-4 border-t border-sidebar-border space-y-3">
        {onNavigate && (
          <div className="flex items-center justify-between px-2.5 py-1.5 text-xs text-muted-foreground border border-sidebar-border/60 rounded-md bg-sidebar-accent/20">
            <span>Тема оформления</span>
            <ThemeToggle className="text-muted-foreground hover:text-foreground" />
          </div>
        )}
        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
          onClick={() => setLogoutConfirmOpen(true)}
        >
          <LogOut className="mr-2 h-4 w-4" strokeWidth={1.75} />
          Выйти из аккаунта
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Desktop Sidebar (256px / w-64) */}
      <aside className="hidden md:flex w-64 flex-col border-r border-sidebar-border bg-sidebar shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden border-b border-border bg-card/90 backdrop-blur sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo variant="full" size="sm" />
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-none border border-border bg-muted/40 text-[10px] text-muted-foreground font-mono">
            <span className="h-1.5 w-1.5 bg-red-accent" />
            Репетитор
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Открыть меню" />
              }
            >
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-72">
              <SheetHeader className="sr-only">
                <SheetTitle>Навигация</SheetTitle>
              </SheetHeader>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content (max-w 1280px) */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1280px] mx-auto">
          <Outlet />
        </div>
      </main>

      <LogoutConfirmDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        onConfirm={handleConfirmLogout}
      />
    </div>
  )
}
