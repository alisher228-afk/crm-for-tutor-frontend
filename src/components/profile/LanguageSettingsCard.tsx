import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/i18n'
import { toast } from 'sonner'
import { Languages, Check } from 'lucide-react'
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

  const getLanguageDescription = (code: SupportedLanguage) => {
    switch (code) {
      case 'ru':
        return t('language.ru_desc')
      case 'en':
        return t('language.en_desc')
      case 'kk':
        return t('language.kk_desc')
      default:
        return ''
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Languages className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">
              {t('language.title')}
            </CardTitle>
            <CardDescription className="text-xs">
              {t('language.subtitle')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {supportedLanguages.map((lang) => {
            const isSelected = lang.code === language
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                className={`relative flex flex-col p-4 rounded-xl border text-left transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                    : 'border-border bg-card hover:bg-muted/40 hover:border-border/80'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl leading-none" role="img" aria-label={lang.label}>
                      {lang.flag}
                    </span>
                    <span className="font-semibold text-sm text-foreground">
                      {lang.nativeLabel}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-0.5">
                  {getLanguageDescription(lang.code)}
                </p>

                <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span>{lang.label}</span>
                  <span className="uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded-sm bg-muted/50 border border-border/40">
                    {lang.shortLabel}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
