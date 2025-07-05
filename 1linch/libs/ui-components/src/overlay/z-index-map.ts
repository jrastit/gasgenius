import { OverlayViewMode } from '@1inch-community/models'

export const zIndexMap: Record<OverlayViewMode, number> = {
  [OverlayViewMode.auto]: 0,
  [OverlayViewMode.popupAuto]: 0,
  [OverlayViewMode.desktop]: 1000,
  [OverlayViewMode.mobile]: 1000,
  [OverlayViewMode.popup]: 2000,
}
