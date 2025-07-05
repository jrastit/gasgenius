import { InitializingEntity } from '../base'
import { AccentColors, MainColors } from './themes'

export interface IThemeManager extends InitializingEntity {
  onChangeTheme(
    mainColorName: MainColors,
    brandColorName: AccentColors,
    event?: MouseEvent
  ): Promise<void>
  onChangeMainColor(mainColorName: MainColors, event?: MouseEvent): Promise<void>
  onChangeBrandColor(brandColorName: AccentColors, event?: MouseEvent): Promise<void>
  getActiveBrandColor(): AccentColors
  getActiveMainColor(): MainColors
}
