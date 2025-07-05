import {
  AccentColors,
  IApplicationContext,
  IThemeManager,
  MainColors,
} from '@1inch-community/models'
import { lazy } from '../lazy'
import { themeChange } from './theme-change'
import { themeInit } from './theme-init'

export class ThemeManager implements IThemeManager {
  private context?: IApplicationContext

  private readonly mainColorSettings = lazy(() =>
    this.context!.settings.getSetting('main-color-name', MainColors.systemSync)
  )

  private readonly brandColorSettings = lazy(() =>
    this.context!.settings.getSetting('brand-color-name', AccentColors.community)
  )

  getActiveMainColor(): MainColors {
    return this.mainColorSettings.value.value ?? MainColors.systemSync
  }

  getActiveBrandColor(): AccentColors {
    return this.brandColorSettings.value.value ?? AccentColors.community
  }

  async init(context: IApplicationContext): Promise<void> {
    this.context = context
    const mainColorName = this.getActiveMainColor()
    const brandColorName = this.getActiveBrandColor()
    await themeInit(mainColorName, brandColorName)
  }

  async onChangeTheme(
    mainColorName: MainColors,
    brandColorName: AccentColors,
    event?: MouseEvent
  ): Promise<void> {
    this.mainColorSettings.value.setValue(mainColorName)
    this.brandColorSettings.value.setValue(brandColorName)
    return await themeChange(mainColorName, brandColorName, event)
  }

  async onChangeMainColor(mainColorName: MainColors, event?: MouseEvent): Promise<void> {
    const brandColorName = this.getActiveBrandColor()
    await this.onChangeTheme(mainColorName, brandColorName, event)
  }

  async onChangeBrandColor(brandColorName: AccentColors, event?: MouseEvent): Promise<void> {
    const mainColorName = this.getActiveMainColor()
    await this.onChangeTheme(mainColorName, brandColorName, event)
  }
}
