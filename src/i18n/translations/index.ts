import { ru } from './ru'
import { en } from './en'
import { kk } from './kk'
import type { SupportedLanguage } from '../types'

export const translations: Record<SupportedLanguage, typeof ru> = {
  ru,
  en,
  kk,
}

export type TranslationSchema = typeof ru
export { ru, en, kk }
