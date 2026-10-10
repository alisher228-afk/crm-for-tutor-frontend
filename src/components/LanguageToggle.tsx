import { useLanguage } from '@/i18n'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe, Check } from 'lucide-react'
import type { SupportedLanguage } from '@/i18n/types'

interface LanguageToggleProps {
  className?: string
  showLabel?: boolean
  align?: 'start' | 'end' | 'center'
}

export function LanguageToggle({
  className,
  showLabel = true,
  align = 'end',
}: LanguageToggleProps) {
  const { language, setLanguage, supportedLanguages, currentLanguageInfo } =
    useLanguage()

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-2 gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground ${
              className || ''
            }`}
            title="Сменить язык / Switch language / Тілді өзгерту"
            aria-label="Сменить язык интерфейса"
          >
            <Globe className="h-3.5 w-3.5" strokeWidth={1.75} />
            {showLabel && (
              <span className="font-mono text-[11px] font-semibold uppercase">
                {currentLanguageInfo.shortLabel}
              </span>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align={align} className="w-40 p-1">
        {supportedLanguages.map((lang) => {
          const isSelected = lang.code === language
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`flex items-center justify-between text-xs cursor-pointer py-1.5 px-2 rounded-md ${
                isSelected ? 'font-semibold bg-accent text-accent-foreground' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm leading-none" role="img" aria-label={lang.label}>
                  {lang.flag}
                </span>
                <span>{lang.nativeLabel}</span>
              </div>
              {isSelected && <Check className="h-3.5 w-3.5 text-primary stroke-[2.5]" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
