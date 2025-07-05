import { getMobileMatchMedia } from '@1inch-community/core/lit-utils'

export function getHeaderHeight() {
  const mobileMedia = getMobileMatchMedia()
  if (mobileMedia.matches) {
    return 56
  }
  return 72
}

export function getFooterHeight() {
  const mobileMedia = getMobileMatchMedia()
  if (mobileMedia.matches) {
    return 56
  }
  return 72
}
