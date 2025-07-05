import { InitializingEntity } from '../base'

export enum Locale {
  en = 'en',
  ar = 'ar',
  fr = 'fr',
  es = 'es',
  de = 'de',
}

export type Translations = Record<string, string>

export interface Ii18nManager extends InitializingEntity {
  changeLocale(localeCode: Locale): Promise<void>
}
