import { appendClass, dispatchEvent, subscribe } from '@1inch-community/core/lit-utils'
import { ChainId } from '@1inch-community/models'
import '@1inch-community/ui-components/icon'
import '@1inch-community/ui-components/loaders'
import '@1inch-community/ui-components/marquee'
import { html, LitElement, TemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'
import { when } from 'lit/directives/when.js'
import { fromEvent, tap } from 'rxjs'
import { Address } from 'viem'
import '../../balance-view'
import '../../token-icon'
import { tokenItemBaseStyle } from './token-item-base.style'

@customElement(TokenItemBaseElement.tagName)
export class TokenItemBaseElement extends LitElement {
  static tagName = 'inch-token-item-base' as const

  static override styles = tokenItemBaseStyle

  @property({ type: Array, attribute: false }) chainIds?: ChainId[]
  @property({ type: Object, attribute: false }) iconAfterStyle?: Record<string, string>
  @property({ type: Object, attribute: false }) iconAfterProps?: Record<string, string>
  @property({ type: String, attribute: false }) tokenChainId?: ChainId
  @property({ type: String, attribute: false }) tokenAddress?: Address
  @property({ type: String, attribute: false }) tokenNameText?: string
  @property({ type: String, attribute: false }) tokenNetworkText?: string | TemplateResult<1>
  @property({ type: String, attribute: false }) symbol?: string
  @property({ type: String, attribute: false }) walletAddress?: Address
  @property({ type: String, attribute: false }) iconAfterName?: string
  @property({ type: Number, attribute: false }) index = 0
  @property({ type: Number, attribute: false }) additionalHeight = 0
  @property({ type: Boolean, attribute: false }) showIconAfter = false
  @property({ type: Boolean, attribute: false }) mobileView = false
  @property({ type: Boolean, attribute: false }) showIconAfterOnHover = false
  @property({ type: Boolean, attribute: false }) selected = false
  @property({ type: Boolean, attribute: false }) disabled = false

  firstUpdated() {
    subscribe(this, fromEvent(this, 'click').pipe(tap((event) => this.onClickToken(event))), {
      requestUpdate: false,
    })
  }

  protected render() {
    appendClass(this, {
      'show-after-icon': this.showIconAfter,
      'icon-after_on-hover': this.showIconAfter && this.showIconAfterOnHover,
      mobile: this.mobileView,
      selected: this.selected,
      disabled: this.disabled,
    })
    this.style.setProperty('--additional-height', `${this.additionalHeight}px`)
    const iconAfterStyle = this.iconAfterStyle ?? {}
    const chainIds = this.chainIds ?? [this.tokenChainId]
    const animationDelayMillisecond = (this.index + 10) * 100
    return html`
      <div class="grid">
        ${this.renderTokenIcon()} ${this.renderTokenName()} ${this.renderTokenNetworkText()}
        <inch-token-balance
          class="token-balance primary-text token-balance-view"
          endTextAlign
          .symbol="${this.symbol}"
          .chainIds="${chainIds}"
          .walletAddress="${this.walletAddress}"
          .skeletonAnimationDelayMillisecond="${animationDelayMillisecond}"
        ></inch-token-balance>
        <inch-token-fiat-balance
          class="token-fiat-balance secondary-text token-balance-view"
          endTextAlign
          .symbol="${this.symbol}"
          .chainIds="${chainIds}"
          .walletAddress="${this.walletAddress}"
          .skeletonAnimationDelayMillisecond="${animationDelayMillisecond}"
        ></inch-token-fiat-balance>
        ${when(
          this.showIconAfter,
          () => html`
            <div class="icon-after" @click="${(event: Event) => this.onClickIconAfter(event)}">
              <inch-icon
                style="${styleMap(iconAfterStyle)}"
                icon="${this.iconAfterName}"
                .props="${this.iconAfterProps}"
              ></inch-icon>
            </div>
          `
        )}
      </div>
      <slot></slot>
    `
  }

  private renderTokenIcon() {
    if (!this.symbol) {
      return html` <inch-loader-spinner class="token-icon" size="40"></inch-loader-spinner> `
    }
    return html`
      <inch-token-icon
        class="token-icon"
        symbol="${this.symbol}"
        chainId="${this.tokenChainId}"
        address="${this.tokenAddress}"
        size="40"
      ></inch-token-icon>
    `
  }

  private renderTokenName() {
    if (!this.tokenNameText) {
      const animationDelayMillisecond = this.index * 100
      return html` <inch-loader-skeleton
        class="token-name primary-text"
        .animationDelayMillisecond="${animationDelayMillisecond}"
      ></inch-loader-skeleton>`
    }
    return html`
      <inch-marquee class="token-name primary-text">${this.tokenNameText}</inch-marquee>
    `
  }

  private renderTokenNetworkText() {
    if (!this.tokenNetworkText) {
      const animationDelayMillisecond = this.index * 100
      return html`<inch-loader-skeleton
        class="token-networks secondary-text"
        .animationDelayMillisecond="${animationDelayMillisecond}"
      ></inch-loader-skeleton>`
    }
    return html` <div class="token-networks secondary-text">${this.tokenNetworkText}</div>`
  }

  private onClickIconAfter(event: Event) {
    event.stopPropagation()
    event.preventDefault()
    dispatchEvent(this, 'onClickIconAfter', null)
  }

  private onClickToken(event: Event) {
    if (this.disabled) return
    event.stopPropagation()
    event.preventDefault()
    dispatchEvent(this, 'onClickToken', null)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TokenItemBaseElement.tagName]: TokenItemBaseElement
  }
}
