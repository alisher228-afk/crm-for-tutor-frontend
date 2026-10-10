import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import {
  type SupportedLanguage,
  type LanguageInfo,
  SUPPORTED_LANGUAGES,
} from './types'
import { translations } from './translations'

interface LanguageContextType {
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
  t: (path: string, params?: Record<string, string | number>) => string
  currentLanguageInfo: LanguageInfo
  supportedLanguages: LanguageInfo[]
}

const LanguageContext = createContext<LanguageContextType | null>(null)

const STORAGE_KEY = 'studly-lang'

function getInitialLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'ru'
  const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null
  if (saved && (saved === 'ru' || saved === 'en' || saved === 'kk')) {
    return saved
  }
  // Optional browser language detection
  const navLang = navigator.language?.toLowerCase() || ''
  if (navLang.startsWith('kk') || navLang.startsWith('kz')) return 'kk'
  if (navLang.startsWith('en')) return 'en'
  return 'ru'
}

function resolveNestedKey(obj: any, path: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined
  const segments = path.split('.')
  let current: any = obj
  for (const segment of segments) {
    if (current && typeof current === 'object' && segment in current) {
      current = current[segment]
    } else {
      return undefined
    }
  }
  return typeof current === 'string' ? current : undefined
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(getInitialLanguage)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, language)
      document.documentElement.lang = language
    }
  }, [language])

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    setLanguageState(newLang)
  }, [])

  const t = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      const activeDict = translations[language]
      let text = resolveNestedKey(activeDict, path)

      // Fallback to Russian if missing in active language
      if (text === undefined && language !== 'ru') {
        text = resolveNestedKey(translations.ru, path)
      }

      // If key is still missing, return the path itself
      if (text === undefined) {
        text = path
      }

      // Variable interpolation: replaces {paramName}
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text!.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
        })
      }

      return text
    },
    [language],
  )

  const currentLanguageInfo = useMemo(() => {
    return (
      SUPPORTED_LANGUAGES.find((l) => l.code === language) ||
      SUPPORTED_LANGUAGES[0]
    )
  }, [language])

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      currentLanguageInfo,
      supportedLanguages: SUPPORTED_LANGUAGES,
    }),
    [language, setLanguage, t, currentLanguageInfo],
  )

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return ctx
}
