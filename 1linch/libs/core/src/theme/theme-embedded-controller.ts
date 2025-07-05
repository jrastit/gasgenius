import { AccentColors, IThemeManager, MainColors } from '@1inch-community/models'

export class ThemeEmbeddedManager implements IThemeManager {
  async init(): Promise<void> {}

  async onChangeTheme(): Promise<void> {
    throw new Error('ThemeEmbeddedManager not support onChangeTheme')
  }

  async onChangeMainColor(): Promise<void> {
    throw new Error('ThemeEmbeddedManager not support onChangeMainColor')
  }

  async onChangeBrandColor(): Promise<void> {
    throw new Error('ThemeEmbeddedManager not support onChangeBrandColor')
  }

  getActiveBrandColor(): AccentColors {
    throw new Error('ThemeEmbeddedManager not support getActiveBrandColor')
  }

  getActiveMainColor(): MainColors {
    throw new Error('ThemeEmbeddedManager not support getActiveMainColor')
  }
}
