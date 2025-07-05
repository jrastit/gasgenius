import { AccentColors, MainColors } from '@1inch-community/models'
import { Observable, ReplaySubject } from 'rxjs'
import { asyncFrame } from '../async'
import { applyStyle, createAndAppendInHeaderElement } from '../lit-utils'
import { brandColorStyleElement, mainColorStyleElement } from './theme-elements'
import { brandColorMap, mainColorMap } from './themes'
import { interpolateColorHex } from './utils/hex-interpolation'

let currentMainColor: MainColors
let currentBrandColor: AccentColors

const browserMetaColors: Record<MainColors, () => string> = {
  [MainColors.systemSync]: () => getBrowserMetaColor(),
  [MainColors.light]: () => '#f1f1f1',
  [MainColors.lightBlue]: () => '#f1f1f1',
  [MainColors.dark]: () => '#0e0e0e',
  [MainColors.darkBlue]: () => '#0e0e0e',
}

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

const changeAppTheme$ = new ReplaySubject<{ mainColor: MainColors; brandColor: AccentColors }>(1)

let metaColorFilter: ((currentColor: string, isDarkTheme: boolean) => string) | null = null

export function getBrowserMetaColor() {
  if (mediaQuery.matches) {
    return browserMetaColors[MainColors.dark]()
  }
  return browserMetaColors[MainColors.light]()
}

export async function setBrowserMetaColorFilter(filter: typeof metaColorFilter) {
  metaColorFilter = filter
  await setBrowserMetaColorColor(browserMetaColors[currentMainColor]())
}

async function setBrowserMetaColorColor(color: string) {
  const themeMetaElement = document.head.querySelector('#theme-color') as HTMLMetaElement
  if (!themeMetaElement) {
    createAndAppendInHeaderElement('meta', (meta) => {
      meta.id = 'theme-color'
      meta.name = 'theme-color'
      meta.content = metaColorFilter ? metaColorFilter(color, isDarkTheme(currentMainColor)) : color
    })
    return
  }
  const endColor = metaColorFilter ? metaColorFilter(color, isDarkTheme(currentMainColor)) : color
  await transitionThemeMetaElement(themeMetaElement, themeMetaElement.content, endColor)
}

export async function transitionThemeMetaElement(
  element: HTMLMetaElement,
  startColor: string,
  endColor: string
) {
  const maxIterations = 7
  let iteration = 0
  while (iteration < maxIterations) {
    element.content = interpolateColorHex(startColor, endColor, iteration, maxIterations)
    await asyncFrame()
    iteration++
  }
  element.content = endColor
}

export function getThemeChange(): Observable<{ mainColor: MainColors; brandColor: AccentColors }> {
  return changeAppTheme$
}

mediaQuery.onchange = async () => {
  if (currentMainColor !== MainColors.systemSync) return
  await themeChange(MainColors.systemSync, currentBrandColor)
}

function isDarkTheme(theme: MainColors) {
  if (theme === MainColors.systemSync) return mediaQuery.matches
  return theme === MainColors.dark || theme === MainColors.darkBlue
}

export async function themeChange(
  mainColorName: MainColors,
  brandColorName: AccentColors,
  event?: MouseEvent
) {
  const changeTheme = async () => {
    const mainColor = await mainColorMap[mainColorName]()
    const brandColor = await brandColorMap[brandColorName]()
    applyStyle(mainColorStyleElement, mainColor)
    applyStyle(brandColorStyleElement, brandColor)
    setBrowserMetaColorColor(browserMetaColors[mainColorName]())
    currentMainColor = mainColorName
    currentBrandColor = brandColorName
    document.documentElement.setAttribute('theme', isDarkTheme(mainColorName) ? 'dark' : 'light')
    document.documentElement.setAttribute('brand-color', AccentColors[brandColorName])
    changeAppTheme$.next({ mainColor: mainColorName, brandColor: brandColorName })
  }
  if (
    event &&
    'startViewTransition' in document &&
    isDarkTheme(currentMainColor) !== isDarkTheme(mainColorName)
  ) {
    const x = event.clientX
    const y = event.clientY
    const right = window.innerWidth - y
    const bottom = window.innerHeight - x
    const maxRadius = Math.hypot(Math.max(y, right), Math.max(x, bottom)) + 100

    ;(document as any)
      .startViewTransition(() => {
        changeTheme()
      })
      .ready.then(() => {
        return document.documentElement.animate(
          {
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`],
          },
          {
            duration: 600,
            easing: 'ease-in-out',
            pseudoElement: '::view-transition-new(root)',
          }
        ).finished
      })
    return
  }

  await changeTheme()
}
