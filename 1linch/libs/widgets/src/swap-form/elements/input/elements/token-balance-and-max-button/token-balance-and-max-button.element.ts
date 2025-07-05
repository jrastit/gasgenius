import { lazyConsumer } from '@1inch-community/core/lazy'
import { translate } from '@1inch-community/core/lit-utils'
import { TokenRecordId, TokenType } from '@1inch-community/models'
import { SwapContextToken } from '@1inch-community/sdk/swap'
import '@1inch-community/ui-components/button'
import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { when } from 'lit/directives/when.js'
import { Address } from 'viem'
import '../../../../../shared-elements/balance-view'
import { tokenBalanceAndMaxButtonStyle } from './token-balance-and-max-button.style'

@customElement(TokenBalanceAndMaxButtonElement.tagName)
export class TokenBalanceAndMaxButtonElement extends LitElement {
  static tagName = 'inch-token-balance-and-max-button' as const

  static override styles = tokenBalanceAndMaxButtonStyle

  @property({ type: String, attribute: false }) tokenType?: TokenType
  @property({ type: String, attribute: false }) tokenId?: TokenRecordId
  @property({ type: String, attribute: false }) walletAddress?: Address
  @property({ type: String, attribute: false }) symbol?: string

  @state() isLoadingMax = false

  private readonly context = lazyConsumer(this, { context: SwapContextToken, subscribe: true })

  protected render() {
    if (!this.tokenId || !this.walletAddress || !this.symbol) {
      return html``
    }
    return html`
      <span>${translate('widgets.swap-form.input.balance.balance')}:</span>
      <inch-token-balance
        .tokenId="${this.tokenId}"
        .symbol="${this.symbol}"
        .walletAddress="${this.walletAddress}"
      ></inch-token-balance>
      ${when(
        this.tokenType === 'source',
        () =>
          html`<inch-button
            size="xs"
            type="secondary"
            .loader="${this.isLoadingMax}"
            @click="${async () => {
              this.isLoadingMax = true
              await this.context.value.setMaxAmount()
              this.isLoadingMax = false
            }}"
            >MAX</inch-button
          >`
      )}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TokenBalanceAndMaxButtonElement.tagName]: TokenBalanceAndMaxButtonElement
  }
}
