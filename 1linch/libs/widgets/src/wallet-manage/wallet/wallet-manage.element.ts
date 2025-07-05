import { lazyAppContextConsumer } from '@1inch-community/core/lazy'
import { dispatchEvent, subscribe, translate } from '@1inch-community/core/lit-utils'
import '@1inch-community/ui-components/button'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { when } from 'lit/directives/when.js'
import { distinctUntilChanged, tap } from 'rxjs'
import { DisconnectEventModel } from '../disconnect/disconnect-event-model'
import './elements/wallet-list'
import { walletManageStyle } from './wallet-manage.style'

@customElement(WalletManageElement.tagName)
export class WalletManageElement extends LitElement {
  static tagName = 'inch-wallet-manage' as const

  static override styles = walletManageStyle

  private readonly applicationContext = lazyAppContextConsumer(this)

  @state() connected?: boolean

  private onDisconnectClick() {
    dispatchEvent(this, DisconnectEventModel.EVENT_TYPE, new DisconnectEventModel())
  }

  protected firstUpdated() {
    subscribe(
      this,
      this.applicationContext.value.wallet.data.isConnected$.pipe(
        distinctUntilChanged(),
        tap((connected) => (this.connected = connected))
      )
    )
  }

  protected override render() {
    return html`
      <div class="wallet-manager-container">
        <div class="wallet-manager-container-list">
          <inch-wallet-list></inch-wallet-list>
        </div>
        ${when(
          this.connected,
          () => html`
            <div class="wallet-manager-actions">
              <inch-button
                class="bnt-action__resize"
                @click="${() => this.onDisconnectClick()}"
                type="primary-critical"
                size="xl"
                fullsize
              >
                ${translate('widgets.wallet-manager.button.disconnect')}
              </inch-button>
            </div>
          `
        )}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [WalletManageElement.tagName]: WalletManageElement
  }
}
