import { Ii18nManager, Locale } from '@1inch-community/models'
import { changeLocaleAndUpdate, setTargetHost } from './i18n'

export class I18nEmbeddedManager implements Ii18nManager {
  constructor(
    private readonly localeCode: Locale,
    container: HTMLElement
  ) {
    setTargetHost(container)
  }

  async init(): Promise<void> {
    await changeLocaleAndUpdate(this.localeCode)
  }

  async changeLocale(localeCode: Locale): Promise<void> {
    return await changeLocaleAndUpdate(localeCode)
  }
}
