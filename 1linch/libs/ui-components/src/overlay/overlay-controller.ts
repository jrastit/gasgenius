import { CacheActivePromise } from '@1inch-community/core/decorators'
import { getMobileMatchMedia } from '@1inch-community/core/lit-utils'
import { IOverlayController, OverlayViewConfig, OverlayViewMode } from '@1inch-community/models'
import { TemplateResult } from 'lit'
import { OverlayDesktopController } from './overlay-desktop-controller'
import { OverlayMobileController } from './overlay-mobile-controller'
import { OverlayPopupController } from './overlay-popup-controller'
import { viewConfigDefault } from './overlay-view-config-default'

function CacheActivePromiseSerializer(
  openTarget: TemplateResult | HTMLElement,
  viewConfig?: OverlayViewConfig
): string {
  let openTargetString = ''
  if (openTarget instanceof HTMLElement) {
    openTargetString = openTarget.outerHTML
  }
  if ('_$litType$' in openTarget) {
    for (let i = 0; i < openTarget.strings.length; i++) {
      const string = openTarget.strings[i]
      const value = openTarget.values[i]
      openTargetString += string
      openTargetString += CacheActivePromiseValueSerializer(value)
    }
  }
  return [openTargetString, viewConfig?.mode].join(':')
}

function CacheActivePromiseValueSerializer(value: unknown): string {
  const valueString = safeStringify(value)

  if (typeof value === 'object' && valueString === null) {
    return value!.constructor.name
  }
  if (typeof value === 'function' && valueString === null) {
    return value.toString()
  }
  return valueString ?? ''
}

function safeStringify(value: unknown) {
  try {
    return JSON.stringify(value) ?? null
  } catch {
    return null
  }
}

export class OverlayController implements IOverlayController {
  private readonly mobileOverlay: IOverlayController
  private readonly desktopOverlay: IOverlayController
  private readonly popupOverlay: IOverlayController

  private readonly mobileMedia = getMobileMatchMedia()

  constructor(rootNodeName: string) {
    this.mobileOverlay = new OverlayMobileController(rootNodeName)
    this.desktopOverlay = new OverlayDesktopController()
    this.popupOverlay = new OverlayPopupController(rootNodeName)
  }

  async init(): Promise<void> {}

  isOpenOverlay(overlayId: number | null | undefined): overlayId is number {
    if (typeof overlayId !== 'number') return false
    const isOpenDesktopOverlay = this.desktopOverlay.isOpenOverlay(overlayId)
    const isOpenMobileOverlay = this.mobileOverlay.isOpenOverlay(overlayId)
    const isOpenPopupOverlay = this.popupOverlay.isOpenOverlay(overlayId)
    return isOpenDesktopOverlay || isOpenMobileOverlay || isOpenPopupOverlay
  }

  @CacheActivePromise(CacheActivePromiseSerializer)
  async open(
    openTarget: TemplateResult | HTMLElement,
    viewConfig: OverlayViewConfig = viewConfigDefault
  ): Promise<number> {
    const internalViewConfig = { ...viewConfigDefault, ...viewConfig }
    const [overlay, mode] = this.resolveControllerByMode(internalViewConfig.mode!)

    return await overlay.open(openTarget, { ...viewConfig, mode: mode })
  }

  @CacheActivePromise()
  async close(overlayId: number): Promise<void> {
    if (this.desktopOverlay.isOpenOverlay(overlayId)) {
      return await this.desktopOverlay.close(overlayId)
    }
    if (this.mobileOverlay.isOpenOverlay(overlayId)) {
      return await this.mobileOverlay.close(overlayId)
    }
    if (this.popupOverlay.isOpenOverlay(overlayId)) {
      return await this.popupOverlay.close(overlayId)
    }
  }

  private resolveControllerByMode(mode: OverlayViewMode): [IOverlayController, OverlayViewMode] {
    let resolvedMode = mode
    if (mode === OverlayViewMode.auto) {
      resolvedMode = this.mobileMedia.matches ? OverlayViewMode.mobile : OverlayViewMode.desktop
    }
    if (mode === OverlayViewMode.popupAuto) {
      resolvedMode = this.mobileMedia.matches ? OverlayViewMode.mobile : OverlayViewMode.popup
    }
    let overlay: IOverlayController
    switch (resolvedMode) {
      case OverlayViewMode.desktop:
        overlay = this.desktopOverlay
        break
      case OverlayViewMode.mobile:
        overlay = this.mobileOverlay
        break
      case OverlayViewMode.popup:
        overlay = this.popupOverlay
        break
      default:
        throw new Error(`Unsupported overlay mode: ${resolvedMode}`)
    }
    return [overlay, resolvedMode] as const
  }
}
