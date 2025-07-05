import { formatSeconds } from '@1inch-community/core/formatters'
import { dispatchEvent, translate } from '@1inch-community/core/lit-utils'
import { SettingsValue } from '@1inch-community/models'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { when } from 'lit/directives/when.js'
import { swapOptionItemStyle } from '../swap-option-item.style'
import { swapOptionItemAuctionStyle } from './swap-option-item-auction.style'

@customElement(SwapOptionItemAuctionElement.tagName)
export class SwapOptionItemAuctionElement extends LitElement {
  static tagName = 'inch-swap-option-item-auction' as const

  static override styles = [swapOptionItemStyle, swapOptionItemAuctionStyle]

  @property({ type: Boolean }) editable = true
  @property({ type: Object, attribute: false }) value?: SettingsValue

  protected override render() {
    return html`
      <span class="title"> ${translate('widgets.swap-form.fusion-info.auction-time')} </span>
      ${when(
        this.value,
        (auctionTime) => html`
          <div
            @click="${() => this.editable && dispatchEvent(this, 'openAuctionTimeSettings', null)}"
            class="content auction-value ${this.editable ? 'editable' : ''}"
          >
            ${auctionTime.value === null
              ? ''
              : html`<span>${formatSeconds(auctionTime.value)} · </span>`}
            <span>
              ${when(auctionTime.type === 'auto', () =>
                translate('widgets.swap-form.fusion-info.config-value-auto')
              )}
              ${when(auctionTime.type === 'custom', () =>
                translate('widgets.swap-form.fusion-info.config-value-custom')
              )}
              ${when(auctionTime.type === 'preset', () =>
                translate('widgets.swap-form.fusion-info.config-value-manual')
              )}
            </span>
          </div>
        `,
        () => html`<div class="content"><div class="loader"></div></div>`
      )}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [SwapOptionItemAuctionElement.tagName]: SwapOptionItemAuctionElement
  }
}
