import { dispatchEvent, translate } from '@1inch-community/core/lit-utils'
import { SettingsValue } from '@1inch-community/models'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { when } from 'lit/directives/when.js'
import { swapOptionItemStyle } from '../swap-option-item.style'
import { swapOptionItemSlippageStyle } from './swap-option-item-slippage.style'

@customElement(SwapOptionItemSlippageElement.tagName)
export class SwapOptionItemSlippageElement extends LitElement {
  static tagName = 'inch-swap-option-item-slippage' as const

  static override styles = [swapOptionItemStyle, swapOptionItemSlippageStyle]

  @property({ type: Boolean }) editable = true
  @property({ type: Object, attribute: false }) value?: SettingsValue

  protected override render() {
    return html`
      <span class="title">${translate('widgets.swap-form.fusion-info.slippage-tolerance')}</span>
      ${when(
        this.value,
        (slippage) => html`
          <div
            @click="${() => this.editable && dispatchEvent(this, 'openSlippageSettings', null)}"
            class="content slippage-value ${this.editable ? 'editable' : ''}"
          >
            ${slippage.value === null ? '' : html`<span>${slippage.value}% · </span>`}
            <span>
              ${when(slippage.type === 'auto', () =>
                translate('widgets.swap-form.fusion-info.config-value-auto')
              )}
              ${when(slippage.type === 'custom', () =>
                translate('widgets.swap-form.fusion-info.config-value-custom')
              )}
              ${when(slippage.type === 'preset', () =>
                translate('widgets.swap-form.fusion-info.config-value-manual')
              )}
            </span>
          </div>
        `,
        () => html` <div class="content"><div class="loader"></div></div>`
      )}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [SwapOptionItemSlippageElement.tagName]: SwapOptionItemSlippageElement
  }
}
