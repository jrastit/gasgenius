import { IApplicationContext, Ii18nManager, Locale } from '@1inch-community/models'
import { lazy } from '../../lazy'
import { changeLocaleAndUpdate, defaultLocaleCode } from './i18n'

export class I18nManager implements Ii18nManager {
  private context?: IApplicationContext

  private readonly i18nSettings = lazy(() =>
    this.context!.settings.getSetting('i18n', defaultLocaleCode)
  )

  async init(context: IApplicationContext): Promise<void> {
    this.context = context
    const settingsValue = this.i18nSettings.value.value ?? defaultLocaleCode
    await changeLocaleAndUpdate(settingsValue)
  }

  async changeLocale(localeCode: Locale): Promise<void> {
    this.i18nSettings.value.setValue(localeCode)
    return await changeLocaleAndUpdate(localeCode)
  }
}
