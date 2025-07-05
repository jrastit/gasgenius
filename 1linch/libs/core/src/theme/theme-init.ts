import { AccentColors, MainColors } from '@1inch-community/models'
import { createAndApplyStyle } from '../lit-utils'
import { bodyStyle } from './styles/body.style'
import { fontStyle } from './styles/font.style'
import { scrollbarStyle } from './styles/scrollbar.style'
import { themeChange } from './theme-change'
import { brandColorStyleElement, mainColorStyleElement } from './theme-elements'

export async function themeInit(
  mainColorName: MainColors = MainColors.light,
  brandColorName: AccentColors = AccentColors.community
) {
  document.head.appendChild(mainColorStyleElement)
  document.head.appendChild(brandColorStyleElement)
  createAndApplyStyle(fontStyle())
  createAndApplyStyle(bodyStyle)
  createAndApplyStyle(scrollbarStyle)
  await themeChange(mainColorName, brandColorName)
}
