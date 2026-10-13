import { Card, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/i18n'
import { toast } from 'sonner'
import { Languages } from 'lucide-react'
import type { SupportedLanguage } from '@/i18n/types'

export function LanguageSettingsCard() {
  const { language, setLanguage, t, supportedLanguages } = useLanguage()

  const handleSelectLanguage = (code: SupportedLanguage) => {
    if (code === language) return
    setLanguage(code)
    const toastMsg =
      code === 'ru'
        ? 'Язык интерфейса изменён на Русский'
        : code === 'en'
          ? 'Interface language set to English'
          : 'Интерфейс тілі Қазақшаға ауыстырылды'
    toast.success(toastMsg)
  }

  return (
    <Card className="border-border">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0">
              <Languages className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {t('language.title')}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t('language.subtitle')}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted/60 border border-border/50 self-start sm:self-auto shrink-0">
            {supportedLanguages.map((lang) => {
              const isSelected = lang.code === language
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-background text-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                  }`}
                >
                  <span className="text-sm leading-none" role="img" aria-label={lang.label}>
                    {lang.flag}
                  </span>
                  <span>{lang.nativeLabel}</span>
                </button>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

