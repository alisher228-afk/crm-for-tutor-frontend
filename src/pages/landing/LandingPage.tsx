import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  CalendarDays,
  WalletCards,
  Users,
  FileText,
  Bot,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  CheckCircle2,
  Video,
  Smartphone,
  ChevronRight,
  ChevronDown,
  Clock,
  ShieldCheck,
  Zap,
  TrendingUp,
  MessageSquare,
  Check,
  RotateCcw,
} from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Interactive Showcase State
  const [activeTab, setActiveTab] = useState<'schedule' | 'balance' | 'bot' | 'homework'>('schedule')
  const [demoLessonCompleted, setDemoLessonCompleted] = useState(false)
  const [demoBalance, setDemoBalance] = useState(4)
  const [demoToast, setDemoToast] = useState<string | null>(null)

  // Calculator State
  const [calcStudents, setCalcStudents] = useState(14)
  const [calcPrice, setCalcPrice] = useState(1800)
  const [calcLessonsPerWeek, setCalcLessonsPerWeek] = useState(2)

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const handleCompleteLessonDemo = () => {
    if (!demoLessonCompleted) {
      setDemoLessonCompleted(true)
      setDemoBalance((prev) => Math.max(0, prev - 1))
      setDemoToast('✅ Урок проведён! С баланса Ани списано 1 занятие.')
      setTimeout(() => setDemoToast(null), 4000)
    } else {
      setDemoLessonCompleted(false)
      setDemoBalance(4)
      setDemoToast('🔄 Демо сброшено')
      setTimeout(() => setDemoToast(null), 2500)
    }
  }

  // Monthly income formula: students * lessons/week * 4 weeks * price
  const monthlyIncome = calcStudents * calcLessonsPerWeek * 4 * calcPrice
  const savedHours = Math.round(calcStudents * 1.3)

  const subjects = [
    '📐 Профильная математика',
    '🇬🇧 Английский B2/C1',
    '💻 Python & Веб-разработка',
    '🧪 Химия и биология',
    '⚡ Физика ОГЭ / ЕГЭ',
    '🎨 Графический дизайн',
    '🇨🇳 Китайский язык',
    '🎹 Музыка и сольфеджио',
    '📜 Обществознание и история',
    '🇩🇪 Немецкий для учёбы',
  ]

  const faqs = [
    {
      q: 'Сложно ли перенести учеников из блокнота или Excel?',
      a: 'Займёт буквально 5 минут. Добавьте имена учеников, их персональные ставки за урок и контактные данные. Всё остальное — расписание и баланс — система начнёт вести сама с первого занятия.',
    },
    {
      q: 'Как ученики получают доступ к своему кабинету?',
      a: 'Вы отправляете ученику персональную инвайт-ссылку. Он регистрируется за 30 секунд и видит только свои занятия, баланс оплаченных уроков и домашние задания. Доступа к чужим данным у него нет.',
    },
    {
      q: 'Как работает Telegram-бот для напоминаний?',
      a: 'Ученик подключает бота в один клик. Бот автоматически отправляет уведомление за 2 часа и за 15 минут до начала урока со ссылкой на звонок. Это снижает забытые занятия и опоздания более чем на 40%.',
    },
    {
      q: 'Удобно ли пользоваться сервисом со смартфона?',
      a: 'Да! Studly CRM полностью адаптирован под мобильные экраны. Вы можете быстро отметить проведённый урок, записать оплату или перенести занятие прямо с телефона между встречами.',
    },
    {
      q: 'Сколько стоит сервис и есть ли пробный период?',
      a: 'Базовый функционал доступен бесплатно сразу после регистрации. Никаких скрытых платежей и привязки банковской карты для старта не требуется.',
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-foreground selection:text-background">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 focus-visible:outline-none">
            <Logo variant="full" size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Возможности
            </a>
            <a href="#interactive-demo" className="hover:text-foreground transition-colors">
              Демо-песочница
            </a>
            <a href="#calculator" className="hover:text-foreground transition-colors">
              Калькулятор
            </a>
            <a href="#faq" className="hover:text-foreground transition-colors">
              Вопросы
            </a>
          </nav>

          {/* Desktop Auth Buttons & ThemeToggle */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'text-sm font-medium rounded-xl hover:bg-muted/80'
              )}
            >
              Войти
            </Link>
            <Link
              to="/register"
              className={cn(
                buttonVariants({ variant: 'default', size: 'sm' }),
                'text-sm font-medium rounded-xl px-4 bg-foreground text-background hover:bg-foreground/90 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]'
              )}
            >
              Попробовать бесплатно
            </Link>
          </div>

          {/* Mobile Menu & ThemeToggle */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl h-9 w-9 border-border"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Меню"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-background px-4 pt-3 pb-6 space-y-4">
            <div className="flex flex-col space-y-3 text-sm font-medium">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground py-1"
              >
                Возможности
              </a>
              <a
                href="#interactive-demo"
                onClick={() => setMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground py-1"
              >
                Демо-песочница
              </a>
              <a
                href="#calculator"
                onClick={() => setMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground py-1"
              >
                Калькулятор
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground py-1"
              >
                Частые вопросы
              </a>
            </div>
            <div className="flex flex-col gap-2 pt-3 border-t border-border">
              <Link
                to="/login"
                className={cn(buttonVariants({ variant: 'outline' }), 'w-full rounded-xl text-sm font-medium')}
                onClick={() => setMobileMenuOpen(false)}
              >
                Войти
              </Link>
              <Link
                to="/register"
                className={cn(
                  buttonVariants({ variant: 'default' }),
                  'w-full rounded-xl text-sm font-medium bg-foreground text-background hover:bg-foreground/90'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                Попробовать бесплатно
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* 2. Hero Section with Floating Animated Elements */}
        <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 border-b border-border/60 overflow-hidden">
          {/* Subtle decorative background light */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-foreground/3 rounded-full blur-[100px] pointer-events-none -z-10" />

          {/* Floating Pill Left: Telegram Notification */}
          <div className="hidden lg:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border border-border bg-card/90 backdrop-blur-md shadow-md absolute left-8 top-32 animate-float-slow z-10 text-xs font-medium max-w-[260px] text-left">
            <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <span>@StudlyBot</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-muted-foreground text-[11px] truncate">Урок через 2 часа с Аней 🔔</div>
            </div>
          </div>

          {/* Floating Pill Right: Payment Notification */}
          <div className="hidden lg:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border border-border bg-card/90 backdrop-blur-md shadow-md absolute right-8 top-36 animate-float-delayed z-10 text-xs font-medium max-w-[270px] text-left">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <WalletCards className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                +8 уроков оплачено (14 400 ₽)
              </div>
              <div className="text-muted-foreground text-[11px]">Баланс обновлён автоматически</div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7 relative">
            {/* Friendly Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card shadow-xs text-foreground text-xs font-medium">
              <span className="flex h-2 w-2 rounded-full bg-[#E11D48] animate-pulse" />
              <span>Studly CRM — умный сервис для репетиторов</span>
              <span className="hidden sm:inline text-muted-foreground">•</span>
              <span className="hidden sm:inline text-muted-foreground">Без душных таблиц</span>
            </div>

            {/* Main Punchy Headline */}
            <div className="max-w-4xl mx-auto space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.14]">
                Веди уроки в кайф, <br />
                <span className="text-muted-foreground">а не в блокноте и чатах.</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
                Интерактивное расписание, автоматический баланс занятий, домашки и Telegram-бот, который сам напишет ученику перед созвоном. Всё под рукой с телефона и ноутбука.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/register"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'w-full sm:w-auto rounded-xl font-medium text-sm h-12 px-7 bg-foreground text-background hover:bg-foreground/90 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]'
                )}
              >
                Попробовать бесплатно <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <a
                href="#interactive-demo"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'w-full sm:w-auto rounded-xl font-medium text-sm h-12 px-6 border-border hover:bg-muted/80'
                )}
              >
                Попробовать демо ниже ↓
              </a>
            </div>

            {/* Quick Student Invite Link */}
            <div className="pt-1">
              <Link
                to="/register/student"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
              >
                <span>Вы ученик? Регистрация по инвайт-коду преподавателя</span>
                <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Youthful Key Value Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-7 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </span>
                <span>Старт за 1 минуту</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Bot className="h-3.5 w-3.5" />
                </span>
                <span>Telegram-бот в комплекте</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Smartphone className="h-3.5 w-3.5" />
                </span>
                <span>Удобно с любого устройства</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
                <span>Без привязки карты</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Infinite Animated Marquee of Disciplines */}
        <section className="py-4 border-b border-border/60 bg-muted/30 overflow-hidden">
          <div className="flex gap-4 animate-marquee select-none whitespace-nowrap">
            {[...subjects, ...subjects].map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium border border-border bg-card shadow-xs text-foreground/85"
              >
                {item}
              </span>
            ))}
          </div>
        </section>

        {/* 4. Interactive Live Playground Showcase */}
        <section id="interactive-demo" className="py-16 md:py-24 border-b border-border/60">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-border bg-card text-[#E11D48]">
                <Sparkles className="h-3 w-3" />
                <span>Интерактивная песочница</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Попробуйте интерфейс прямо сейчас
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
                Переключайте вкладки и нажимайте кнопки, чтобы увидеть, как Studly автоматизирует рутину.
              </p>
            </div>

            {/* Showcase Container */}
            <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden text-left transition-all">
              {/* Window Header with Clickable Tabs */}
              <div className="bg-muted/50 border-b border-border px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#E11D48]/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
                  </div>
                  <div className="text-xs text-muted-foreground bg-background/80 px-2.5 py-1 rounded-md border border-border flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-[11px]">app.studlycrm.ru/live-demo</span>
                  </div>
                </div>

                {/* Interactive Mode Switcher Tabs */}
                <div className="flex items-center gap-1 bg-background/80 p-1 rounded-xl border border-border">
                  <button
                    onClick={() => setActiveTab('schedule')}
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded-lg transition-all',
                      activeTab === 'schedule'
                        ? 'bg-foreground text-background shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    📅 Расписание
                  </button>
                  <button
                    onClick={() => setActiveTab('balance')}
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded-lg transition-all',
                      activeTab === 'balance'
                        ? 'bg-foreground text-background shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    💰 Баланс оплат
                  </button>
                  <button
                    onClick={() => setActiveTab('bot')}
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded-lg transition-all',
                      activeTab === 'bot'
                        ? 'bg-foreground text-background shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    🤖 Telegram-бот
                  </button>
                  <button
                    onClick={() => setActiveTab('homework')}
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded-lg transition-all',
                      activeTab === 'homework'
                        ? 'bg-foreground text-background shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    📝 Домашки
                  </button>
                </div>
              </div>

              {/* Toast Feedback Notification inside Mockup */}
              {demoToast && (
                <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-between animate-fadeIn">
                  <span>{demoToast}</span>
                  <span className="text-[11px] opacity-75">Автоматический расчёт</span>
                </div>
              )}

              {/* Tab 1: SCHEDULE */}
              {activeTab === 'schedule' && (
                <div className="p-4 sm:p-6 bg-background space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
                    <div>
                      <h3 className="text-base font-bold">Расписание занятий на сегодня</h3>
                      <p className="text-xs text-muted-foreground">
                        Нажмите кнопку справа на карточке, чтобы смоделировать проведение урока
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCompleteLessonDemo}
                      className="rounded-xl text-xs h-8 gap-1.5 self-start sm:self-center"
                    >
                      <RotateCcw className="h-3 w-3" />
                      {demoLessonCompleted ? 'Сбросить демо' : 'Провести урок Ани'}
                    </Button>
                  </div>

                  {/* Interactive Lesson Card */}
                  <div
                    className={cn(
                      'p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs',
                      demoLessonCompleted
                        ? 'border-emerald-500/40 bg-emerald-500/5'
                        : 'border-border border-l-4 border-l-[#E11D48] bg-card hover:border-border/80'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 text-center shrink-0">
                        <div className="text-base font-bold font-mono">15:00</div>
                        <div className="text-[11px] text-muted-foreground">60 мин</div>
                      </div>
                      <div className="h-8 w-px bg-border shrink-0" />
                      <div>
                        <div className="text-sm font-semibold flex items-center gap-2">
                          <span>Анна Смирнова</span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            Английский B2
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Баланс:{' '}
                          <span
                            className={cn(
                              'font-bold transition-all',
                              demoLessonCompleted ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'
                            )}
                          >
                            {demoBalance} {demoBalance === 1 ? 'урок' : 'урока'}
                          </span>
                          {demoLessonCompleted && ' (было 4, 1 списался)'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      {demoLessonCompleted ? (
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5" />
                          <span>Проведён • Списано</span>
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={handleCompleteLessonDemo}
                          className="rounded-xl text-xs h-8 px-3 bg-foreground text-background hover:bg-foreground/90 gap-1.5"
                        >
                          <Check className="h-3 w-3" />
                          <span>Отметить проведённым</span>
                        </Button>
                      )}
                      <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground border border-border px-2 py-1 rounded-lg bg-background">
                        <Video className="h-3 w-3 text-primary" />
                        <span>Zoom</span>
                      </div>
                    </div>
                  </div>

                  {/* Second Static Lesson */}
                  <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 text-center shrink-0">
                        <div className="text-base font-bold font-mono">16:30</div>
                        <div className="text-[11px] text-muted-foreground">60 мин</div>
                      </div>
                      <div className="h-8 w-px bg-border shrink-0" />
                      <div>
                        <div className="text-sm font-semibold flex items-center gap-2">
                          <span>Группа «ОГЭ Математика»</span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            4 ученика
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Геометрия • Бот отправил ссылку за 2 часа
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center gap-1.5">
                        <Bot className="h-3 w-3" />
                        <span>Ученики подтвердили</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: BALANCE & PAYMENTS */}
              {activeTab === 'balance' && (
                <div className="p-4 sm:p-6 bg-background space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <div>
                      <h3 className="text-base font-bold">Балансы учеников и абонементы</h3>
                      <p className="text-xs text-muted-foreground">Всегда видно, кому пора пополнить абонемент</p>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Общий доход: 184 000 ₽
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">Анна Смирнова</span>
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 font-mono">
                          {demoBalance} из 8 уроков
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(demoBalance / 8) * 100}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                        <span>Английский B2 • 1 800 ₽/урок</span>
                        <span className="text-foreground font-medium">Оплачено</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-[#E11D48]/30 bg-[#E11D48]/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">Максим Волков</span>
                        <span className="text-xs font-bold text-[#E11D48] font-mono">1 из 8 уроков</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div className="bg-[#E11D48] h-2 rounded-full" style={{ width: '12.5%' }} />
                      </div>
                      <div className="text-[11px] text-[#E11D48] flex items-center justify-between font-medium">
                        <span>Физика ЕГЭ • Заканчивается абонемент</span>
                        <span className="underline cursor-pointer">Выставить счёт</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">Егор Михайлов</span>
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 font-mono">
                          6 из 8 уроков
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '75%' }} />
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                        <span>Python Junior • 2 200 ₽/урок</span>
                        <span className="text-foreground font-medium">Оплачено</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">Полина Зайцева</span>
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 font-mono">
                          8 из 8 уроков
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }} />
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                        <span>Подготовка к ОГЭ • 1 600 ₽/урок</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Новый пакет</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: TELEGRAM BOT */}
              {activeTab === 'bot' && (
                <div className="p-4 sm:p-6 bg-background space-y-4">
                  <div className="pb-2 border-b border-border/60">
                    <h3 className="text-base font-bold">Автоматические диалоги в Telegram</h3>
                    <p className="text-xs text-muted-foreground">
                      Бот сам пишет ученикам от имени сервиса и напоминает о ссылке на созвон
                    </p>
                  </div>

                  <div className="max-w-md mx-auto bg-card rounded-2xl border border-border p-4 space-y-3 shadow-xs">
                    <div className="flex items-center gap-2 pb-2 border-b border-border text-xs font-medium text-muted-foreground">
                      <Bot className="h-4 w-4 text-blue-500" />
                      <span>Диалог с учеником (Аня Смирнова)</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {/* Bot message */}
                      <div className="bg-muted/70 p-3 rounded-xl rounded-tl-xs max-w-[85%] space-y-1">
                        <div className="font-semibold text-foreground flex items-center gap-1">
                          <span>Studly Bot</span>
                          <span className="text-[10px] text-muted-foreground font-normal">13:00</span>
                        </div>
                        <p className="text-muted-foreground">
                          👋 Привет, Аня! Сегодня в 15:00 у вас занятие по Английскому языку.
                        </p>
                        <p className="text-primary font-medium underline">Ссылка на Zoom: meet.google.com/abc</p>
                      </div>

                      {/* Student confirmation button */}
                      <div className="flex justify-end">
                        <div className="bg-foreground text-background px-3 py-1.5 rounded-xl rounded-tr-xs text-xs font-medium">
                          ✓ Да, буду на занятии!
                        </div>
                      </div>

                      {/* Bot answer */}
                      <div className="bg-muted/70 p-3 rounded-xl rounded-tl-xs max-w-[85%] space-y-1">
                        <p className="text-muted-foreground">
                          Отлично! Преподаватель уже предупреждён. До встречи на уроке ✨
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: HOMEWORK */}
              {activeTab === 'homework' && (
                <div className="p-4 sm:p-6 bg-background space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <div>
                      <h3 className="text-base font-bold">Домашние задания и файлы</h3>
                      <p className="text-xs text-muted-foreground">Никаких потерянных фото тетрадей в переписках</p>
                    </div>
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                      2 на проверке
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold flex items-center gap-2">
                          <span>ДЗ №14: Past Perfect & Conditionals</span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            Сдано на проверку
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Ученик: Анна Смирнова • Файл: <span className="underline">essay_smirnova.docx</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-xl text-xs h-8">
                        Проверить
                      </Button>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold flex items-center gap-2">
                          <span>Тригонометрия (профиль, задания 1-5)</span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            Проверено (5/5)
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Ученик: Максим Волков • Комментарий: «Отличный ход решения!»
                        </div>
                      </div>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">✓ Зачтено</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 5. Features Bento Grid */}
        <section id="features" className="py-20 border-b border-border/60 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-border bg-card text-[#E11D48]">
                <Zap className="h-3 w-3" />
                <span>Возможности Studly CRM</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Всё, чтобы вести практику без головной боли
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Инструменты, созданные специально под ежедневную рутину репетитора. Никакого перегруженного функционала для корпораций — только то, что реально нужно каждый день.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl border border-border bg-card space-y-3 shadow-xs hover:shadow-md hover:border-foreground/30 hover:-translate-y-1 transition-all duration-300">
                <div className="h-10 w-10 rounded-xl bg-foreground/5 text-foreground flex items-center justify-center">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Умное расписание</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Наглядная сетка по дням недели. Система сама следит, чтобы уроки не накладывались друг на друга, и сохраняет ссылки на созвоны в один клик.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl border border-border bg-card space-y-3 shadow-xs hover:shadow-md hover:border-foreground/30 hover:-translate-y-1 transition-all duration-300">
                <div className="h-10 w-10 rounded-xl bg-foreground/5 text-foreground flex items-center justify-center">
                  <WalletCards className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Баланс уроков и оплаты</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Провели урок — баланс ученика списывается автоматически. Всегда видно, кто оплатил абонемент, а у кого уроки подходят к концу.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl border border-border bg-card space-y-3 shadow-xs hover:shadow-md hover:border-foreground/30 hover:-translate-y-1 transition-all duration-300">
                <div className="h-10 w-10 rounded-xl bg-foreground/5 text-foreground flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Карточки учеников и групп</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Вся информация в одном месте: индивидуальные ставки за урок, предмет, контакты родителей, история оплат и персональные заметки.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-2xl border border-border bg-card space-y-3 shadow-xs hover:shadow-md hover:border-foreground/30 hover:-translate-y-1 transition-all duration-300">
                <div className="h-10 w-10 rounded-xl bg-foreground/5 text-[#E11D48] flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Telegram-бот напоминаний</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Бот автоматически напоминает ученикам о предстоящем уроке за 2 часа. Больше никаких созвонов «ты где?» и забытых занятий.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-6 rounded-2xl border border-border bg-card space-y-3 shadow-xs hover:shadow-md hover:border-foreground/30 hover:-translate-y-1 transition-all duration-300">
                <div className="h-10 w-10 rounded-xl bg-foreground/5 text-foreground flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Домашки и файлы</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Прикрепляйте материалы и ставьте дедлайны прямо в карточке урока. Ученик сдаёт решение в платформу, а вы проверяете без потери файлов в мессенджерах.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-6 rounded-2xl border border-border bg-card space-y-3 shadow-xs hover:shadow-md hover:border-foreground/30 hover:-translate-y-1 transition-all duration-300">
                <div className="h-10 w-10 rounded-xl bg-foreground/5 text-amber-500 flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Личный кабинет ученика</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Отправьте ученику инвайт-ссылку: он заходит в свой чистый кабинет, видит расписание, остаток оплаченных занятий и свои домашние задания.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Interactive Tutor Income & Time Calculator */}
        <section id="calculator" className="py-20 border-b border-border/60">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-border bg-card text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Интерактивный калькулятор</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Посчитайте выгоду от порядка в расписании
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
                Узнайте, сколько времени и денег освободится, если перестать тратить часы на рутину и переписки.
              </p>
            </div>

            <div className="p-6 sm:p-10 rounded-3xl border border-border bg-card shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Controls */}
              <div className="space-y-6">
                {/* Students Control */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span>Количество учеников:</span>
                    <span className="font-bold text-base text-foreground font-mono">{calcStudents} чел.</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="40"
                    step="1"
                    value={calcStudents}
                    onChange={(e) => setCalcStudents(Number(e.target.value))}
                    className="w-full accent-foreground cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>3 ученика</span>
                    <span>20 учеников</span>
                    <span>40 учеников</span>
                  </div>
                </div>

                {/* Price Control */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span>Стоимость одного урока:</span>
                    <span className="font-bold text-base text-foreground font-mono">{calcPrice.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <input
                    type="range"
                    min="800"
                    max="5000"
                    step="100"
                    value={calcPrice}
                    onChange={(e) => setCalcPrice(Number(e.target.value))}
                    className="w-full accent-foreground cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>800 ₽</span>
                    <span>2 500 ₽</span>
                    <span>5 000 ₽</span>
                  </div>
                </div>

                {/* Lessons per week */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span>Уроков в неделю на ученика:</span>
                    <span className="font-bold text-base text-foreground font-mono">{calcLessonsPerWeek} ур./нед.</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((num) => (
                      <button
                        key={num}
                        onClick={() => setCalcLessonsPerWeek(num)}
                        className={cn(
                          'flex-1 py-2 text-xs font-semibold rounded-xl border transition-all',
                          calcLessonsPerWeek === num
                            ? 'bg-foreground text-background border-foreground shadow-xs'
                            : 'border-border text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {num} {num === 1 ? 'урок' : 'урока'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Calculated Result Card */}
              <div className="p-6 rounded-2xl border border-border bg-muted/30 space-y-5 text-center sm:text-left">
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Ваш расчётный доход
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-foreground font-mono tracking-tight">
                    {monthlyIncome.toLocaleString('ru-RU')} ₽ <span className="text-sm font-normal text-muted-foreground">/ мес</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/80 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-blue-500" />
                      Сэкономлено на рутине:
                    </span>
                    <span className="font-bold text-foreground font-mono">~{savedHours} часов / месяц</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      Забытых или утерянных оплат:
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">0 ₽</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Bot className="h-3.5 w-3.5 text-[#E11D48]" />
                      Напоминаний ученикам:
                    </span>
                    <span className="font-bold text-foreground font-mono">100% автоматически</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/register"
                    className={cn(
                      buttonVariants({ size: 'default' }),
                      'w-full rounded-xl text-xs font-semibold h-11 bg-foreground text-background hover:bg-foreground/90'
                    )}
                  >
                    Попробовать со своими учениками →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Comparison Section ("Жиза репетитора: До и После") */}
        <section className="py-20 border-b border-border/60 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-border bg-card text-[#E11D48]">
                <span>Реальная разница</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Как меняется жизнь после перехода в Studly
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Left: The Old Way (Chaos) */}
              <div className="p-6 sm:p-8 rounded-2xl border border-destructive/30 bg-destructive/5 space-y-4">
                <h4 className="text-base font-bold text-destructive flex items-center gap-2">
                  <span>🤦‍♂️ Как обычно бывает (блокнот и чаты)</span>
                </h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <span className="text-destructive font-bold">✕</span>
                    <span>Родители пишут: «А сколько занятий у нас осталось? Мы точно не платили?» Приходится искать выписки в банке.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-destructive font-bold">✕</span>
                    <span>Ученик забыл про созвон или вспомнил за 5 минут, когда вы уже ждёте его в Zoom.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-destructive font-bold">✕</span>
                    <span>Домашки разбросаны по 5 мессенджерам, фото тетрадей теряются в галерее.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-destructive font-bold">✕</span>
                    <span>Страх случайно поставить двух учеников на одно и то же время в пятницу вечером.</span>
                  </li>
                </ul>
              </div>

              {/* Right: The Studly Way (Smooth) */}
              <div className="p-6 sm:p-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-4">
                <h4 className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <span>🚀 Со Studly CRM (всё по полочкам)</span>
                </h4>
                <ul className="space-y-3 text-sm text-foreground/90">
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Ученик сам заходит в кабинет и видит точный баланс: «Осталось 3 урока». Вопросов ноль.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Telegram-бот заранее отправляет ученику ссылку на урок. Посещаемость растёт, вы спокойны.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Все файлы и ответы прикреплены прямо к уроку. Ничего не теряется в переписках.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Сетка занятий мгновенно предупредит о наложении и покажет свободные окна.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Interactive FAQ Accordion */}
        <section id="faq" className="py-20 border-b border-border/60">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-border bg-card text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span>Ответы на вопросы</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Часто задаваемые вопросы
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx
                return (
                  <div
                    key={idx}
                    className="border border-border bg-card rounded-2xl overflow-hidden transition-all shadow-xs"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base hover:text-foreground/80 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
                          isOpen && 'rotate-180 text-foreground'
                        )}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-0 text-sm text-muted-foreground leading-relaxed animate-fadeIn">
                        {faq.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* 9. Final Call To Action Banner */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-border bg-card p-8 sm:p-14 text-center space-y-6 shadow-sm relative overflow-hidden">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-border bg-muted/60 text-foreground">
                <Sparkles className="h-3 w-3 text-[#E11D48]" />
                <span>Начните работать комфортно уже сегодня</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Наведите идеальный порядок в репетиторской практике
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                Создайте кабинет репетитора за 1 минуту. Оцените, насколько проще становится работать, когда всё организовано в одной системе.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  to="/register"
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'rounded-xl text-sm font-medium h-12 px-8 bg-foreground text-background hover:bg-foreground/90 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]'
                  )}
                >
                  Создать кабинет бесплатно →
                </Link>
                <Link
                  to="/login"
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'rounded-xl text-sm font-medium h-12 px-6 border-border hover:bg-muted/80'
                  )}
                >
                  Уже есть аккаунт? Войти
                </Link>
              </div>
              <div className="pt-2">
                <Link
                  to="/register/student"
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                >
                  <span>Вы ученик? Регистрация по инвайт-коду преподавателя</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 10. Footer */}
      <footer className="border-t border-border bg-muted/10 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Logo variant="full" size="sm" />
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium">
            <a href="#features" className="hover:text-foreground transition-colors">Возможности</a>
            <a href="#interactive-demo" className="hover:text-foreground transition-colors">Демо-песочница</a>
            <a href="#calculator" className="hover:text-foreground transition-colors">Калькулятор</a>
            <a href="#faq" className="hover:text-foreground transition-colors">Вопросы</a>
            <Link to="/login" className="hover:text-foreground transition-colors">Войти</Link>
            <Link to="/register" className="hover:text-foreground transition-colors">Регистрация</Link>
          </div>

          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Studly CRM. Для тех, кто учит и учится.
          </div>
        </div>
      </footer>
    </div>
  )
}
