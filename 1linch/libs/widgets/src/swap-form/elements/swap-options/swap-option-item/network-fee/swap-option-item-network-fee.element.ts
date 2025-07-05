import { translate } from '@1inch-community/core/lit-utils'
import { IBigFloat } from '@1inch-community/models'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { when } from 'lit/directives/when.js'
import { swapOptionItemStyle } from '../swap-option-item.style'
import { swapOptionItemNetworkFeeStyle } from './swap-option-item-network-fee.style'

export interface NetworkFeeData {
  strategyType: string
  fiatValue: string
  valueFormatted: string
  value: IBigFloat | null
  symbol: string
}

const iconsByStrategy = new Map<string, string>([
  ['Fusion', 'fusion16'],
  ['FusionPlus', 'fusion16'],
])

@customElement(SwapOptionItemNetworkFeeElement.tagName)
export class SwapOptionItemNetworkFeeElement extends LitElement {
  static tagName = 'inch-swap-option-item-network-fee' as const

  static override styles = [swapOptionItemStyle, swapOptionItemNetworkFeeStyle]

  @property({ type: Boolean }) editable = true
  @property({ type: Object, attribute: false }) value?: NetworkFeeData

  protected override render() {
    return html`
      <span class="title">${translate('widgets.swap-form.fusion-info.net-fee')}</span>
      <div class="content">
        ${when(
          this.value,
          (fee) => html`
            ${when(
              iconsByStrategy.get(fee?.strategyType),
              (icon) => html` <inch-icon icon="${icon}"></inch-icon>`
            )}
            ${when(
              fee.value === null || fee.value?.isZero(),
              () => translate('widgets.swap-form.fusion-info.net-fee-free'),
              () => html`
                <span>~$${fee?.fiatValue}</span>
                <span class="eth-value">${fee?.valueFormatted} ${fee.symbol}</span>
              `
            )}
          `,
          () => html` <div class="content"><div class="loader"></div></div>`
        )}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [SwapOptionItemNetworkFeeElement.tagName]: SwapOptionItemNetworkFeeElement
  }
}
