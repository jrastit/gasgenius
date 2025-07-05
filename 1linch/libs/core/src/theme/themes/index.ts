import { AccentColors, MainColors } from '@1inch-community/models'
import type { CSSResult } from 'lit'

export const mainColorMap: Record<MainColors, (targetName?: string) => Promise<CSSResult>> = {
  [MainColors.systemSync]: (targetName?: string) => getSystemTheme(targetName),
  [MainColors.dark]: (targetName?: string) =>
    import('./main-color-schemes/dark.style').then((m) => m.themeDark(targetName)),
  [MainColors.darkBlue]: (targetName?: string) =>
    import('./main-color-schemes/dark-blue.style').then((m) => m.themeDarkBlue(targetName)),
  [MainColors.light]: (targetName?: string) =>
    import('./main-color-schemes/light.style').then((m) => m.themeLight(targetName)),
  [MainColors.lightBlue]: (targetName?: string) =>
    import('./main-color-schemes/light-blue.style').then((m) => m.themeLightBlue(targetName)),
}

export const brandColorMap: Record<AccentColors, () => Promise<CSSResult>> = {
  [AccentColors.community]: () =>
    import('./brand-color-schemes/community.style').then((m) => m.communityStyle),
  [AccentColors.rainbow]: () =>
    import('./brand-color-schemes/rainbow.style').then((m) => m.rainbowStyle),
  [AccentColors.random]: () =>
    import('./brand-color-schemes/random.style').then((m) => m.randomStyle()),
  [AccentColors.orange]: () =>
    import('./brand-color-schemes/orange.style').then((m) => m.orangeStyle),
  [AccentColors.violet]: () =>
    import('./brand-color-schemes/violet.style').then((m) => m.violetStyle),
}

function getSystemTheme(targetName?: string) {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    if ((window as any)?.ethereum?.isOneInchIOSWallet)
      return mainColorMap[MainColors.darkBlue](targetName)
    return mainColorMap[MainColors.dark](targetName)
  }
  if ((window as any)?.ethereum?.isOneInchIOSWallet)
    return mainColorMap[MainColors.lightBlue](targetName)
  return mainColorMap[MainColors.light](targetName)
}
