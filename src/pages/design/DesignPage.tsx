import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo, type LogoConcept } from '@/components/brand/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import {
  Calendar,
  Clock,
  TrendingUp,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  FolderOpen,
  Loader2,
  Search,
  Bell,
  Sparkles,
} from 'lucide-react'

export function DesignPage() {
  const [selectedConcept, setSelectedConcept] = useState<LogoConcept>('a')
  const [inputValue, setInputValue] = useState('')
  const [radiusMode, setRadiusMode] = useState<'sharp' | 'micro' | 'smooth'>('sharp')

  const handleRadiusChange = (mode: 'sharp' | 'micro' | 'smooth') => {
    setRadiusMode(mode)
    const val = mode === 'sharp' ? '0px' : mode === 'micro' ? '2px' : '8px'
    document.documentElement.style.setProperty('--radius', val)
  }

  const monochromeScale = [
    { step: '50', hex: '#FAFAFA', textDark: true, note: 'Фон страницы (Paper)' },
    { step: '100', hex: '#F4F4F5', textDark: true, note: 'Фон Secondary, hover' },
    { step: '200', hex: '#E4E4E7', textDark: true, note: '1px границы (border)' },
    { step: '300', hex: '#D4D4D8', textDark: true, note: 'Фокусные кольца' },
    { step: '400', hex: '#A1A1AA', textDark: true, note: 'Плейсхолдеры, иконки' },
    { step: '500', hex: '#71717A', textDark: false, note: 'Вторичный текст' },
    { step: '600', hex: '#52525B', textDark: false, note: 'Подписи в dark' },
    { step: '700', hex: '#3F3F46', textDark: false, note: 'Тёмные разделители' },
    { step: '800', hex: '#27272A', textDark: false, note: 'Границы dark' },
    { step: '900', hex: '#18181B', textDark: false, note: 'Кнопки Primary (Black)' },
    { step: '950', hex: '#09090B', textDark: false, note: 'Глубокий чёрный текст' },
  ]

  const redAccentScale = [
    { role: 'Solid Red (Light)', hex: '#E11D48', note: 'Точка в логотипе, маркер «Live», индикаторы' },
    { role: 'Solid Red (Dark)', hex: '#F43F5E', note: 'Акцент в тёмной теме' },
    { role: 'Soft Red Bg', hex: '#FFF1F2', note: 'Мягкий фон счётчиков и бейджей' },
    { role: 'Dark Soft Red', hex: '#2E1217', note: 'Фон счётчиков в тёмной теме' },
  ]

  const microDetailsList = [
    {
      title: 'Точка в логотипе «Studly.»',
      desc: 'Алая точка после названия сервиса и микро-пиксель в плашке CRM',
      preview: <Logo variant="full" size="md" />,
    },
    {
      title: 'Индикатор активного пункта меню',
      desc: 'Тонкая 3px вертикальная алая риска на левом крае активной ссылки сайдбара',
      preview: (
        <div className="relative flex items-center gap-2.5 px-3 py-1.5 rounded-none bg-muted text-foreground text-xs font-semibold w-48 border border-border/50">
          <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-red-accent" />
          <Calendar className="h-3.5 w-3.5" />
          <span>Расписание</span>
        </div>
      ),
    },
    {
      title: 'Пульсирующий статус «В сети»',
      desc: 'Микро-индикатор онлайн-статуса преподавателя (квадратный пиксель)',
      preview: (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-none border border-border bg-card text-[11px] font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 bg-red-accent"></span>
          </span>
          <span className="text-muted-foreground">В сети • Преподаватель</span>
        </div>
      ),
    },
    {
      title: 'Счётчик уведомлений / ДЗ на проверке',
      desc: 'Компактная моноширинная плашка со счётчиком работ',
      preview: (
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span>Новые работы</span>
          <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-none border border-red-500/20 text-[10px] font-mono font-bold bg-red-soft text-red-foreground">
            +3
          </span>
        </div>
      ),
    },
    {
      title: 'Маркер сегодняшнего занятия',
      desc: 'Острая красная риска на левой границе карточки урока, требующего внимания сегодня',
      preview: (
        <div className="relative pl-3.5 py-1.5 pr-3 rounded-none border border-border bg-card text-xs flex items-center justify-between gap-4">
          <span className="absolute left-0 top-1 bottom-1 w-1 bg-red-accent" />
          <div>
            <div className="font-semibold text-foreground">ЕГЭ Математика</div>
            <div className="text-[10px] font-mono text-muted-foreground">16:00 — 17:00</div>
          </div>
          <Badge variant="today">Сегодня</Badge>
        </div>
      ),
    },
    {
      title: 'Микро-метка «Live» в меню',
      desc: 'Индикатор идущего прямо сейчас занятия',
      preview: (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded-none border border-border/80 bg-muted/40">
          <span className="h-1.5 w-1.5 bg-red-accent" />
          LIVE
        </span>
      ),
    },
  ]

  const semanticTokens = [
    {
      title: 'Scheduled',
      role: 'Запланирован (Нейтрал)',
      badgeVariant: 'scheduled' as const,
      desc: 'Сдержанный сланцевый бейдж без кричащих цветов',
    },
    {
      title: 'Completed',
      role: 'Проведён / Оплачен (Green)',
      badgeVariant: 'completed' as const,
      desc: 'Спокойный изумрудный штрих',
    },
    {
      title: 'Cancelled',
      role: 'Отменён / Долг (Red)',
      badgeVariant: 'cancelled' as const,
      desc: 'Прецизионный красный индикатор',
    },
    {
      title: 'Unpaid',
      role: 'Не оплачен (Amber)',
      badgeVariant: 'unpaid' as const,
      desc: 'Тёплый янтарный маркер',
    },
    {
      title: 'Today Marker',
      role: 'Сегодня (Red Detail)',
      badgeVariant: 'today' as const,
      desc: 'Точечный маркер ближайшего занятия',
    },
  ]

  const mockStudents = [
    {
      name: 'Александр Смирнов',
      subject: 'Математика (ЕГЭ)',
      date: 'Сегодня, 16:00',
      duration: '60 мин',
      status: 'today' as const,
      statusLabel: 'Сегодня, 16:00',
      balance: '4 урока',
      amount: '2 500 ₽',
      isToday: true,
    },
    {
      name: 'Екатерина Морозова',
      subject: 'Физика (ОГЭ)',
      date: 'Вчера, 14:00',
      duration: '90 мин',
      status: 'completed' as const,
      statusLabel: 'Проведён',
      balance: '1 урок',
      amount: '3 200 ₽',
      isToday: false,
    },
    {
      name: 'Даниил Кузнецов',
      subject: 'Информатика (Python)',
      date: 'Вчера, 18:30',
      duration: '60 мин',
      status: 'unpaid' as const,
      statusLabel: 'Не оплачен',
      balance: '0 уроков',
      amount: '2 500 ₽',
      isToday: false,
    },
    {
      name: 'Полина Васильева',
      subject: 'Математика (10 класс)',
      date: '28 сен, 12:00',
      duration: '60 мин',
      status: 'cancelled' as const,
      statusLabel: 'Отменён',
      balance: '6 уроков',
      amount: '0 ₽',
      isToday: false,
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 lg:px-12 font-sans">
      <div className="max-w-[1280px] mx-auto space-y-16">
        {/* Navigation & Header */}
        <header className="border-b border-border pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-[11px] font-mono uppercase tracking-wider font-semibold">
                Strict Edition
              </Badge>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-red-accent" />
                Black • White • Gray • Precision Red Details
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-foreground flex items-center gap-2">
              Studly CRM Design System
            </h1>
            <p className="text-muted-foreground max-w-2xl text-sm sm:text-base leading-relaxed">
              Строгий минималистичный стиль без шаблонных градиентов и визуального шума.
              Монохромная база с глубоким графитом, чистым бумажным фоном, выверенной сеткой и
              точечными красными микро-акцентами для деталей.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Live Corner Radius Mode Switcher */}
            <div className="inline-flex items-center rounded-none border border-border bg-card p-0.5 text-xs font-mono">
              <span className="px-2 text-[10px] uppercase text-muted-foreground font-semibold">
                Углы:
              </span>
              <button
                type="button"
                onClick={() => handleRadiusChange('sharp')}
                className={`px-2.5 py-1 transition-all ${
                  radiusMode === 'sharp'
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                0px (Острые)
              </button>
              <button
                type="button"
                onClick={() => handleRadiusChange('micro')}
                className={`px-2.5 py-1 transition-all ${
                  radiusMode === 'micro'
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                2px (Микро)
              </button>
              <button
                type="button"
                onClick={() => handleRadiusChange('smooth')}
                className={`px-2.5 py-1 transition-all ${
                  radiusMode === 'smooth'
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                8px (Скруглённые)
              </button>
            </div>

            <ThemeToggle className="h-8 w-8 rounded-none border border-border bg-card shadow-xs" />
            <Link to="/login" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Вход в CRM
            </Link>
            <Link to="/tutor/students" className={buttonVariants({ variant: 'default', size: 'sm' })}>
              Панель тьютора
            </Link>
          </div>
        </header>

        {/* 1. RED MICRO-ACCENTS & DETAILS SHOWCASE */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-heading font-semibold flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-accent" />
                1. Хирургические красные микро-акценты (Red Details)
              </h2>
              <p className="text-xs text-muted-foreground">
                Кнопки не заливаются красным — акцент используется строго в деликатных микро-деталях интерфейса.
              </p>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground border border-border px-2 py-0.5 rounded">
              &lt; 1% UI Area
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {microDetailsList.map((item) => (
              <Card key={item.title} className="border-border bg-card p-4 space-y-3 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-semibold text-foreground">{item.title}</div>
                  <Sparkles className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </div>
                <div className="p-3 rounded border border-border/60 bg-muted/20 flex items-center justify-center min-h-[56px]">
                  {item.preview}
                </div>
                <p className="text-[11px] text-muted-foreground leading-normal">{item.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* 2. BRAND IDENTITY & LOGO */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-heading font-semibold">2. Логотип и концепции</h2>
              <p className="text-xs text-muted-foreground">
                Монохромная геометрия с красной точкой у закладки и красным знаком Studly.
              </p>
            </div>
            {/* Concept Picker */}
            <div className="inline-flex rounded-md border border-border p-1 bg-muted/40">
              <button
                type="button"
                onClick={() => setSelectedConcept('a')}
                className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                  selectedConcept === 'a'
                    ? 'bg-background text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Концепция A (Основная)
              </button>
              <button
                type="button"
                onClick={() => setSelectedConcept('b')}
                className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                  selectedConcept === 'b'
                    ? 'bg-background text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Концепция B (Расписание)
              </button>
              <button
                type="button"
                onClick={() => setSelectedConcept('c')}
                className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                  selectedConcept === 'c'
                    ? 'bg-background text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Концепция C (Угол книги)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Light Surface Demo */}
            <Card className="border-border bg-white text-zinc-950 p-6 space-y-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <span className="text-[11px] font-mono font-semibold text-zinc-500 uppercase tracking-wider">
                  Светлая поверхность (Light #FFFFFF)
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  Paper White
                </span>
              </div>

              {/* Full Logo Large */}
              <div className="py-4">
                <Logo concept={selectedConcept} variant="full" size="lg" />
              </div>

              {/* Sizes Showcase */}
              <div className="flex items-end gap-6 pt-2 border-t border-zinc-100">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-zinc-400">16 px</div>
                  <div className="p-2 border border-zinc-200 rounded bg-zinc-50 inline-block">
                    <Logo concept={selectedConcept} variant="mark" size={16} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-zinc-400">24 px</div>
                  <div className="p-2 border border-zinc-200 rounded bg-zinc-50 inline-block">
                    <Logo concept={selectedConcept} variant="mark" size={24} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-zinc-400">32 px</div>
                  <div className="p-2 border border-zinc-200 rounded bg-zinc-50 inline-block">
                    <Logo concept={selectedConcept} variant="mark" size={32} />
                  </div>
                </div>
                <div className="space-y-1 ml-auto">
                  <div className="text-[10px] font-mono text-zinc-400">Pure Mono</div>
                  <div className="p-2 border border-zinc-200 rounded bg-zinc-50 inline-block text-zinc-900">
                    <Logo concept={selectedConcept} variant="mark" size={24} monochrome />
                  </div>
                </div>
              </div>
            </Card>

            {/* Dark Surface Demo */}
            <Card className="border-zinc-800 bg-[#09090B] text-zinc-50 p-6 space-y-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                  Тёмная поверхность (Dark #09090B)
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  Obsidian
                </span>
              </div>

              {/* Full Logo Large on Dark */}
              <div className="py-4">
                <Logo concept={selectedConcept} variant="full" size="lg" />
              </div>

              {/* Sizes Showcase */}
              <div className="flex items-end gap-6 pt-2 border-t border-zinc-800">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-zinc-500">16 px</div>
                  <div className="p-2 border border-zinc-800 rounded bg-[#121215] inline-block">
                    <Logo concept={selectedConcept} variant="mark" size={16} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-zinc-500">24 px</div>
                  <div className="p-2 border border-zinc-800 rounded bg-[#121215] inline-block">
                    <Logo concept={selectedConcept} variant="mark" size={24} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-zinc-500">32 px</div>
                  <div className="p-2 border border-zinc-800 rounded bg-[#121215] inline-block">
                    <Logo concept={selectedConcept} variant="mark" size={32} />
                  </div>
                </div>
                <div className="space-y-1 ml-auto">
                  <div className="text-[10px] font-mono text-zinc-500">Pure Mono</div>
                  <div className="p-2 border border-zinc-800 rounded bg-[#121215] inline-block text-zinc-100">
                    <Logo concept={selectedConcept} variant="mark" size={24} monochrome />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* 3. COLOR PALETTE */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-heading font-semibold">3. Монохромная шкала и красный акцент</h2>
            <p className="text-xs text-muted-foreground">
              Архитектурная серая гамма Zinc (50–950) и точечный красный микро-акцент (Red Accent).
            </p>
          </div>

          {/* Grayscale */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
              Zinc Grayscale
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2">
              {monochromeScale.map((item) => (
                <div
                  key={item.step}
                  className="rounded border border-border overflow-hidden bg-card flex flex-col shadow-xs"
                >
                  <div
                    className="h-14 w-full flex items-end p-2 border-b border-border/40"
                    style={{ backgroundColor: item.hex }}
                  >
                    <span
                      className={`text-[11px] font-bold font-mono ${
                        item.textDark ? 'text-zinc-900' : 'text-zinc-100'
                      }`}
                    >
                      {item.step}
                    </span>
                  </div>
                  <div className="p-2 space-y-0.5">
                    <div className="text-[11px] font-mono font-medium text-foreground">{item.hex}</div>
                    <div className="text-[9px] text-muted-foreground truncate" title={item.note}>
                      {item.note}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Red Micro-Accent & Semantics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border bg-card p-5 space-y-4 shadow-xs">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-accent" />
                Хирургический красный микро-акцент (&lt; 1% UI)
              </CardTitle>
              <div className="space-y-2">
                {redAccentScale.map((r) => (
                  <div
                    key={r.role}
                    className="flex items-center justify-between py-2 border-b border-border/50 text-xs last:border-0"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-5 w-5 rounded border border-border shrink-0"
                        style={{ backgroundColor: r.hex }}
                      />
                      <div>
                        <span className="font-semibold text-foreground">{r.role}</span>
                        <p className="text-[11px] text-muted-foreground">{r.note}</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{r.hex}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-border bg-card p-5 space-y-4 shadow-xs">
              <CardTitle className="text-sm font-semibold">
                Сдержанные семантические статусы
              </CardTitle>
              <div className="space-y-2.5">
                {semanticTokens.map((s) => (
                  <div
                    key={s.title}
                    className="flex items-center justify-between p-2 rounded border border-border bg-muted/20 text-xs"
                  >
                    <div>
                      <div className="font-medium text-foreground">{s.role}</div>
                      <div className="text-[10px] text-muted-foreground">{s.desc}</div>
                    </div>
                    <Badge variant={s.badgeVariant}>{s.title}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* 4. BUTTONS & CONTROLS */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-heading font-semibold">4. Кнопки и контролы</h2>
            <p className="text-xs text-muted-foreground">
              Сплошной чёрный Primary, строгий Secondary, компактный радиус 6–8px.
            </p>
          </div>

          <Card className="border-border bg-card p-6 space-y-6 shadow-xs">
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
                Варианты
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="default">Primary (Black)</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive (Red)</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
                С иконками и состояниями
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">
                  <Plus className="mr-1 h-3.5 w-3.5" strokeWidth={1.75} />
                  Добавить ученика
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="mr-1.5 h-3.5 w-3.5 text-foreground" strokeWidth={1.75} />
                  Расписание
                </Button>
                <Button variant="secondary" size="sm">
                  Далее
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
                </Button>
                <Button disabled size="sm">
                  Недоступно
                </Button>
                <Button disabled size="sm">
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Сохранение...
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* 5. FORM FIELDS */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-heading font-semibold">5. Поля ввода</h2>
            <p className="text-xs text-muted-foreground">
              Тонкие границы 1px, чистый фон, чёткий фокус-ринг.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border bg-card p-5 space-y-4 shadow-xs">
              <div className="space-y-1.5">
                <Label htmlFor="demo-name" className="text-xs font-medium">Имя ученика</Label>
                <Input
                  id="demo-name"
                  placeholder="Михаил Романов"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="demo-search" className="text-xs font-medium">Поиск</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                  <Input id="demo-search" className="pl-8 h-9 text-xs" placeholder="Поиск по фамилии..." />
                </div>
              </div>
            </Card>

            <Card className="border-border bg-card p-5 space-y-4 shadow-xs">
              <div className="space-y-1.5">
                <Label htmlFor="demo-error" className="text-xs font-medium">Поле с ошибкой</Label>
                <Input
                  id="demo-error"
                  defaultValue="некорректный-email"
                  aria-invalid="true"
                  className="h-9 text-xs"
                />
                <span className="text-[11px] text-destructive flex items-center gap-1 font-mono">
                  <AlertCircle className="h-3 w-3" />
                  Неверный формат адреса
                </span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="demo-disabled" className="text-xs font-medium">Заблокировано</Label>
                <Input id="demo-disabled" disabled value="Заблокировано системой" className="h-9 text-xs" />
              </div>
            </Card>

            <Card className="border-border bg-card p-5 space-y-4 shadow-xs">
              <div className="space-y-1.5">
                <Label htmlFor="demo-textarea" className="text-xs font-medium">Заметки</Label>
                <Textarea
                  id="demo-textarea"
                  placeholder="Разобрать домашнее задание №4..."
                  className="resize-none text-xs"
                  rows={4}
                />
              </div>
            </Card>
          </div>
        </section>

        {/* 6. DATA TABLE WITH RED TODAY ACCENT */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-heading font-semibold">6. Таблица расписания</h2>
              <p className="text-xs text-muted-foreground">
                Строка 44px, без зебры, моноширинные числа, деликатная алая риска для уроков на сегодня.
              </p>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">
              h-11 (44px) • tabular-nums
            </span>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ученик</TableHead>
                <TableHead>Предмет</TableHead>
                <TableHead>Время</TableHead>
                <TableHead>Длительность</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Баланс</TableHead>
                <TableHead className="text-right">Стоимость</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockStudents.map((row) => (
                <TableRow key={row.name} className="relative group">
                  <TableCell className="font-medium text-foreground relative">
                    {/* Tiny red hairline bar on the left edge of today's lesson */}
                    {row.isToday && (
                      <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-red-accent" />
                    )}
                    <div className="flex items-center gap-2">
                      {row.isToday && (
                        <span className="h-1.5 w-1.5 rounded-full bg-red-accent shrink-0 animate-pulse" />
                      )}
                      <span>{row.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.subject}
                  </TableCell>
                  <TableCell className="tabular-nums text-foreground">
                    {row.date}
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {row.duration}
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.status}>{row.statusLabel}</Badge>
                  </TableCell>
                  <TableCell className="tabular-nums text-right font-medium text-foreground">
                    {row.balance}
                  </TableCell>
                  <TableCell className="tabular-nums text-right font-semibold text-foreground">
                    {row.amount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        {/* 7. KPI METRICS & EMPTY STATE */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-heading font-semibold">7. Карточки метрик и пустое состояние</h2>
            <p className="text-xs text-muted-foreground">
              Строгие карточки со сдержанными данными, без тяжелых теней.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border bg-card p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Доход за октябрь</span>
                <Wallet className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-heading font-bold tabular-nums text-foreground">
                  74 500 ₽
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                  <TrendingUp className="h-3 w-3" />
                  +12.4% к сентябрю
                </div>
              </div>
            </Card>

            <Card className="border-border bg-card p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-accent" />
                  <span className="text-xs text-muted-foreground font-medium">Оплаченный баланс</span>
                </div>
                <Clock className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-heading font-bold tabular-nums text-foreground">
                  38 занятий
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  14 активных учеников
                </div>
              </div>
            </Card>

            <Card className="border-border bg-card p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Проведено занятий</span>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-heading font-bold tabular-nums text-foreground">
                  29 уроков
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  Все работы проверены
                </div>
              </div>
            </Card>
          </div>

          {/* Empty state */}
          <Card className="border-border bg-card border-dashed p-10 text-center flex flex-col items-center justify-center space-y-3 max-w-lg mx-auto shadow-xs">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground border border-border">
              <FolderOpen className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">Домашних заданий пока нет</CardTitle>
              <CardDescription className="text-xs text-muted-foreground max-w-xs">
                Создайте первое домашнее задание после проведённого урока.
              </CardDescription>
            </div>
            <Button size="sm" className="mt-1">
              <Plus className="mr-1 h-3.5 w-3.5" strokeWidth={1.75} />
              Создать задание
            </Button>
          </Card>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Logo variant="full" size="sm" />
            <span>• Прецизионная система дизайна</span>
          </div>
          <div className="font-mono text-[11px]">Studly CRM © 2026</div>
        </footer>
      </div>
    </div>
  )
}
