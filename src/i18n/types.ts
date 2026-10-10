export type SupportedLanguage = 'ru' | 'en' | 'kk'

export interface LanguageInfo {
  code: SupportedLanguage
  label: string
  nativeLabel: string
  shortLabel: string
  flag: string
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    code: 'ru',
    label: 'Русский',
    nativeLabel: 'Русский',
    shortLabel: 'RU',
    flag: '🇷🇺',
  },
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    shortLabel: 'EN',
    flag: '🇬🇧',
  },
  {
    code: 'kk',
    label: 'Казахский',
    nativeLabel: 'Қазақша',
    shortLabel: 'ҚАЗ',
    flag: '🇰🇿',
  },
]
