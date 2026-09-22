import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  GraduationCap,
  Menu,
} from 'lucide-react'

const studentNavItems = [
  { to: '/student', end: true, label: 'Мой профиль', icon: UserCircle },
  { to: '/student/lessons', end: false, label: 'Расписание', icon: Calendar },
  { to: '/student/homework', end: false, label: 'Домашка', icon: BookOpen },
  { to: '/student/payments', end: false, label: 'Оплаты и баланс', icon: Receipt },
]

export function StudentLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    setMobileOpen(false)
    logout()
    navigate('/login')
  }

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'S'

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto max-w-5xl flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Logo & Role Badge */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base">CRM for Tutor</span>
              <Badge variant="secondary" className="text-xs">
                Ученик
              </Badge>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
            {studentNavItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-background text-foreground shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>

          {/* User Info & Logout (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar size="sm">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-muted-foreground max-w-[150px] truncate">
                {user?.email}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Выйти</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon-sm" aria-label="Открыть меню" />
                }
              >
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="right" className="p-0 w-72 flex flex-col justify-between">
                <SheetHeader className="sr-only">
                  <SheetTitle>Меню ученика</SheetTitle>
                </SheetHeader>

                <div className="p-5 space-y-6">
                  {/* Brand & User Card */}
                  <div className="flex items-center gap-3">
                    <Avatar size="default">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground">
                        {user?.email || 'Ученик'}
                      </p>
                      <Badge variant="secondary" className="mt-0.5 text-[10px] px-1.5 py-0">
                        Кабинет ученика
                      </Badge>
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
                            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                              isActive
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`
                          }
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </NavLink>
                      )
                    })}
                  </nav>
                </div>

                {/* Logout Button */}
                <div className="p-5 border-t border-border">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Выйти из аккаунта
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}
