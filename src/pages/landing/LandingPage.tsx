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
import { LanguageToggle } from '@/components/LanguageToggle'
import { useLanguage } from '@/i18n'

export function LandingPage() {
  const { t, language } = useLanguage()
  const currencySymbol = language === 'kk' ? '₸' : language === 'en' ? '$' : '₽'
  const numberLocale = language === 'en' ? 'en-US' : language === 'kk' ? 'kk-KZ' : 'ru-RU'
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
      setDemoToast(t('landing.demo_toast_completed'))
      setTimeout(() => setDemoToast(null), 4000)
    } else {
      setDemoLessonCompleted(false)
      setDemoBalance(4)
      setDemoToast(t('landing.demo_toast_reset'))
      setTimeout(() => setDemoToast(null), 2500)
    }
  }

  // Monthly income formula: students * lessons/week * 4 weeks * price
  const monthlyIncome = calcStudents * calcLessonsPerWeek * 4 * calcPrice
  const savedHours = Math.round(calcStudents * 1.3)

  const subjects = [
    t('landing.subject_math'),
    t('landing.subject_english'),
    t('landing.subject_python'),
    t('landing.subject_chemistry'),
    t('landing.subject_physics'),
    t('landing.subject_design'),
    t('landing.subject_chinese'),
    t('landing.subject_music'),
    t('landing.subject_history'),
    t('landing.subject_german'),
  ]

  const faqs = [
    {
      q: t('landing.faq_q1'),
      a: t('landing.faq_a1'),
    },
    {
      q: t('landing.faq_q2'),
      a: t('landing.faq_a2'),
    },
    {
      q: t('landing.faq_q3'),
      a: t('landing.faq_a3'),
    },
    {
      q: t('landing.faq_q4'),
      a: t('landing.faq_a4'),
    },
    {
      q: t('landing.faq_q5'),
      a: t('landing.faq_a5'),
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
              {t('landing.nav_features')}
            </a>
            <a href="#interactive-demo" className="hover:text-foreground transition-colors">
              {t('landing.nav_demo')}
            </a>
            <a href="#calculator" className="hover:text-foreground transition-colors">
              {t('landing.nav_calculator')}
            </a>
            <a href="#faq" className="hover:text-foreground transition-colors">
              {t('landing.nav_faq')}
            </a>
          </nav>

          {/* Desktop Auth Buttons, LanguageToggle & ThemeToggle */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
            <Link
              to="/login"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'text-sm font-medium rounded-xl hover:bg-muted/80'
              )}
            >
              {t('landing.nav_login')}
            </Link>
            <Link
              to="/register"
              className={cn(
                buttonVariants({ variant: 'default', size: 'sm' }),
                'text-sm font-medium rounded-xl px-4 bg-foreground text-background hover:bg-foreground/90 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]'
              )}
            >
              {t('landing.nav_try_free')}
            </Link>
          </div>

          {/* Mobile Menu & LanguageToggle / ThemeToggle */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl h-9 w-9 border-border"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={t('landing.nav_menu_aria')}
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
                {t('landing.nav_features')}
              </a>
              <a
                href="#interactive-demo"
                onClick={() => setMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground py-1"
              >
                {t('landing.nav_demo')}
              </a>
              <a
                href="#calculator"
                onClick={() => setMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground py-1"
              >
                {t('landing.nav_calculator')}
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground py-1"
              >
                {t('landing.nav_faq')}
              </a>
            </div>
            <div className="flex flex-col gap-2 pt-3 border-t border-border">
              <Link
                to="/login"
                className={cn(buttonVariants({ variant: 'outline' }), 'w-full rounded-xl text-sm font-medium')}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('landing.nav_login')}
              </Link>
              <Link
                to="/register"
                className={cn(
                  buttonVariants({ variant: 'default' }),
                  'w-full rounded-xl text-sm font-medium bg-foreground text-background hover:bg-foreground/90'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('landing.nav_try_free')}
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
              <div className="text-muted-foreground text-[11px] truncate">{t('landing.hero_notification_lesson')}</div>
            </div>
          </div>

          {/* Floating Pill Right: Payment Notification */}
          <div className="hidden lg:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border border-border bg-card/90 backdrop-blur-md shadow-md absolute right-8 top-36 animate-float-delayed z-10 text-xs font-medium max-w-[270px] text-left">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <WalletCards className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                {t('landing.hero_notification_payment')}
              </div>
              <div className="text-muted-foreground text-[11px]">{t('landing.hero_notification_balance')}</div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7 relative">
            {/* Friendly Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card shadow-xs text-foreground text-xs font-medium">
              <span className="flex h-2 w-2 rounded-full bg-[#E11D48] animate-pulse" />
              <span>{t('landing.hero_badge_service')}</span>
              <span className="hidden sm:inline text-muted-foreground">•</span>
              <span className="hidden sm:inline text-muted-foreground">{t('landing.hero_badge_tables')}</span>
            </div>

            {/* Main Punchy Headline */}
            <div className="max-w-4xl mx-auto space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.14]">
                {t('landing.hero_title_part1')} <br />
                <span className="text-muted-foreground">{t('landing.hero_title_part2')}</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
                {t('landing.hero_subtitle')}
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
                {t('landing.hero_cta_free')} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <a
                href="#interactive-demo"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'w-full sm:w-auto rounded-xl font-medium text-sm h-12 px-6 border-border hover:bg-muted/80'
                )}
              >
                {t('landing.hero_cta_demo')}
              </a>
            </div>

            {/* Quick Student Invite Link */}
            <div className="pt-1">
              <Link
                to="/register/student"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
              >
                <span>{t('landing.hero_student_invite_prompt')}</span>
                <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Youthful Key Value Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-7 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </span>
                <span>{t('landing.hero_badge_fast_start')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Bot className="h-3.5 w-3.5" />
                </span>
                <span>{t('landing.hero_badge_telegram')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Smartphone className="h-3.5 w-3.5" />
                </span>
                <span>{t('landing.hero_badge_any_device')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
                <span>{t('landing.hero_badge_no_card')}</span>
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
                <span>{t('landing.demo_section_badge')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {t('landing.demo_section_title')}
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
                {t('landing.demo_section_subtitle')}
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
                    {t('landing.demo_tab_schedule')}
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
                    {t('landing.demo_tab_balance')}
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
                    {t('landing.demo_tab_bot')}
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
                    {t('landing.demo_tab_homework')}
                  </button>
                </div>
              </div>

              {/* Toast Feedback Notification inside Mockup */}
              {demoToast && (
                <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-between animate-fadeIn">
                  <span>{demoToast}</span>
                  <span className="text-[11px] opacity-75">{t('landing.demo_auto_calc_badge')}</span>
                </div>
              )}

              {/* Tab 1: SCHEDULE */}
              {activeTab === 'schedule' && (
                <div className="p-4 sm:p-6 bg-background space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
                    <div>
                      <h3 className="text-base font-bold">{t('landing.demo_schedule_title')}</h3>
                      <p className="text-xs text-muted-foreground">
                        {t('landing.demo_schedule_subtitle')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCompleteLessonDemo}
                      className="rounded-xl text-xs h-8 gap-1.5 self-start sm:self-center"
                    >
                      <RotateCcw className="h-3 w-3" />
                      {demoLessonCompleted ? t('landing.demo_btn_reset') : t('landing.demo_btn_conduct_anna')}
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
                        <div className="text-[11px] text-muted-foreground">{t('landing.demo_duration_60')}</div>
                      </div>
                      <div className="h-8 w-px bg-border shrink-0" />
                      <div>
                        <div className="text-sm font-semibold flex items-center gap-2">
                          <span>{t('landing.demo_anna_name')}</span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {t('landing.demo_anna_subject')}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {t('landing.demo_balance_label')}{' '}
                          <span
                            className={cn(
                              'font-bold transition-all',
                              demoLessonCompleted ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'
                            )}
                          >
                            {demoBalance === 1
                              ? t('landing.demo_balance_lessons_1', { count: demoBalance })
                              : t('landing.demo_balance_lessons_few', { count: demoBalance })}
                          </span>
                          {demoLessonCompleted && ` ${t('landing.demo_balance_deducted_note')}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      {demoLessonCompleted ? (
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5" />
                          <span>{t('landing.demo_status_conducted')}</span>
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={handleCompleteLessonDemo}
                          className="rounded-xl text-xs h-8 px-3 bg-foreground text-background hover:bg-foreground/90 gap-1.5"
                        >
                          <Check className="h-3 w-3" />
                          <span>{t('landing.demo_btn_mark_conducted')}</span>
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
                        <div className="text-[11px] text-muted-foreground">{t('landing.demo_duration_60')}</div>
                      </div>
                      <div className="h-8 w-px bg-border shrink-0" />
                      <div>
                        <div className="text-sm font-semibold flex items-center gap-2">
                          <span>{t('landing.demo_group_name')}</span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            {t('landing.demo_group_students_count')}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {t('landing.demo_group_desc')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center gap-1.5">
                        <Bot className="h-3 w-3" />
                        <span>{t('landing.demo_students_confirmed')}</span>
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
                      <h3 className="text-base font-bold">{t('landing.demo_balance_tab_title')}</h3>
                      <p className="text-xs text-muted-foreground">{t('landing.demo_balance_tab_subtitle')}</p>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {t('landing.demo_total_income_label')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">{t('landing.demo_anna_name')}</span>
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 font-mono">
                          {t('landing.demo_anna_balance', { count: demoBalance })}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(demoBalance / 8) * 100}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                        <span>{t('landing.demo_anna_price')}</span>
                        <span className="text-foreground font-medium">{t('landing.demo_paid_badge')}</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-[#E11D48]/30 bg-[#E11D48]/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">{t('landing.demo_maxim_name')}</span>
                        <span className="text-xs font-bold text-[#E11D48] font-mono">{t('landing.demo_maxim_balance')}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div className="bg-[#E11D48] h-2 rounded-full" style={{ width: '12.5%' }} />
                      </div>
                      <div className="text-[11px] text-[#E11D48] flex items-center justify-between font-medium">
                        <span>{t('landing.demo_maxim_desc')}</span>
                        <span className="underline cursor-pointer">{t('landing.demo_btn_send_invoice')}</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">{t('landing.demo_egor_name')}</span>
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 font-mono">
                          {t('landing.demo_egor_balance')}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '75%' }} />
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                        <span>{t('landing.demo_egor_desc')}</span>
                        <span className="text-foreground font-medium">{t('landing.demo_paid_badge')}</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">{t('landing.demo_polina_name')}</span>
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 font-mono">
                          {t('landing.demo_polina_balance')}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }} />
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                        <span>{t('landing.demo_polina_desc')}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">{t('landing.demo_new_package_badge')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: TELEGRAM BOT */}
              {activeTab === 'bot' && (
                <div className="p-4 sm:p-6 bg-background space-y-4">
                  <div className="pb-2 border-b border-border/60">
                    <h3 className="text-base font-bold">{t('landing.demo_bot_tab_title')}</h3>
                    <p className="text-xs text-muted-foreground">
                      {t('landing.demo_bot_tab_subtitle')}
                    </p>
                  </div>

                  <div className="max-w-md mx-auto bg-card rounded-2xl border border-border p-4 space-y-3 shadow-xs">
                    <div className="flex items-center gap-2 pb-2 border-b border-border text-xs font-medium text-muted-foreground">
                      <Bot className="h-4 w-4 text-blue-500" />
                      <span>{t('landing.demo_bot_chat_title')}</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {/* Bot message */}
                      <div className="bg-muted/70 p-3 rounded-xl rounded-tl-xs max-w-[85%] space-y-1">
                        <div className="font-semibold text-foreground flex items-center gap-1">
                          <span>Studly Bot</span>
                          <span className="text-[10px] text-muted-foreground font-normal">13:00</span>
                        </div>
                        <p className="text-muted-foreground">
                          {t('landing.demo_bot_msg_greeting')}
                        </p>
                        <p className="text-primary font-medium underline">{t('landing.demo_bot_msg_link')}</p>
                      </div>

                      {/* Student confirmation button */}
                      <div className="flex justify-end">
                        <div className="bg-foreground text-background px-3 py-1.5 rounded-xl rounded-tr-xs text-xs font-medium">
                          {t('landing.demo_bot_btn_confirm')}
                        </div>
                      </div>

                      {/* Bot answer */}
                      <div className="bg-muted/70 p-3 rounded-xl rounded-tl-xs max-w-[85%] space-y-1">
                        <p className="text-muted-foreground">
                          {t('landing.demo_bot_reply')}
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
                      <h3 className="text-base font-bold">{t('landing.demo_hw_tab_title')}</h3>
                      <p className="text-xs text-muted-foreground">{t('landing.demo_hw_tab_subtitle')}</p>
                    </div>
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                      {t('landing.demo_hw_review_count')}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold flex items-center gap-2">
                          <span>{t('landing.demo_hw_1_title')}</span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            {t('landing.demo_hw_1_status')}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t('landing.demo_hw_1_meta', { file: 'essay_smirnova.docx' })}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-xl text-xs h-8">
                        {t('landing.demo_hw_1_btn_check')}
                      </Button>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold flex items-center gap-2">
                          <span>{t('landing.demo_hw_2_title')}</span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            {t('landing.demo_hw_2_status')}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t('landing.demo_hw_2_meta')}
                        </div>
                      </div>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{t('landing.demo_hw_2_accepted')}</span>
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
                <span>{t('landing.features_badge')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {t('landing.features_title')}
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                {t('landing.features_subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl border border-border bg-card space-y-3 shadow-xs hover:shadow-md hover:border-foreground/30 hover:-translate-y-1 transition-all duration-300">
                <div className="h-10 w-10 rounded-xl bg-foreground/5 text-foreground flex items-center justify-center">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">{t('landing.feat_schedule_title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('landing.feat_schedule_desc')}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl border border-border bg-card space-y-3 shadow-xs hover:shadow-md hover:border-foreground/30 hover:-translate-y-1 transition-all duration-300">
                <div className="h-10 w-10 rounded-xl bg-foreground/5 text-foreground flex items-center justify-center">
                  <WalletCards className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">{t('landing.feat_balance_title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('landing.feat_balance_desc')}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl border border-border bg-card space-y-3 shadow-xs hover:shadow-md hover:border-foreground/30 hover:-translate-y-1 transition-all duration-300">
                <div className="h-10 w-10 rounded-xl bg-foreground/5 text-foreground flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">{t('landing.feat_students_title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('landing.feat_students_desc')}
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-2xl border border-border bg-card space-y-3 shadow-xs hover:shadow-md hover:border-foreground/30 hover:-translate-y-1 transition-all duration-300">
                <div className="h-10 w-10 rounded-xl bg-foreground/5 text-[#E11D48] flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">{t('landing.feat_bot_title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('landing.feat_bot_desc')}
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-6 rounded-2xl border border-border bg-card space-y-3 shadow-xs hover:shadow-md hover:border-foreground/30 hover:-translate-y-1 transition-all duration-300">
                <div className="h-10 w-10 rounded-xl bg-foreground/5 text-foreground flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">{t('landing.feat_homework_title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('landing.feat_homework_desc')}
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-6 rounded-2xl border border-border bg-card space-y-3 shadow-xs hover:shadow-md hover:border-foreground/30 hover:-translate-y-1 transition-all duration-300">
                <div className="h-10 w-10 rounded-xl bg-foreground/5 text-amber-500 flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">{t('landing.feat_cabinet_title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('landing.feat_cabinet_desc')}
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
                <span>{t('landing.calc_badge')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {t('landing.calc_title')}
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
                {t('landing.calc_subtitle')}
              </p>
            </div>

            <div className="p-6 sm:p-10 rounded-3xl border border-border bg-card shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Controls */}
              <div className="space-y-6">
                {/* Students Control */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span>{t('landing.calc_students_label')}</span>
                    <span className="font-bold text-base text-foreground font-mono">
                      {t('landing.calc_students_unit', { count: calcStudents })}
                    </span>
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
                    <span>{t('landing.calc_students_3')}</span>
                    <span>{t('landing.calc_students_20')}</span>
                    <span>{t('landing.calc_students_40')}</span>
                  </div>
                </div>

                {/* Price Control */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span>{t('landing.calc_price_label')}</span>
                    <span className="font-bold text-base text-foreground font-mono">
                      {calcPrice.toLocaleString(numberLocale)} {currencySymbol}
                    </span>
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
                    <span>{`800 ${currencySymbol}`}</span>
                    <span>{`2 500 ${currencySymbol}`}</span>
                    <span>{`5 000 ${currencySymbol}`}</span>
                  </div>
                </div>

                {/* Lessons per week */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span>{t('landing.calc_lessons_week_label')}</span>
                    <span className="font-bold text-base text-foreground font-mono">
                      {t('landing.calc_lessons_week_unit', { count: calcLessonsPerWeek })}
                    </span>
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
                        {num === 1
                          ? t('landing.calc_lessons_count_1', { count: num })
                          : t('landing.calc_lessons_count_few', { count: num })}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Calculated Result Card */}
              <div className="p-6 rounded-2xl border border-border bg-muted/30 space-y-5 text-center sm:text-left">
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    {t('landing.calc_income_title')}
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-foreground font-mono tracking-tight">
                    {monthlyIncome.toLocaleString(numberLocale)} {currencySymbol}{' '}
                    <span className="text-sm font-normal text-muted-foreground">
                      {t('landing.calc_income_unit')}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/80 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-blue-500" />
                      {t('landing.calc_time_saved_label')}
                    </span>
                    <span className="font-bold text-foreground font-mono">
                      {t('landing.calc_time_saved_value', { hours: savedHours })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      {t('landing.calc_lost_payments_label')}
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {t('landing.calc_lost_payments_value')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Bot className="h-3.5 w-3.5 text-[#E11D48]" />
                      {t('landing.calc_reminders_label')}
                    </span>
                    <span className="font-bold text-foreground font-mono">
                      {t('landing.calc_reminders_value')}
                    </span>
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
                    {t('landing.calc_cta_button')}
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
                <span>{t('landing.comp_badge')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {t('landing.comp_title')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Left: The Old Way (Chaos) */}
              <div className="p-6 sm:p-8 rounded-2xl border border-destructive/30 bg-destructive/5 space-y-4">
                <h4 className="text-base font-bold text-destructive flex items-center gap-2">
                  <span>{t('landing.comp_old_title')}</span>
                </h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <span className="text-destructive font-bold">✕</span>
                    <span>{t('landing.comp_old_1')}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-destructive font-bold">✕</span>
                    <span>{t('landing.comp_old_2')}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-destructive font-bold">✕</span>
                    <span>{t('landing.comp_old_3')}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-destructive font-bold">✕</span>
                    <span>{t('landing.comp_old_4')}</span>
                  </li>
                </ul>
              </div>

              {/* Right: The Studly Way (Smooth) */}
              <div className="p-6 sm:p-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-4">
                <h4 className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <span>{t('landing.comp_new_title')}</span>
                </h4>
                <ul className="space-y-3 text-sm text-foreground/90">
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{t('landing.comp_new_1')}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{t('landing.comp_new_2')}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{t('landing.comp_new_3')}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{t('landing.comp_new_4')}</span>
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
                <span>{t('landing.faq_badge')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {t('landing.faq_title')}
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
                <span>{t('landing.cta_badge')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {t('landing.cta_title')}
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                {t('landing.cta_subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  to="/register"
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'rounded-xl text-sm font-medium h-12 px-8 bg-foreground text-background hover:bg-foreground/90 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]'
                  )}
                >
                  {t('landing.cta_button')}
                </Link>
                <Link
                  to="/login"
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'rounded-xl text-sm font-medium h-12 px-6 border-border hover:bg-muted/80'
                  )}
                >
                  {t('landing.cta_already_have_account')}
                </Link>
              </div>
              <div className="pt-2">
                <Link
                  to="/register/student"
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                >
                  <span>{t('landing.cta_student_invite')}</span>
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
            <a href="#features" className="hover:text-foreground transition-colors">{t('landing.footer_features')}</a>
            <a href="#interactive-demo" className="hover:text-foreground transition-colors">{t('landing.footer_demo')}</a>
            <a href="#calculator" className="hover:text-foreground transition-colors">{t('landing.footer_calculator')}</a>
            <a href="#faq" className="hover:text-foreground transition-colors">{t('landing.footer_faq')}</a>
            <Link to="/login" className="hover:text-foreground transition-colors">{t('landing.footer_login')}</Link>
            <Link to="/register" className="hover:text-foreground transition-colors">{t('landing.footer_register')}</Link>
          </div>

          <div className="text-xs text-muted-foreground">
            {t('landing.footer_copyright', { year: new Date().getFullYear().toString() })}
          </div>
        </div>
      </footer>
    </div>
  )
}
