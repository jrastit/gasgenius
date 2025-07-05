import { translate } from '@1inch-community/core/lit-utils'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { when } from 'lit/directives/when.js'
import { swapOptionItemStyle } from '../swap-option-item.style'
import { swapOptionItemMinReceiveStyle } from './swap-option-item-min-receive.style'

export interface MinReceiveData {
  amountFiatFormated: string
  minAmountValue: string
  symbol: string
}

@customElement(SwapOptionItemMinReceiveElement.tagName)
export class SwapOptionItemMinReceiveElement extends LitElement {
  static tagName = 'inch-swap-option-item-min-receive' as const

  static override styles = [swapOptionItemStyle, swapOptionItemMinReceiveStyle]

  @property({ type: Boolean }) editable = true
  @property({ type: Object, attribute: false }) value?: MinReceiveData

  protected override render() {
    return html`
      <span class="title">${translate('widgets.swap-form.fusion-info.min-receive')}</span>
      <div class="content">
        ${when(
          this.value,
          (value) => html`
            <span>~$${value.amountFiatFormated}</span>
            <span class="eth-value">${value?.minAmountValue} ${value.symbol}</span>
          `,
          () => html`<div class="content"><div class="loader"></div></div>`
        )}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [SwapOptionItemMinReceiveElement.tagName]: SwapOptionItemMinReceiveElement
  }
}
