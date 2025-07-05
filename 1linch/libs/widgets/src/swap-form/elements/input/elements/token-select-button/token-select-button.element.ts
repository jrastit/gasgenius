import { dispatchEvent, translate } from '@1inch-community/core/lit-utils'
import { IToken, TokenType } from '@1inch-community/models'
import { chainViewConfig } from '@1inch-community/sdk/chain'
import '@1inch-community/ui-components/button'
import '@1inch-community/ui-components/text-animate'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../../../../shared-elements/token-icon'
import { tokenSelectButtonStyle } from './token-select-button.style'

@customElement(TokenSelectButtonElement.tagName)
export class TokenSelectButtonElement extends LitElement {
  static tagName = 'inch-token-select-button' as const

  static override styles = tokenSelectButtonStyle

  @property({ type: Object, attribute: false }) token?: IToken
  @property({ type: String, attribute: true }) tokenType?: TokenType

  protected render() {
    if (this.token) {
      return this.renderTokenSelectButton()
    }
    return this.renderEmptyTokenSelectButton()
  }

  private renderTokenSelectButton() {
    let chainName = ''
    if (this.token) {
      const chain = chainViewConfig[this.token.chainId]
      chainName = chain.shortName
    }
    return html`
      <button
        class="select-token-button"
        @click="${() => dispatchEvent(this, 'openTokenSelector', this.tokenType)}"
      >
        <inch-token-icon
          size="32"
          .symbol="${this.token!.symbol}"
          .address="${this.token!.address}"
          .chainId="${this.token!.chainId}"
        ></inch-token-icon>
        <div class="symbol-chain-view">
          <span class="symbol">
            <inch-text-animate .text="${this.token!.symbol}"></inch-text-animate>
            <inch-icon class="icon" icon="chevronDown16"></inch-icon
          ></span>
          <inch-text-animate class="chain" .text="on ${chainName}"></inch-text-animate>
        </div>
      </button>
    `
  }

  private renderEmptyTokenSelectButton() {
    return html`
      <inch-button
        type="secondary"
        size="l"
        @click="${() => dispatchEvent(this, 'openTokenSelector', this.tokenType)}"
      >
        <span class="select-token-text"
          >${translate('widgets.swap-form.swap-button.select-token')}</span
        >
        <inch-icon icon="chevronDown16"></inch-icon>
      </inch-button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TokenSelectButtonElement.tagName]: TokenSelectButtonElement
  }
}
