import { asyncFrame } from '@1inch-community/core/async'
import {
  appendStyle,
  getMobileMatchMediaEmitter,
  isSafari,
  isStandalone,
  resizeObserver,
} from '@1inch-community/core/lit-utils'
import { applyColorBrightness, setBrowserMetaColorFilter } from '@1inch-community/core/theme'
import { IOverlayController, OverlayViewMode } from '@1inch-community/models'
import { html, render, TemplateResult } from 'lit'
import {
  distinctUntilChanged,
  filter,
  fromEvent,
  map,
  merge,
  pairwise,
  skip,
  Subscription,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs'
import { ScrollViewProviderElement } from '../scroll'
import { getContainer } from './overlay-container'
import { getOverlayId } from './overlay-id-generator'
import { zIndexMap } from './z-index-map'

const lerp = (min: number, max: number, percent: number): number => {
  return min + (max - min) * (percent / 100)
}

const scaleAndTranslate = (scale: number, offset: number) =>
  `scale3d(${scale}, ${scale}, ${scale}) translate3d(0, ${offset}%, 0)`

const blur = (blur: number) => `blur(${blur}px)`

const translate = (y: number) => `translate3d(0, ${y}%, 0)`

const overlayBorderRadius = (radius: number) => `${radius}px ${radius}px 0 0`

const isOverlayNode = (node: HTMLElement) =>
  node.id === 'overlay-container' && node instanceof ScrollViewProviderElement

let touchPositionMap: WeakMap<HTMLElement, object> = new WeakMap()

const clearTouchPositionMap = () => {
  touchPositionMap = new WeakMap()
}

export class OverlayMobileController implements IOverlayController {
  private readonly scale = 0.85
  private readonly borderRadius = 8
  private readonly topOffsetPercent = -5
  private readonly overlayBorderRadius = 24
  private readonly overlayBackgroundBlur = 1

  private get container() {
    return getContainer()
  }

  private readonly activeOverlayMap = new Map<number, [ScrollViewProviderElement, HTMLElement]>()
  private readonly subscriptions = new Map<number, Subscription>()
  private readonly overlayIdStack: number[] = []

  constructor(private readonly rootNodeName: string) {}

  async init(): Promise<void> {}

  isOpenOverlay(overlayId: number): overlayId is number {
    return this.activeOverlayMap.has(overlayId)
  }

  async open(openTarget: TemplateResult | HTMLElement): Promise<number> {
    clearTouchPositionMap()
    const id = getOverlayId()
    const previousOverlayId = this.findPreviousOverlayId(id)
    const overlayBackground = this.createOverlayBackground(id)
    const overlayContainer = this.createOverlayContainer(id, openTarget)
    const rootNode = this.getRootNodeOrPreviousOverlay(previousOverlayId)
    const previousOverlayBackground = this.getPreviousOverlayBackground(previousOverlayId)
    if (rootNode instanceof ScrollViewProviderElement) {
      rootNode.onChangeStubView(true)
      rootNode.onLockedConsumer(true)
    }
    await asyncFrame(10)
    const fullOverlayView = this.calculateIsFullOverlayView(overlayContainer)
    await this.transition(
      'open',
      fullOverlayView,
      overlayContainer,
      overlayBackground,
      rootNode,
      previousOverlayBackground
    )
    this.applyStyleAfterTransition(
      'open',
      fullOverlayView,
      overlayContainer,
      overlayBackground,
      rootNode,
      previousOverlayBackground
    )
    overlayContainer.takeUpdate()
    this.activeOverlayMap.set(id, [overlayContainer, overlayBackground])
    this.overlayIdStack.unshift(id)
    this.subscribe(id, overlayContainer, overlayBackground, rootNode, previousOverlayBackground)
    overlayContainer.onChangeStubView(false)
    return id
  }

  async close(id: number): Promise<void> {
    if (!this.activeOverlayMap.has(id)) {
      return
    }
    const previousOverlayId = this.findPreviousOverlayId(id)
    const [overlayContainer, overlayBackground] = this.activeOverlayMap.get(id)!
    const rootNode = this.getRootNodeOrPreviousOverlay(previousOverlayId)
    const previousOverlayBackground = this.getPreviousOverlayBackground(previousOverlayId)
    const fullOverlayView = this.calculateIsFullOverlayView(overlayContainer)
    await this.transition(
      'close',
      fullOverlayView,
      overlayContainer,
      overlayBackground,
      rootNode,
      previousOverlayBackground
    )
    this.applyStyleAfterTransition(
      'close',
      fullOverlayView,
      overlayContainer,
      overlayBackground,
      rootNode,
      previousOverlayBackground
    )
    if (rootNode instanceof ScrollViewProviderElement) {
      rootNode.onLockedConsumer(false)
      rootNode.onChangeStubView(false)
    }
    this.unsubscribeOnResize(id)
    this.activeOverlayMap.delete(id)
    this.overlayIdStack.shift()
    overlayContainer.remove()
    overlayBackground.remove()
    clearTouchPositionMap()
  }

  async closeAll() {
    while (this.overlayIdStack.length > 0) {
      const id = this.overlayIdStack[0]
      await this.close(id)
    }
  }

  private createOverlayContainer(id: number, openTarget: TemplateResult | HTMLElement) {
    const overlayContainer = document.createElement(ScrollViewProviderElement.tagName)
    const overlayIndex = this.activeOverlayMap.size + 1
    const offsetStep = 5
    const innerHeight = isSafari() && isStandalone() ? window.innerHeight - 10 : window.innerHeight
    overlayContainer.onChangeStubView(true)
    overlayContainer.maxHeight = ((100 - overlayIndex * offsetStep) * innerHeight) / 100
    overlayContainer.id = 'overlay-container'
    overlayContainer.setAttribute('overlay-id', id.toString())
    overlayContainer.setAttribute('overlay-index', overlayIndex.toString())
    const [startKeyframe] = this.getStyleForOverlayContainer('open', overlayContainer)
    const startPosition: Partial<CSSStyleDeclaration> =
      startKeyframe as Partial<CSSStyleDeclaration>
    const zIndex = zIndexMap[OverlayViewMode.mobile]
    appendStyle(overlayContainer, {
      position: 'fixed',
      display: 'flex',
      width: '100vw',
      overflow: 'hidden',
      alignItems: 'flex-end',
      bottom: '0',
      left: '0',
      zIndex: `${zIndex + id * 10 + 1}`,
      boxSizing: 'border-box',
      borderRadius: overlayBorderRadius(this.overlayBorderRadius),
      ...startPosition,
    })
    if (isSafari() && isStandalone()) {
      appendStyle(overlayContainer, {
        bottom: '10px',
      })
    }
    render(html`${openTarget}`, overlayContainer)
    this.container.appendChild(overlayContainer)
    return overlayContainer
  }

  private createOverlayBackground(id: number) {
    const overlayBackground = document.createElement('div') as HTMLElement
    overlayBackground.id = 'overlay-background'
    overlayBackground.setAttribute('overlay-background-id', id.toString())
    const [start] = this.getStyleForOverlayBackground('open')
    const zIndex = zIndexMap[OverlayViewMode.mobile]
    appendStyle(overlayBackground, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.4)',
      zIndex: `${zIndex + id * 10}`,
      ...start,
    })
    this.container.appendChild(overlayBackground)
    return overlayBackground
  }

  private async transition(
    direction: 'open' | 'close',
    fullOverlayView: boolean,
    overlayContainer: HTMLElement,
    overlayBackground: HTMLElement,
    rootNodeOrPreviousOverlay: HTMLElement,
    previousOverlayBackground: HTMLElement | null
  ) {
    const animationOptions = this.getDefaultAnimationOptions()
    const overlayContainerStyle = this.getStyleForOverlayContainer(
      direction,
      overlayContainer
    ) as Keyframe[]
    const overlayBackgroundStyle = this.getStyleForOverlayBackground(direction) as Keyframe[]
    const rootNodeOrPreviousOverlayStyle = this.getStyleForRootNodeOrPreviousOverlay(
      direction,
      fullOverlayView,
      rootNodeOrPreviousOverlay
    ) as Keyframe[]
    const previousOverlayBackgroundStyle = this.getStyleForPreviousOverlayBackground(
      direction
    ) as Keyframe[]
    const resetMetaColor = direction === 'close' && this.activeOverlayMap.size === 1
    await Promise.all([
      this.updateBrowserMetaColor(fullOverlayView, resetMetaColor),
      overlayContainer.animate(overlayContainerStyle, animationOptions).finished,
      overlayBackground.animate(overlayBackgroundStyle, animationOptions).finished,
      rootNodeOrPreviousOverlay.animate(rootNodeOrPreviousOverlayStyle, animationOptions).finished,
      previousOverlayBackground
        ? previousOverlayBackground.animate(previousOverlayBackgroundStyle, animationOptions)
            .finished
        : null,
    ])
  }

  private async transitionFullView(
    direction: 'open' | 'close',
    fullOverlayView: boolean,
    rootNodeOrPreviousOverlay: HTMLElement
  ) {
    const animationOptions = this.getDefaultAnimationOptions()
    const rootNodeOrPreviousOverlayStyle = this.getStyleForRootNodeOrPreviousOverlay(
      direction,
      fullOverlayView,
      rootNodeOrPreviousOverlay
    ) as Keyframe[]
    await rootNodeOrPreviousOverlay.animate(rootNodeOrPreviousOverlayStyle, animationOptions)
      .finished
  }

  private applyStyleAfterTransition(
    direction: 'open' | 'close',
    fullOverlayView: boolean,
    overlayContainer: HTMLElement,
    overlayBackground: HTMLElement,
    rootNodeOrPreviousOverlay: HTMLElement,
    previousOverlayBackground: HTMLElement | null
  ) {
    const [, overlayContainerFinishStyle] = this.getStyleForOverlayContainer(
      direction,
      overlayContainer
    )
    const [, overlayBackgroundFinishStyle] = this.getStyleForOverlayBackground(direction)
    const [, rootNodeOrPreviousOverlayFinishStyle] = this.getStyleForRootNodeOrPreviousOverlay(
      direction,
      fullOverlayView,
      rootNodeOrPreviousOverlay,
      true
    )
    appendStyle(overlayContainer, {
      ...overlayContainerFinishStyle,
    })
    appendStyle(overlayBackground, {
      ...overlayBackgroundFinishStyle,
    })
    appendStyle(rootNodeOrPreviousOverlay, {
      ...rootNodeOrPreviousOverlayFinishStyle,
    })
    if (previousOverlayBackground) {
      const [, previousOverlayBackgroundFinishStyle] =
        this.getStyleForPreviousOverlayBackground(direction)
      appendStyle(previousOverlayBackground, {
        ...previousOverlayBackgroundFinishStyle,
      })
    }
  }

  private applyStyleAfterTransitionFullView(
    direction: 'open' | 'close',
    fullOverlayView: boolean,
    rootNodeOrPreviousOverlay: HTMLElement
  ) {
    const [, rootNodeOrPreviousOverlayFinishStyle] = this.getStyleForRootNodeOrPreviousOverlay(
      direction,
      fullOverlayView,
      rootNodeOrPreviousOverlay,
      true
    )
    appendStyle(rootNodeOrPreviousOverlay, {
      ...rootNodeOrPreviousOverlayFinishStyle,
    })
  }

  private getStyleForOverlayContainer(direction: 'open' | 'close', node: HTMLElement) {
    const { position } = (touchPositionMap.get(node) as { position?: number }) ?? {}

    const start: Record<typeof direction, Record<string, string>> = {
      open: { transform: translate(position ?? 100) },
      close: { transform: translate(position ?? 0) },
    }

    const finish: Record<typeof direction, Record<string, string>> = {
      open: { transform: translate(0) },
      close: { transform: translate(100) },
    }

    return [start[direction], finish[direction]]
  }

  private getStyleForOverlayBackground(direction: 'open' | 'close') {
    const start: Record<typeof direction, Record<string, string>> = {
      open: { backdropFilter: blur(0), opacity: '0' },
      close: {
        backdropFilter: blur(this.overlayBackgroundBlur),
        opacity: '1',
      },
    }
    const finish: Record<typeof direction, Record<string, string>> = {
      open: start.close,
      close: start.open,
    }
    return [start[direction], finish[direction]]
  }

  private getStyleForRootNodeOrPreviousOverlay(
    direction: 'open' | 'close',
    fullOverlayView: boolean,
    node: HTMLElement,
    styleForAppend = false
  ) {
    if (!fullOverlayView) {
      return [{}, {}]
    }

    const { scale, offset } = this.calculateTransform(node)
    const stored = (touchPositionMap.get(node) as {
      scale: number
      offset: number
      borderRadius: number
    }) ?? { scale: 1, offset: 0, borderRadius: 0 }

    const isOverlay = isOverlayNode(node)

    const baseTransform = styleForAppend ? '' : scaleAndTranslate(1, 0)
    const baseBorderRadius = isOverlay
      ? overlayBorderRadius(this.overlayBorderRadius)
      : overlayBorderRadius(0)

    const storageTransform =
      stored.scale && stored.offset ? scaleAndTranslate(stored.scale, stored.offset) : null
    const storageBorderRadius = stored.borderRadius
      ? overlayBorderRadius(stored.borderRadius)
      : null

    const start: Record<typeof direction, Record<string, string>> = {
      open: {
        transform: storageTransform ?? baseTransform,
        borderRadius: storageBorderRadius ?? baseBorderRadius,
      },
      close: {
        transform: storageTransform ?? scaleAndTranslate(scale, offset),
        borderRadius: storageBorderRadius ?? `${this.borderRadius}px`,
      },
    }

    const finish: Record<typeof direction, Record<string, string>> = {
      open: {
        transform: scaleAndTranslate(scale, offset),
        borderRadius: `${this.borderRadius}px`,
      },
      close: {
        transform: baseTransform,
        borderRadius: baseBorderRadius,
      },
    }

    return [start[direction], finish[direction]]
  }

  private getStyleForPreviousOverlayBackground(direction: 'open' | 'close') {
    const [start, finish] = this.getStyleForOverlayBackground(direction)
    return [finish, start]
  }

  private calculateTransform(node: HTMLElement) {
    const index = Number(node.getAttribute('overlay-index'))
    return {
      scale: this.scale + index * 0.02,
      offset: this.topOffsetPercent - index * 2,
    }
  }

  private getRootNodeOrPreviousOverlay(id: number | null): HTMLElement | ScrollViewProviderElement {
    if (id === null) {
      return document.querySelector(this.rootNodeName) as HTMLElement
    }
    const frontNode = this.container.querySelector(
      `#overlay-container[overlay-id="${id}"]`
    ) as ScrollViewProviderElement | null
    if (!frontNode) {
      return document.querySelector(this.rootNodeName) as HTMLElement
    }
    return frontNode
  }

  private getPreviousOverlayBackground(id: number | null): HTMLElement | null {
    if (id === null) return null
    return this.container.querySelector(
      `#overlay-background[overlay-background-id="${id}"]`
    ) as HTMLElement | null
  }

  private findPreviousOverlayId(id: number): number | null {
    const index = this.overlayIdStack.indexOf(id)
    if (index === -1) return this.overlayIdStack[0] ?? null
    return this.overlayIdStack[index + 1] ?? null
  }

  private subscribe(
    id: number,
    overlayContainer: ScrollViewProviderElement,
    overlayBackground: HTMLElement,
    rootNodeOrPreviousOverlay: HTMLElement,
    previousOverlayBackground: HTMLElement | null
  ) {
    const closeIfChangeMobileView$ = getMobileMatchMediaEmitter().pipe(
      skip(1),
      tap(() => this.close(id))
    )
    const changeFullView$ = resizeObserver(overlayContainer).pipe(
      filter(() => this.overlayIdStack[0] === id),
      map(() => this.calculateIsFullOverlayView(overlayContainer)),
      distinctUntilChanged(),
      pairwise(),
      switchMap(async ([prevFullOverlayView, currFullOverlayView]) => {
        const direction = prevFullOverlayView ? 'close' : 'open'
        const fullOverlayView = prevFullOverlayView ? prevFullOverlayView : currFullOverlayView
        await this.transitionFullView(direction, fullOverlayView, rootNodeOrPreviousOverlay)
        this.applyStyleAfterTransitionFullView(
          direction,
          fullOverlayView,
          rootNodeOrPreviousOverlay
        )
      })
    )
    const closeOnClickBackground$ = fromEvent(overlayBackground, 'click').pipe(
      tap(() => this.close(id))
    )

    const touch$ = fromEvent<TouchEvent>(overlayContainer, 'touchstart', { passive: true }).pipe(
      filter(() => (overlayContainer.scrollTopFromConsumer ?? 0) === 0),
      switchMap((startEvent) => {
        const fullView = this.calculateIsFullOverlayView(overlayContainer)
        const { scale, offset } = this.calculateTransform(rootNodeOrPreviousOverlay)
        const overlayContainerHeight = overlayContainer.clientHeight
        const startPoint = startEvent.touches[0].clientY
        const swipeMaxForClose = 30
        let currentDelta = 0
        let closeReady = false
        return fromEvent<TouchEvent>(overlayContainer, 'touchmove', { passive: true }).pipe(
          filter(() => !closeReady),
          tap(async (event: TouchEvent) => {
            const currentPoint = event.touches[0].clientY
            const deltaPoint = currentPoint - startPoint
            const delta = (deltaPoint * 100) / overlayContainerHeight
            if (delta < 0) return
            if (delta >= swipeMaxForClose) {
              closeReady = true
              return await this.close(id)
            }
            currentDelta = delta
            const lerpBlur = lerp(this.overlayBackgroundBlur, 0, delta)
            const lerpOpacity = lerp(1, 0, delta)
            appendStyle(overlayContainer, {
              transform: translate(delta),
            })
            appendStyle(overlayBackground, {
              backdropFilter: blur(lerpBlur),
              opacity: lerpOpacity.toString(),
            })
            touchPositionMap.set(overlayContainer, { position: delta })
            touchPositionMap.set(overlayBackground, { blur: lerpBlur, opacity: lerpOpacity })
            if (previousOverlayBackground) {
              const lerpBlurPreviousOverlayBackground = lerp(0, this.overlayBackgroundBlur, delta)
              const lerpOpacityPreviousOverlayBackground = lerp(0, 1, delta)
              appendStyle(previousOverlayBackground, {
                backdropFilter: blur(lerpBlurPreviousOverlayBackground),
                opacity: lerpOpacityPreviousOverlayBackground.toString(),
              })
              touchPositionMap.set(previousOverlayBackground, {
                blur: lerpBlurPreviousOverlayBackground,
                opacity: lerpOpacityPreviousOverlayBackground,
              })
            }
            if (fullView) {
              const isOverlay = isOverlayNode(rootNodeOrPreviousOverlay)
              const lerpScale = lerp(scale, 1, delta)
              const lerpOffset = lerp(offset, 0, delta)
              const lerpBorder = lerp(
                this.borderRadius,
                isOverlay ? this.overlayBorderRadius : 0,
                delta
              )
              appendStyle(rootNodeOrPreviousOverlay, {
                transform: scaleAndTranslate(lerpScale, lerpOffset),
                borderRadius: overlayBorderRadius(lerpBorder),
              })
              touchPositionMap.set(rootNodeOrPreviousOverlay, {
                scale: lerpScale,
                offset: lerpOffset,
                borderRadius: lerpBorder,
              })
            }
          }),
          takeUntil(
            merge(
              fromEvent<TouchEvent>(overlayContainer, 'touchend', { passive: true }),
              fromEvent<TouchEvent>(overlayContainer, 'touchcancel', { passive: true })
            ).pipe(
              filter(() => !closeReady),
              tap(async (endEvent: TouchEvent) => {
                if (currentDelta === 0) return
                if (
                  endEvent.timeStamp - startEvent.timeStamp < 300 &&
                  currentDelta > swipeMaxForClose / 2
                ) {
                  return await this.close(id)
                }
                await this.transition(
                  'open',
                  fullView,
                  overlayContainer,
                  overlayBackground,
                  rootNodeOrPreviousOverlay,
                  previousOverlayBackground
                )
                this.applyStyleAfterTransition(
                  'open',
                  fullView,
                  overlayContainer,
                  overlayBackground,
                  rootNodeOrPreviousOverlay,
                  previousOverlayBackground
                )
                clearTouchPositionMap()
              })
            )
          )
        )
      })
    )

    const subscription = merge(
      closeIfChangeMobileView$,
      changeFullView$,
      closeOnClickBackground$,
      touch$
    ).subscribe()
    this.subscriptions.set(id, subscription)
  }

  private unsubscribeOnResize(overlayId: number) {
    try {
      if (!this.subscriptions.has(overlayId)) return
      const subscription = this.subscriptions.get(overlayId)!
      if (subscription.closed) return
      subscription.unsubscribe()
    } finally {
      this.subscriptions.delete(overlayId)
    }
  }

  private calculateIsFullOverlayView(element: ScrollViewProviderElement): boolean {
    const height = element.clientHeight
    const maxHeight = element.maxHeight ?? 0
    return (height * 100) / maxHeight >= 90
  }

  private getDefaultAnimationOptions() {
    return {
      duration: 500,
      easing: 'cubic-bezier(.2, .8, .2, 1)',
    }
  }

  private async updateBrowserMetaColor(fullOverlayView: boolean, resetColor: boolean) {
    appendStyle(document.body, {
      backgroundColor: resetColor ? '' : 'var(--color-background-bg-overlay)',
    })
    await setBrowserMetaColorFilter(
      resetColor
        ? null
        : (color: string, isDarkTheme: boolean) => {
            if (isDarkTheme && fullOverlayView) {
              return applyColorBrightness('#ffffff', 0.6)
            }
            if (!isDarkTheme && fullOverlayView) {
              return applyColorBrightness('#000000', 0.6)
            }
            if (!fullOverlayView) {
              return applyColorBrightness(color, 0.6)
            }
            return color
          }
    )
  }
}
