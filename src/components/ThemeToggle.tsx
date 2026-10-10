import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sun, Moon } from 'lucide-react'
import { useLanguage } from '@/i18n'

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('studly-theme') as 'light' | 'dark' | null
      if (saved) return saved
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })

  let t: (path: string) => string = () => ''
  try {
    const lang = useLanguage()
    t = lang.t
  } catch {
    // Fallback if rendered outside LanguageProvider
  }

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('studly-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const titleText =
    theme === 'dark'
      ? t('theme.switch_to_light') || 'Светлая тема'
      : t('theme.switch_to_dark') || 'Тёмная тема'

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      className={className}
      aria-label={titleText}
      title={titleText}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-amber" strokeWidth={1.75} />
      ) : (
        <Moon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
      )}
    </Button>
  )
}
