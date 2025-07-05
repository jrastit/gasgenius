import { lazyConsumer } from '@1inch-community/core/lazy'
import { appendClass, appendStyle, scrollEnd, subscribe } from '@1inch-community/core/lit-utils'
import { getScrollbarStyle } from '@1inch-community/core/theme'
import { objectsEqual } from '@1inch-community/core/utils'
import { css, html, LitElement, TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { createRef, ref } from 'lit/directives/ref.js'
import { repeat } from 'lit/directives/repeat.js'
import { when } from 'lit/directives/when.js'
import { fromEvent, tap } from 'rxjs'
import '../button'
import '../icon'
import '../loaders'
import { scrollContext } from './scroll-context'

type ScrollViewVirtualizerConsumerFn<R> = (item: unknown, index: number) => R

@customElement(ScrollViewPaginatorConsumerElement.tagName)
export class ScrollViewPaginatorConsumerElement extends LitElement {
  static tagName = 'inch-scroll-view-paginator-consumer' as const

  static override styles = [
    getScrollbarStyle(':host', true),
    css`
      :host {
        position: relative;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        overflow-x: hidden;
      }

      .scroll-header {
        width: 100%;
        height: fit-content;
        box-sizing: border-box;
        position: sticky;
        background-color: var(--color-background-bg-primary);
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
      }

      .scroll-to-top-button {
        position: sticky;
        width: fit-content;
        bottom: 5%;
        left: 85%;
        z-index: 1000;
        transform: translateX(250%);
        pointer-events: none;
        transition: transform 0.2s;
      }

      .stub-view {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 9;
        width: 100%;
      }

      .loader {
        display: flex;
        height: 24px;
        margin-bottom: 12px;
        align-items: center;
        justify-content: center;
        margin-top: -25px;
      }

      :host(.show-scroll-to-top-button) .scroll-to-top-button {
        transform: translateX(0);
        pointer-events: all;
      }
    `,
  ]

  @property({ type: Array, attribute: false })
  set items(items: unknown[]) {
    if (objectsEqual(this._items, items)) return
    this._items = items
    this.reset()
  }

  get items() {
    return this._items
  }

  @property({ type: Object, attribute: false })
  keyFunction?: ScrollViewVirtualizerConsumerFn<string>

  @property({ type: Object, attribute: false })
  renderItem?: ScrollViewVirtualizerConsumerFn<TemplateResult<1>>

  @property({ type: Object, attribute: false })
  header?: () => TemplateResult<1>

  @property({ type: Object, attribute: false })
  stubView?: () => TemplateResult<1>

  @property({ type: Number, attribute: false }) pageSize = 15

  @state()
  private showStubView = false

  @state() private page = 1

  @state() _items: unknown[] = []

  private readonly context = lazyConsumer(this, { context: scrollContext, subscribe: true })

  private readonly headerRef = createRef<HTMLElement>()
  private readonly loaderRef = createRef<HTMLElement>()

  async scrollToIndex(index: number) {
    const normalizeIndex = this.header ? index + 1 : index
    const element = this.shadowRoot?.children[normalizeIndex]
    if (!element) return
    const rectElement = element.getBoundingClientRect()
    const rectHost = this.getBoundingClientRect()
    let top = rectElement.top - rectHost.top + this.scrollTop
    if (this.header && this.headerRef.value) {
      top -= this.headerRef.value.offsetHeight
    }
    if (this.scrollTop !== top) {
      this.scrollTo({ top, behavior: 'smooth' })
      await scrollEnd(this)
    }
  }

  protected override firstUpdated() {
    subscribe(
      this,
      [
        fromEvent(this, 'scroll').pipe(
          tap(() => {
            this.context.value.setScrollTopFromConsumer(this.scrollTop)
            const isBottom =
              this.scrollTop + this.clientHeight >=
              (this.loaderRef.value?.offsetTop ?? 0) + (this.loaderRef.value?.offsetHeight ?? 0)
            const isTop = this.scrollTop === 0
            if (isBottom) {
              this.page++
            }
            if (isTop && this.page > 1) {
              this.page = 1
            }
          })
        ),
      ],
      { requestUpdate: false }
    )
  }

  protected override render() {
    appendClass(this, {
      'show-scroll-to-top-button': this.page > 1,
    })
    const items = this.getItems()
    let length = items.length
    if (this.header) {
      length--
    }
    return html`
      ${repeat(
        items,
        (item, index) => this.keyFunctionHandler(item, index),
        (item, index) => this.renderItemInternal(item, index)
      )}+≠
      <inch-button
        class="scroll-to-top-button"
        @click="${() => this.scrollTo({ top: 0, behavior: 'smooth' })}"
      >
        <inch-icon style="transform: rotate(180deg)" icon="arrowDown16"></inch-icon>
      </inch-button>
      ${when(
        length < this.items.length,
        () => html`
          <div ${ref(this.loaderRef)} class="loader">
            <inch-loader-spinner></inch-loader-spinner>
          </div>
        `
      )}
    `
  }

  protected updated() {
    appendStyle(this, {
      maxHeight: this.context.value.maxHeight ? `${this.context.value.maxHeight}px` : undefined,
      height: this.context.value.maxHeight ? `${this.context.value.maxHeight}px` : undefined,
    })
  }

  private renderHeader() {
    if (!this.header) return html``
    return html`<div ${ref(this.headerRef)} class="scroll-header">${this.header()}</div>`
  }

  private reset() {
    this.page = 1
    this.scrollTo({ top: 0 })
  }

  private getItems() {
    if (this.showStubView) return []
    let items = this.items
    if (this.header) {
      items = [null, ...this.items]
    }
    const from = 0
    const to = this.page * this.pageSize
    return items.slice(from, to)
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
      return this.renderHeader()
    }
    return this.renderItem?.(item, index - 1) ?? html``
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [ScrollViewPaginatorConsumerElement.tagName]: ScrollViewPaginatorConsumerElement
  }
}
