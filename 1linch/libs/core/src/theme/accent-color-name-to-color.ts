import { AccentColors } from '@1inch-community/models'
import { getRandomBrightColor, rainbowRandomColors } from './themes/color-utils'

const AccentColorNameToColor: Record<AccentColors, () => string> = {
  [AccentColors.community]: () => '#00a0b5',
  [AccentColors.random]: () => getRandomBrightColor(),
  [AccentColors.rainbow]: () => rainbowRandomColors[0],
  [AccentColors.orange]: () => '#ef962e',
  [AccentColors.violet]: () => '#2f8af5',
}

export function getAccentColor(accentColor: AccentColors): string {
  return AccentColorNameToColor[accentColor]()
}
