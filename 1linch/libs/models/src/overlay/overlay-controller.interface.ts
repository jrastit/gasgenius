import type { TemplateResult } from 'lit'
import { InitializingEntity } from '../base'

export enum OverlayViewMode {
  /**
   * auto detect mobile or desktop mode
   * */
  auto = 'auto',
  /**
   * use only if you need to open overlay in desktop mode
   * */
  desktop = 'desktop',
  /**
   * use only if you need to open overlay in mobile mode
   * */
  mobile = 'mobile',
  /**
   * use if you need to open overlay in popup mode on both desktop and mobile
   * */
  popup = 'popup',
  /**
   * automatically detects the view mode and if the application is running on the phone,
   * it opens the overlay in mobile mode, otherwise it opens it as a popup
   * */
  popupAuto = 'popupAuto',
}

export enum OverlayViewPopupPosition {
  top = 'top',
  bottom = 'bottom',
  left = 'left',
  right = 'right',
  center = 'center',
}

export type OverlayViewConfigAuto = {
  mode: OverlayViewMode.auto
  targetFactory?: () => HTMLElement | null
}

export type OverlayViewConfigDesktop = {
  mode: OverlayViewMode.desktop
  targetFactory?: () => HTMLElement | null
}

export type OverlayViewConfigMobile = {
  mode: OverlayViewMode.mobile
}

export type OverlayViewConfigPopup = {
  mode: OverlayViewMode.popup
  targetFactory: () => HTMLElement | null
  position?: { x: OverlayViewPopupPosition[]; y: OverlayViewPopupPosition[] }
  customOverlayContainerStyle?: Partial<CSSStyleDeclaration>
}

export type OverlayViewConfigPopupAuto = {
  mode: OverlayViewMode.popupAuto
  targetFactory: () => HTMLElement | null
  position?: { x: OverlayViewPopupPosition[]; y: OverlayViewPopupPosition[] }
  customOverlayContainerStyle?: Partial<CSSStyleDeclaration>
}

export type OverlayViewConfig =
  | { mode: OverlayViewMode }
  | OverlayViewConfigAuto
  | OverlayViewConfigDesktop
  | OverlayViewConfigMobile
  | OverlayViewConfigPopup
  | OverlayViewConfigPopupAuto

export interface IOverlayController extends InitializingEntity {
  open(content: TemplateResult | HTMLElement, viewConfig?: OverlayViewConfig): Promise<number>
  close(overlayId: number): Promise<void>
  isOpenOverlay(overlayId: number | null | undefined): overlayId is number
}
