import { asyncFrame } from '@1inch-community/core/async'
import { appendStyle, isRTLCurrentLocale } from '@1inch-community/core/lit-utils'
import {
  IOverlayController,
  OverlayViewConfigPopup,
  OverlayViewMode,
  OverlayViewPopupPosition,
} from '@1inch-community/models'
import { html, render, TemplateResult } from 'lit'
import { fromEvent, Subscription } from 'rxjs'
import { ScrollViewProviderElement } from '../scroll'
import { getContainer } from './overlay-container'
import { getOverlayId } from './overlay-id-generator'
import { zIndexMap } from './z-index-map'

export class OverlayPopupController implements IOverlayController {
  private readonly activeOverlayMap = new Map<number, [HTMLElement, HTMLElement, Position]>()
  private readonly subscriptions = new Map<number, Subscription>()

  private get container() {
    return getContainer()
  }

  constructor(private readonly rootNodeName: string) {}

  async init(): Promise<void> {}

  isOpenOverlay(overlayId: number): overlayId is number {
    return this.activeOverlayMap.has(overlayId)
  }

  async open(
    openTarget: TemplateResult | HTMLElement,
    viewConfig: OverlayViewConfigPopup
  ): Promise<number> {
    if (!viewConfig.targetFactory) {
      throw new Error(
        'OverlayPopupController.open: To use OverlayPopupController you need to pass targetFactory'
      )
    }
    const target = viewConfig.targetFactory()
    if (!target) {
      throw new Error(
        'OverlayPopupController.open: To use OverlayDesktopController, targetFactory must return a reference point as an HTMLElement'
      )
    }
    const overlayContainer = this.createOverlayContainer(openTarget, viewConfig)
    await asyncFrame()
    const position = getPosition(target, overlayContainer, viewConfig)
    overlayContainer.maxHeight = position.maxHeight
    appendStyle(overlayContainer, {
      top: `${position.top}px`,
      left: `${position.left}px`,
    })

    await this.animateEnter(overlayContainer, position)

    const id = getOverlayId()
    this.activeOverlayMap.set(id, [target, overlayContainer, position])
    this.subscribe(id)
    return id
  }

  async close(overlayId: number) {
    if (!this.activeOverlayMap.has(overlayId)) {
      return
    }
    const [, overlayContainer, position] = this.activeOverlayMap.get(overlayId)!

    await this.animateLeave(overlayContainer, position)

    this.unsubscribe(overlayId)
    overlayContainer.remove()
    this.activeOverlayMap.delete(overlayId)
  }

  private createOverlayContainer(
    openTarget: TemplateResult | HTMLElement,
    viewConfig: OverlayViewConfigPopup
  ) {
    const overlayContainer = document.createElement(ScrollViewProviderElement.tagName)
    appendStyle(overlayContainer, {
      borderRadius: '24px',
      boxShadow: `0 -3px 4px 0 var(--primary-12), 0 6px 12px 0 var(--primary-12)`,
      ...(viewConfig.customOverlayContainerStyle ?? {}),
      position: 'absolute',
      display: 'flex',
      overflow: 'hidden',
      alignItems: 'flex-end',
      width: 'fit-content',
      height: 'fit-content',
      zIndex: `${zIndexMap[OverlayViewMode.popup]}`,
    })
    render(html`${openTarget}`, overlayContainer)
    this.container.appendChild(overlayContainer)
    return overlayContainer
  }

  private subscribe(overlayId: number) {
    const subscription = new Subscription()
    const [, overlayContainer] = this.activeOverlayMap.get(overlayId) ?? []
    if (!overlayContainer) return
    const rootNode = document.querySelector(this.rootNodeName) as HTMLElement
    subscription.add(fromEvent(window, 'resize').subscribe(() => this.close(overlayId).catch()))
    subscription.add(fromEvent(rootNode, 'scroll').subscribe(() => this.updatePosition(overlayId)))
    subscription.add(
      fromEvent(overlayContainer, 'click').subscribe((event) => {
        event.stopPropagation()
        event.preventDefault()
      })
    )
    subscription.add(
      fromEvent(document, 'click').subscribe(() => {
        this.close(overlayId).catch()
      })
    )
    this.subscriptions.set(overlayId, subscription)
  }

  private unsubscribe(overlayId: number) {
    if (!this.subscriptions.has(overlayId)) return
    const subscription = this.subscriptions.get(overlayId)!
    if (subscription.closed) return
    subscription.unsubscribe()
  }

  private updatePosition(overlayId: number) {
    if (!this.activeOverlayMap.has(overlayId)) {
      return
    }
    const [target, overlayContainer] = this.activeOverlayMap.get(overlayId)!
    const rect = target.getBoundingClientRect()
    const rectContent = overlayContainer.getBoundingClientRect()
    const top = rect.top + rect.height + 8
    const left = rect.right - rectContent.width
    appendStyle(overlayContainer, {
      top: `${top}px`,
      left: `${left}px`,
    })
  }

  private async animateEnter(overlayContainer: HTMLElement, position: Position) {
    const options = {
      duration: 500,
      easing: 'cubic-bezier(.2, .8, .2, 1)',
    }

    const offsetX = animationOffsetRecord[position.x]
    const offsetY = animationOffsetRecord[position.y]

    await overlayContainer.animate(
      [
        { transform: `translate3d(${offsetX}%, ${offsetY}%, 0)`, opacity: 0.3 },
        { transform: 'translate3d(0, 0, 0)', opacity: 1 },
      ],
      options
    ).finished
  }

  private async animateLeave(overlayContainer: HTMLElement, position: Position) {
    const options = {
      duration: 500,
      easing: 'cubic-bezier(.2, .8, .2, 1)',
    }

    const offsetX = animationOffsetRecord[position.x]
    const offsetY = animationOffsetRecord[position.y]

    await overlayContainer.animate(
      [
        { transform: 'translate3d(0, 0, 0)', opacity: 1 },
        { transform: `translate3d(${offsetX}%, ${offsetY}%, 0)`, opacity: 0 },
      ],
      options
    ).finished
  }
}

const animationOffsetRecord: Record<OverlayViewPopupPosition, number> = {
  [OverlayViewPopupPosition.top]: 5,
  [OverlayViewPopupPosition.bottom]: -5,
  [OverlayViewPopupPosition.left]: -5,
  [OverlayViewPopupPosition.right]: 5,
  [OverlayViewPopupPosition.center]: 0,
}

const OFFSET = 8

type Position = {
  top: number
  left: number
  maxHeight: number
  targetRect: DOMRect
  x: OverlayViewPopupPosition
  y: OverlayViewPopupPosition
}

function getPosition(
  target: HTMLElement,
  popup: HTMLElement,
  viewConfig: OverlayViewConfigPopup
): Position {
  const rect = target.getBoundingClientRect()
  const popupRect = popup.getBoundingClientRect()
  const xPositions = viewConfig.position?.x ?? [
    isRTLCurrentLocale() ? OverlayViewPopupPosition.left : OverlayViewPopupPosition.right,
  ]
  const yPositions = viewConfig.position?.y ?? [OverlayViewPopupPosition.bottom]

  let finalLeft: number | null = null
  let finalTop: number | null = null
  let finalMaxHeight: number = 0
  let finalX: OverlayViewPopupPosition = xPositions[0]
  let finalY: OverlayViewPopupPosition = yPositions[0]

  outer: for (const y of yPositions) {
    for (const x of xPositions) {
      let top: number
      let left: number

      if (y === OverlayViewPopupPosition.top) {
        top = rect.top - popupRect.height - OFFSET
      } else if (y === OverlayViewPopupPosition.bottom) {
        top = rect.bottom + OFFSET
      } else {
        top = rect.top + rect.height / 2 - popupRect.height / 2
      }

      if (x === OverlayViewPopupPosition.left) {
        left =
          y === OverlayViewPopupPosition.center ? rect.left - popupRect.width - OFFSET : rect.left
      } else if (x === OverlayViewPopupPosition.right) {
        left =
          y === OverlayViewPopupPosition.center ? rect.right + OFFSET : rect.right - popupRect.width
      } else {
        left = rect.left + rect.width / 2 - popupRect.width / 2
      }

      const fitsX = left >= 0 && left + popupRect.width <= window.innerWidth
      const fitsY = top >= 0 && top + popupRect.height <= window.innerHeight

      if (fitsX && fitsY) {
        finalLeft = left
        finalTop = top
        finalX = x
        finalY = y
        finalMaxHeight =
          y === OverlayViewPopupPosition.top
            ? rect.top - OFFSET
            : y === OverlayViewPopupPosition.bottom
              ? window.innerHeight - top - OFFSET
              : window.innerHeight
        break outer
      }
    }
  }

  if (finalLeft === null || finalTop === null) {
    const y = yPositions[0]
    const x = xPositions[0]

    const top =
      y === OverlayViewPopupPosition.top
        ? rect.top - popupRect.height - OFFSET
        : y === OverlayViewPopupPosition.bottom
          ? rect.bottom + OFFSET
          : rect.top + rect.height / 2 - popupRect.height / 2

    const left =
      x === OverlayViewPopupPosition.left
        ? y === OverlayViewPopupPosition.center
          ? rect.left - popupRect.width - OFFSET
          : rect.left
        : x === OverlayViewPopupPosition.right
          ? y === OverlayViewPopupPosition.center
            ? rect.right + OFFSET
            : rect.right - popupRect.width
          : rect.left + rect.width / 2 - popupRect.width / 2

    finalLeft = left
    finalTop = top
    finalX = x
    finalY = y
    finalMaxHeight =
      y === OverlayViewPopupPosition.top
        ? rect.top - OFFSET
        : y === OverlayViewPopupPosition.bottom
          ? window.innerHeight - top - OFFSET
          : window.innerHeight
  }

  return {
    top: finalTop,
    left: finalLeft,
    maxHeight: finalMaxHeight,
    targetRect: rect,
    x: finalX,
    y: finalY,
  }
}
