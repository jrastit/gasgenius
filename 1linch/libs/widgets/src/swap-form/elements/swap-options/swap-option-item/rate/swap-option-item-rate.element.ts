import { translate } from '@1inch-community/core/lit-utils'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { when } from 'lit/directives/when.js'
import { swapOptionItemStyle } from '../swap-option-item.style'
import { swapOptionItemRateStyle } from './swap-option-item-rate.style'

export interface RateData {
  tokenASymbol: string
  tokenBSymbol: string
  rateFormated: string
  rateFiatFormated: string
}

@customElement(SwapOptionItemRateElement.tagName)
export class SwapOptionItemRateElement extends LitElement {
  static tagName = 'inch-swap-option-item-rate' as const

  static override styles = [swapOptionItemStyle, swapOptionItemRateStyle]

  @property({ type: Boolean }) editable = true
  @property({ type: Object, attribute: false }) value?: RateData

  protected override render() {
    return html`
      <span class="title">${translate('widgets.swap-form.fusion-info.rate')}</span>
      <div class="content">
        ${when(
          this.value,
          (value) => html`
              <span class="rate-view">
                1 ${value.tokenASymbol} = ${value.rateFormated} ${value.tokenBSymbol}</span
              >
              <span class="rateFiatValue">~$${value.rateFiatFormated}</span></span
            `,
          () => html`<div class="content"><div class="loader"></div></div>`
        )}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [SwapOptionItemRateElement.tagName]: SwapOptionItemRateElement
  }
}
