import { lazyAppContextConsumer } from '@1inch-community/core/lazy'
import { appendStyle } from '@1inch-community/core/lit-utils'
import {
  IApplicationContext,
  ILazyValue,
  OverlayViewMode,
  OverlayViewPopupPosition,
} from '@1inch-community/models'
import { html, ReactiveControllerHost, TemplateResult } from 'lit'
import { AsyncDirective } from 'lit/async-directive.js'
import { isTemplateResult } from 'lit/directive-helpers.js'
import { directive, DirectiveResult, ElementPartInfo, PartType } from 'lit/directive.js'
import { styleMap } from 'lit/directives/style-map.js'
import { debounceTime, fromEvent, merge, Subscription, switchMap, tap, timer } from 'rxjs'
import './tooltip.element'

type CustomElementPartInfo = {
  element: HTMLElement
  options: { host: ReactiveControllerHost & HTMLElement }
}

type TooltipDirectiveOptions = {
  text: string | TemplateResult
  openDelay?: number
  closeDelay?: number
  maxWidth?: number
  maxHeight?: number
  disabled?: boolean
  disabledCursorPointer?: boolean
  position?: {
    x?: OverlayViewPopupPosition[]
    y?: OverlayViewPopupPosition[]
  }
}

const defaultPosition = {
  x: [
    OverlayViewPopupPosition.center,
    OverlayViewPopupPosition.right,
    OverlayViewPopupPosition.left,
  ],
  y: [OverlayViewPopupPosition.top, OverlayViewPopupPosition.bottom],
}

type TooltipDirectiveOptionsOrString = TooltipDirectiveOptions['text'] | TooltipDirectiveOptions

class TooltipDirective extends AsyncDirective {
  private readonly subscription: Subscription

  private overlayId: number | null = null
  private options: TooltipDirectiveOptions = { text: '' }
  private readonly context: ILazyValue<IApplicationContext>

  constructor(private readonly partInfo: ElementPartInfo & CustomElementPartInfo) {
    super(partInfo)
    if (this.partInfo.type !== PartType.ELEMENT) {
      throw new Error('tooltip directive support only elements')
    }
    this.context = lazyAppContextConsumer(partInfo.options.host)
    this.subscription = merge(this.mouse(), this.touch()).subscribe()
  }

  render(text: TooltipDirectiveOptionsOrString) {
    if (typeof text === 'string' || isTemplateResult(text)) {
      this.options = { text }
    } else {
      this.options = text
    }

    if (!this.options.disabledCursorPointer) {
      appendStyle(this.partInfo.element, {
        cursor: 'pointer',
      })
    }
  }

  override disconnected() {
    this.subscription.unsubscribe()
  }

  private mouse() {
    const mouseleave$ = fromEvent(this.partInfo.element, 'mouseleave').pipe(
      debounceTime(this.options.closeDelay ?? 200),
      tap(async () => {
        await this.closeTooltip()
      })
    )
    return fromEvent(this.partInfo.element, 'mouseenter').pipe(
      debounceTime(this.options.openDelay ?? 500),
      switchMap(async () => this.openTooltip(true)),
      switchMap(() => mouseleave$)
    )
  }

  private touch() {
    return fromEvent(this.partInfo.element, 'touchstart').pipe(
      switchMap(async () => this.openTooltip(false)),
      switchMap(() => timer(3000).pipe(tap(() => this.closeTooltip())))
    )
  }

  private async openTooltip(checkHover: boolean) {
    if (
      this.options.disabled ||
      this.overlayId ||
      (checkHover && !this.partInfo.element.matches(':hover'))
    )
      return
    const style = {
      maxWidth: this.options.maxWidth ? `${this.options.maxWidth}px` : undefined,
      maxHeight: this.options.maxHeight ? `${this.options.maxHeight}px` : undefined,
    }
    this.overlayId = await this.context.value.overlay.open(
      html`<inch-tooltip style="${styleMap(style)}" .text="${this.options.text}"></inch-tooltip>`,
      {
        mode: OverlayViewMode.popup,
        position: {
          x: this.options.position?.x ?? defaultPosition.x,
          y: this.options.position?.y ?? defaultPosition.y,
        },
        targetFactory: () => this.partInfo.element,
        customOverlayContainerStyle: {
          borderRadius: '4px',
          pointerEvents: 'none',
        },
      }
    )
    if (checkHover && !this.partInfo.element.matches(':hover')) {
      await this.closeTooltip()
    }
  }

  private async closeTooltip() {
    if (this.overlayId && this.context.value.overlay.isOpenOverlay(this.overlayId)) {
      await this.context.value.overlay.close(this.overlayId)
    }
    this.overlayId = null
  }
}

export const tooltip: (text: TooltipDirectiveOptionsOrString) => DirectiveResult = directive(
  TooltipDirective as any
)
