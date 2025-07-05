import { Locale } from '@1inch-community/models'

const rtlLocale: Locale[] = [Locale.ar]

export function isRTL(localeCode: Locale) {
  return rtlLocale.includes(localeCode)
}
