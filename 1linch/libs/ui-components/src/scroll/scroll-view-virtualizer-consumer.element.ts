import { lazyConsumer } from '@1inch-community/core/lazy'
import {
  appendClass,
  appendStyle,
  getMobileMatchMediaAndSubscribe,
  getMobileMatchMediaEmitter,
  resizeObserver,
  scrollEnd,
  subscribe,
} from '@1inch-community/core/lit-utils'
import { getScrollbarStyle, scrollbarStyle } from '@1inch-community/core/theme'
import '@lit-labs/virtualizer'
import { type LitVirtualizer } from '@lit-labs/virtualizer'
import { virtualizerRef } from '@lit-labs/virtualizer/virtualize.js'
import { css, html, LitElement, TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { createRef, ref } from 'lit/directives/ref.js'
import { styleMap } from 'lit/directives/style-map.js'
import { fromEvent, merge, tap } from 'rxjs'
import '../button'
import '../icon'
import { scrollContext } from './scroll-context'

type ScrollViewVirtualizerConsumerFn<R> = (item: unknown, index: number) => R

@customElement(ScrollViewVirtualizerConsumerElement.tagName)
export class ScrollViewVirtualizerConsumerElement extends LitElement {
  static tagName = 'inch-scroll-view-virtualizer-consumer' as const

  static override styles = [
    getScrollbarStyle('lit-virtualizer', true),
    css`
      :host {
        position: relative;
        display: flex;
        flex-direction: column;
      }

      .scroll-header {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: fit-content;
        z-index: 9;
        overflow: hidden;
        box-sizing: border-box;
        background-color: var(--color-background-bg-primary);
      }

      .scroll-to-top-button {
        position: absolute;
        bottom: 16px;
        right: 16px;
        z-index: 10;
        transform: rotate(180deg) translateX(-200%);
        transition: transform 0.2s;
      }

      .stub-view {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 9;
        width: 100%;
      }

      :host(.show-scroll-to-top-button) .scroll-to-top-button {
        transform: rotate(180deg) translateX(0%);
      }
    `,
  ]

  @property({ type: Array, attribute: false })
  items: unknown[] = []

  @property({ type: Object, attribute: false })
  keyFunction?: ScrollViewVirtualizerConsumerFn<string>

  @property({ type: Object, attribute: false })
  renderItem?: ScrollViewVirtualizerConsumerFn<TemplateResult<1>>

  @property({ type: Object, attribute: false })
  header?: () => TemplateResult<1>

  @property({ type: Object, attribute: false })
  stubView?: () => TemplateResult<1>

  @state()
  private showStubView = false

  private readonly context = lazyConsumer(this, { context: scrollContext, subscribe: true })
  private globalOffsetY: number | null = null

  private readonly virtualizerRef = createRef<LitVirtualizer & VirtualizerHostElement>()
  private readonly headerRef = createRef<HTMLElement>()
  private readonly stubViewRef = createRef<HTMLElement>()

  private readonly headerStub = document.createElement('div')

  private readonly mobileMedia = getMobileMatchMediaAndSubscribe(this)

  get virtualizerHost() {
    if (!this.virtualizerRef.value) {
      throw new Error('')
    }
    return this.virtualizerRef.value
  }

  get virtualizer(): Virtualizer | undefined {
    return this.virtualizerHost[virtualizerRef]
  }

  async scrollToIndex(index: number) {
    const normalizeIndex = index + 1 - (this.virtualizer?._first ?? 0)
    const element = this.virtualizer?._children[normalizeIndex]
    if (!element) {
      return
    }
    const rectElement = element.getBoundingClientRect()
    const rectHost = this.virtualizerHost.getBoundingClientRect()
    let top = rectElement.top - rectHost.top + this.virtualizerHost.scrollTop
    if (this.header && this.headerRef.value) {
      top -= this.headerRef.value.offsetHeight
    }
    if (this.virtualizerHost.scrollTop !== top) {
      this.virtualizerHost.scrollTo({ top, behavior: 'smooth' })
      await scrollEnd(this.virtualizerHost)
    }
  }

  protected override firstUpdated() {
    if (!this.virtualizerRef.value) {
      return
    }
    const style = document.createElement('style')
    style.textContent = scrollbarStyle.cssText
    this.virtualizerRef.value.shadowRoot?.appendChild(style)
    subscribe(
      this,
      [
        merge(
          getMobileMatchMediaEmitter(),
          this.context.value.update$,
          resizeObserver(this.virtualizerHost)
        ).pipe(
          tap(() => {
            this.updateView()
            this.updateHeaderSize()
          })
        ),
        this.context.value.showStubView$.pipe(
          tap((state) => {
            this.showStubView = state
          })
        ),
        fromEvent<MouseEvent>(this.virtualizerRef.value, 'scroll', { passive: true }).pipe(
          tap(() => {
            const scrollTop = this.virtualizerRef.value?.scrollTop ?? 0
            this.context.value.setScrollTopFromConsumer(scrollTop)
            appendClass(this, {
              'show-scroll-to-top-button': scrollTop > 300,
            })
          })
        ),
      ],
      { requestUpdate: false }
    )
    if (this.headerRef.value) {
      subscribe(
        this,
        [resizeObserver(this.headerRef.value).pipe(tap(() => this.updateHeaderSize()))],
        { requestUpdate: false }
      )
    }
  }

  protected override render() {
    return html`
      ${this.renderHeader()} ${this.renderStubView()}
      <inch-button
        class="scroll-to-top-button"
        @click="${() => this.virtualizerRef.value?.scrollToIndex(0)}"
      >
        <inch-icon icon="arrowDown16"></inch-icon>
      </inch-button>
      <lit-virtualizer
        ${ref(this.virtualizerRef)}
        scroller
        .items=${this.getItems()}
        .keyFunction="${(item: unknown, index: number) => this.keyFunctionHandler(item, index)}"
        .renderItem=${(item: unknown, index: number) => this.renderItemInternal(item, index)}
      ></lit-virtualizer>
    `
  }

  protected updated() {
    this.updateView()
    this.updateHeaderSize()
  }

  private renderHeader() {
    if (!this.header) return html``
    return html`<div ${ref(this.headerRef)} class="scroll-header">${this.header()}</div>`
  }

  private renderStubView() {
    if (!this.stubView || !this.showStubView) return html``
    let top = '0'
    if (this.headerRef.value) {
      const height = this.headerRef.value.clientHeight
      top = `${height}px`
    }
    return html`<div ${ref(this.stubViewRef)} style="${styleMap({ top })}" class="stub-view">
      ${this.stubView()}
    </div>`
  }

  private updateHeaderSize() {
    if (this.headerRef.value) {
      const height = this.headerRef.value.clientHeight
      appendStyle(this.headerStub, {
        height: `${height}px`,
        width: '100%',
      })
      if (this.stubViewRef.value) {
        appendStyle(this.stubViewRef.value, {
          top: `${height}px`,
        })
      }
    }
  }

  private updateView() {
    // appendStyle(this, {
    //   maxHeight: this.context.value.maxHeight ? `${this.context.value.maxHeight}px` : undefined,
    //   height: this.context.value.maxHeight ? `${this.context.value.maxHeight}px` : undefined,
    // })
    if (this.mobileMedia.matches) {
      this.updateViewMobile()
    } else {
      this.updateViewDesktop()
    }
  }

  private updateViewMobile() {
    if (!this.context || !this.virtualizerRef.value) {
      return
    }
    const contextRect = this.getViewPortBoundingClientRect()
    const virtualizerRect = getRealBoundingClientRect(this.virtualizerHost)
    this.globalOffsetY = virtualizerRect.y - contextRect.y + 8 * 2
    this.virtualizerHost.style.minHeight = `${(this.context.value.maxHeight ?? 0) - this.globalOffsetY}px`
  }

  private updateViewDesktop() {
    if (!this.context || !this.virtualizerRef.value || !this.headerRef.value) {
      return
    }
    const contextRect = this.getViewPortBoundingClientRect()
    this.virtualizerHost.style.minHeight = `${contextRect.height}px`
  }

  private getViewPortBoundingClientRect() {
    return getRealBoundingClientRect(this.context.value)
  }

  private getItems() {
    if (this.showStubView) return []
    if (this.header) {
      return [null, ...this.items]
    }
    return this.items
  }

  private keyFunctionHandler(item: unknown, index: number) {
    if (this.header && index === 0) {
      return '____header____'
    }
    let normalizerIndex = index
    if (this.header) {
      normalizerIndex -= 1
    }
    if (this.keyFunction) {
      return this.keyFunction(item, normalizerIndex)
    }
    try {
      return `${normalizerIndex}:${JSON.stringify(item)}`
    } catch {
      return normalizerIndex
    }
  }

  private renderItemInternal(item: unknown, index: number): TemplateResult<1> {
    if (this.header && index === 0) {
      return html`${this.headerStub}`
    }
    return this.renderItem?.(item, index - 1) ?? html``
  }
}

function getRealBoundingClientRect(el: HTMLElement) {
  const width = el.offsetWidth
  const height = el.offsetHeight
  const x = el.offsetLeft
  const y = el.offsetTop

  return { width, height, x, y }
}

export interface VirtualizerHostElement extends HTMLElement {
  [virtualizerRef]?: Virtualizer
}

interface Virtualizer {
  _first: number
  _children: Array<HTMLElement>
}

declare global {
  interface HTMLElementTagNameMap {
    [ScrollViewVirtualizerConsumerElement.tagName]: ScrollViewVirtualizerConsumerElement
  }
}
