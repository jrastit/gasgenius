import { appendStyle } from '@1inch-community/core/lit-utils'
import {
  IOverlayController,
  OverlayViewConfigDesktop,
  OverlayViewMode,
} from '@1inch-community/models'
import { html, render, TemplateResult } from 'lit'
import { fromEvent, Subscription } from 'rxjs'
import { ScrollViewProviderElement } from '../scroll'
import { getContainer } from './overlay-container'
import { getOverlayId } from './overlay-id-generator'
import { zIndexMap } from './z-index-map'

export class OverlayDesktopController implements IOverlayController {
  private readonly activeOverlayMap = new Map<
    number,
    [HTMLElement | null, HTMLElement | null, HTMLElement]
  >()
  private readonly subscriptions = new Map<number, Subscription>()

  private get container() {
    return getContainer()
  }

  private readonly overlayWidth = 540
  private readonly overlayPadding = 8
  private readonly overlayStartPositionPercent = 105

  async init(): Promise<void> {}

  isOpenOverlay(overlayId: number): overlayId is number {
    return this.activeOverlayMap.has(overlayId)
  }

  async open(
    content: TemplateResult | HTMLElement,
    viewConfig: OverlayViewConfigDesktop
  ): Promise<number> {
    const id = getOverlayId()
    const target = viewConfig.targetFactory?.() ?? null
    const overlayContainer = this.createOverlayContainer(id, content)
    const [targetOffset, showBackground] = this.calculateTargetOffset(target)
    let overlayBackground: HTMLElement | null = null
    if (showBackground) {
      overlayBackground = this.createOverlayBackground(id)
    }
    await this.transition(target, overlayContainer, overlayBackground, targetOffset)
    this.activeOverlayMap.set(id, [target, overlayBackground, overlayContainer])
    this.subscribe(id)
    return id
  }

  async close(overlayId: number) {
    if (!this.activeOverlayMap.has(overlayId)) {
      return
    }
    const [target, overlayBackground, overlayContainer] = this.activeOverlayMap.get(overlayId)!
    await this.transition(target, overlayContainer, overlayBackground, 0, true)

    this.unsubscribe(overlayId)
    overlayContainer.remove()
    overlayBackground?.remove()
    this.activeOverlayMap.delete(overlayId)
  }

  private calculateTargetOffset(target: HTMLElement | null): [number, boolean] {
    if (!target) return [0, false]
    const targetRect = target.getBoundingClientRect()
    const windowWidth = window.innerWidth
    const overlayWidth = this.overlayWidth
    const overlap = windowWidth - overlayWidth
    const result = targetRect.right - overlap + this.overlayPadding * 3
    if (targetRect.width + targetRect.left + result + 16 > windowWidth || result < 0) {
      return [0, result > 0]
    }
    return [result, false]
  }

  private getDefaultAnimationOptions() {
    return {
      duration: 500,
      easing: 'cubic-bezier(.2, .8, .2, 1)',
    }
  }

  private async transition(
    target: HTMLElement | null,
    overlayContainer: HTMLElement,
    overlayBackground: HTMLElement | null,
    targetOffset: number,
    isBack: boolean = false
  ): Promise<void> {
    const defaultAnimationOptions = this.getDefaultAnimationOptions()
    const transitionOverlayContainerStart = () => ({
      transform: `translate3d(${isBack ? this.overlayStartPositionPercent : 0}%, 0, 0)`,
    })
    const transitionTargetStart = () => ({
      transform: `translate3d(${isBack ? 0 : -targetOffset}px, 0, 0)`,
    })
    const transitionOverlayBackground = () => ({
      opacity: isBack ? '0' : '1',
    })

    const animateTarget = async () => {
      if (!target) return
      if (targetOffset === 0 && !isBack) return
      return target.animate([transitionTargetStart()], defaultAnimationOptions).finished
    }

    const animateOverlay = () => {
      return overlayContainer.animate([transitionOverlayContainerStart()], defaultAnimationOptions)
        .finished
    }

    const animateOverlayBackground = async () => {
      if (!overlayBackground) return
      overlayBackground.animate([transitionOverlayBackground()], defaultAnimationOptions)
    }

    await Promise.all([animateOverlay(), animateTarget(), animateOverlayBackground()])
    appendStyle(overlayContainer, {
      transform: '',
    })
    if (targetOffset !== 0 && target) {
      appendStyle(target, {
        ...transitionTargetStart(),
      })
    }
    if (overlayBackground) {
      appendStyle(overlayBackground, {
        ...transitionOverlayBackground(),
      })
    }
    if (isBack && target) {
      appendStyle(target, {
        transform: '',
      })
    }
  }

  private createOverlayContainer(id: number, content: TemplateResult | HTMLElement) {
    const overlayContainer = document.createElement(ScrollViewProviderElement.tagName)
    const overlayIndex = this.activeOverlayMap.size + 1
    const padding = this.overlayPadding
    overlayContainer.maxHeight = window.innerHeight - padding * 2
    overlayContainer.setMaxHeight = true
    overlayContainer.setAttribute('overlay-index', overlayIndex.toString())
    const zIndex = zIndexMap[OverlayViewMode.desktop]
    appendStyle(overlayContainer, {
      position: 'fixed',
      display: 'flex',
      width: `${this.overlayWidth}px`,
      overflow: 'hidden',
      alignItems: 'flex-end',
      top: `${padding}px`,
      right: `${padding}px`,
      zIndex: `${zIndex + id * 10 + 5}`,
      borderRadius: '24px',
      boxSizing: 'border-box',
      boxShadow: '0px 4px 4px -2px rgba(24, 39, 75, 0.08), 0px 2px 4px -2px rgba(24, 39, 75, 0.12)',
      transform: `translate3d(${this.overlayStartPositionPercent}%, 0, 0)`,
    })
    render(html`${content}`, overlayContainer)
    this.container.appendChild(overlayContainer)
    return overlayContainer
  }

  private createOverlayBackground(id: number) {
    const overlayBackground = document.createElement('div')
    const zIndex = zIndexMap[OverlayViewMode.desktop]
    appendStyle(overlayBackground, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      backdropFilter: 'blur(2px)',
      opacity: '0',
      cursor: 'pointer',
      zIndex: `${zIndex + id * 10}`,
    })
    this.container.appendChild(overlayBackground)
    return overlayBackground
  }

  private subscribe(overlayId: number) {
    if (!this.activeOverlayMap.has(overlayId)) {
      throw new Error(`Overlay id ${overlayId} not found`)
    }
    const subscription = new Subscription()
    const [, overlayBackground, overlayContainer] = this.activeOverlayMap.get(overlayId)!
    if (!overlayContainer) return
    subscription.add(fromEvent(window, 'resize').subscribe(() => this.close(overlayId).catch()))
    if (overlayBackground) {
      subscription.add(
        fromEvent(overlayBackground, 'click').subscribe(() => this.close(overlayId).catch())
      )
    }
    this.subscriptions.set(overlayId, subscription)
  }

  private unsubscribe(overlayId: number) {
    if (!this.subscriptions.has(overlayId)) return
    const subscription = this.subscriptions.get(overlayId)!
    if (subscription.closed) return
    subscription.unsubscribe()
    this.subscriptions.delete(overlayId)
  }
}
