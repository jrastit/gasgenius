import { formatHex } from '@1inch-community/core/formatters'
import { lazyAppContextConsumer } from '@1inch-community/core/lazy'
import { dispatchEvent, translate } from '@1inch-community/core/lit-utils'
import '@1inch-community/ui-components/button'
import '@1inch-community/ui-components/chip'
import '@1inch-community/ui-components/icon'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { when } from 'lit/directives/when.js'
import { DisconnectEventModel } from './disconnect-event-model'
import { walletDisconnectViewStyle } from './wallet-disconnect-view.style'

@customElement(WalletDisconnectViewElement.tagName)
export class WalletDisconnectViewElement extends LitElement {
  static tagName = 'inch-wallet-disconnect-view' as const

  static override styles = walletDisconnectViewStyle

  @property({ type: Object }) data?: DisconnectEventModel

  private readonly applicationContext = lazyAppContextConsumer(this)

  private getMessageView() {
    if (this.data?.address) {
      return html`${translate('widgets.wallet-disconnect.msg.single-wallet')}`
    }

    if (this.data?.info) {
      return html`${translate('widgets.wallet-disconnect.msg.some-wallet')} ${this.data.info.name}?`
    }

    if (!this.data?.info && !this.data?.address) {
      return html`${translate('widgets.wallet-disconnect.msg.all-wallets')}`
    }
  }

  private onDisconnectClick() {
    const info = this.data?.info
    const address = this.data?.address

    this.applicationContext.value.wallet.disconnect(info, address)
  }

  private onCancelClick() {
    dispatchEvent(this, 'onBackClick', null)
  }

  protected override render() {
    return html`
      <div class="wallet-disconnect-container">
        <div class="wallet-disconnect-content">
          <inch-icon class="wallet-disconnect-content-icon" icon="disconnectImageBig"></inch-icon>
          ${when(
            this.data?.address,
            (address) => html`
              <div class="wallet-disconnect-content-chip">
                <inch-chip value="${formatHex(address)}"></inch-chip>
              </div>
            `
          )}

          <div class="wallet-disconnect-content-msg">${this.getMessageView()}</div>
        </div>

        <div class="wallet-disconnect-actions">
          <inch-button
            class="bnt-action__resize"
            @click="${() => this.onDisconnectClick()}"
            type="primary-critical"
            size="xl"
            fullsize
          >
            ${translate('widgets.wallet-disconnect.button.disconnect')}
          </inch-button>
          <inch-button
            class="bnt-action__resize"
            @click="${() => this.onCancelClick()}"
            type="secondary-gray"
            size="xl"
            fullsize
          >
            ${translate('widgets.wallet-disconnect.button.cancel')}
          </inch-button>
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [WalletDisconnectViewElement.tagName]: WalletDisconnectViewElement
  }
}
