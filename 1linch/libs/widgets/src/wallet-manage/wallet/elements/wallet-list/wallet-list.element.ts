import { lazyAppContextConsumer } from '@1inch-community/core/lazy'
import { subscribe, translate } from '@1inch-community/core/lit-utils'
import { EIP6963ProviderInfo } from '@1inch-community/models'
import '@1inch-community/ui-components/icon'
import '@1inch-community/ui-components/scroll'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { map } from 'lit/directives/map.js'
import { tap } from 'rxjs'
import '../wallet-view'
import { walletListStyle } from './wallet-list.style'

@customElement(WalletListElement.tagName)
export class WalletListElement extends LitElement {
  static tagName = 'inch-wallet-list' as const

  static override styles = walletListStyle

  private readonly applicationContext = lazyAppContextConsumer(this)

  @state() private adapters?: EIP6963ProviderInfo[]

  protected override firstUpdated() {
    subscribe(
      this,
      this.getController().supportedWallets$.pipe(tap((adapters) => (this.adapters = adapters))),
      { requestUpdate: false }
    )
  }

  private getAgreementsView() {
    return html`
      <div class="agreements">
        ${translate('widgets.wallet-list.agreements-main')}
        <span class="agreements-link">${translate('widgets.wallet-list.agreements-terms')}</span>
        ${translate('widgets.wallet-list.agreements-and')}
        <span class="agreements-link">${translate('widgets.wallet-list.agreements-privacy')}</span>
      </div>
    `
  }

  protected override render() {
    return !this.adapters
      ? html` <inch-icon icon="unicornRun"></inch-icon>`
      : html`
          <inch-scroll-view-consumer>
            <div class="container">
              ${map(
                this.adapters,
                (info) => html` <inch-wallet-view .info="${info}"></inch-wallet-view>`
              )}
              ${this.getAgreementsView()}
            </div>
          </inch-scroll-view-consumer>
        `
  }

  private getController() {
    return this.applicationContext.value.wallet
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [WalletListElement.tagName]: WalletListElement
  }
}
