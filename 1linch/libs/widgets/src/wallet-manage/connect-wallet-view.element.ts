import { CacheActivePromise } from '@1inch-community/core/decorators'
import { lazyAppContextConsumer } from '@1inch-community/core/lazy'
import { getShadowDomElement, observe } from '@1inch-community/core/lit-utils'
import { IWallet, OverlayViewMode } from '@1inch-community/models'
import '@1inch-community/ui-components/button'
import '@1inch-community/ui-components/icon'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { when } from 'lit/directives/when.js'
import { defer, map } from 'rxjs'
import '../shared-elements/address-view'
import '../shared-elements/balance-view'
import { connectWalletViewStyle } from './connect-wallet-view.style'
import './wallet-manager-route.element'

@customElement(ConnectWalletViewElement.tagName)
export class ConnectWalletViewElement extends LitElement {
  static tagName = 'inch-connect-wallet-view' as const

  static override styles = connectWalletViewStyle

  private readonly applicationContext = lazyAppContextConsumer(this)

  @property({ type: Boolean, attribute: true }) mobileView?: boolean

  private overlayId: number | null = null

  private readonly chainId$ = defer(() => this.getWalletController().data.chainId$)
  private readonly activeAddress$ = defer(() => this.getWalletController().data.activeAddress$)
  private readonly info$ = defer(() => this.getWalletController().data.info$)
  private readonly icon$ = this.info$.pipe(map((item) => item.icon))
  private readonly name$ = this.info$.pipe(map((item) => item.name))

  private readonly view$ = defer(() => this.getWalletController().data.isConnected$).pipe(
    map((isConnected) => {
      return isConnected ? this.getConnectedView() : this.getConnectWalletButton()
    })
  )

  protected override render() {
    return html`${observe(this.view$)}`
  }

  /**
   * Component like a ConnectButton
   * @private
   */
  private getConnectedView() {
    return html`
      <div
        class="connect-wallet-view-container"
        @click="${() => this.mobileView && this.onManagerRouteView()}"
      >
        <img
          class="connect-wallet-view-icon"
          alt="${observe(this.name$)}"
          src="${observe(this.icon$)}"
        />
        ${when(
          !this.mobileView,
          () => html`
            <inch-wallet-total-fiat-balance
              .address="${observe(this.activeAddress$)}"
            ></inch-wallet-total-fiat-balance>
            <inch-button @click="${() => this.onManagerRouteView()}" type="secondary" size="m">
              <inch-address-view
                hideTooltip
                address="${observe(this.activeAddress$)}"
              ></inch-address-view>
            </inch-button>
          `
        )}
      </div>
    `
  }

  private getConnectWalletButton() {
    return html`
      <inch-button
        @click="${() => this.onManagerRouteView()}"
        type="${this.mobileView ? 'primary-gray' : 'secondary'}"
        size="${this.mobileView ? 'l' : 'xl'}"
      >
        ${when(
          this.mobileView,
          () => html` <inch-icon icon="wallet24"></inch-icon>`,
          () => html`<span>Connect wallet</span>`
        )}
      </inch-button>
    `
  }

  private getWalletController(): IWallet {
    return this.applicationContext.value.wallet
  }

  @CacheActivePromise()
  private async onManagerRouteView() {
    if (this.applicationContext.value.overlay.isOpenOverlay(this.overlayId)) {
      await this.closeCurrentOverlay()
      return
    }
    this.overlayId = await this.applicationContext.value.overlay.open(
      html`
        <inch-wallet-manager-route
          mobileView="${ifDefined(this.mobileView ? '' : undefined)}"
          @closeCard="${() => {
            if (!this.overlayId) {
              return
            }
            this.closeCurrentOverlay()
          }}"
        ></inch-wallet-manager-route>
      `,
      { targetFactory: () => getShadowDomElement('swap-form'), mode: OverlayViewMode.auto }
    )
  }

  private async closeCurrentOverlay() {
    if (this.overlayId) {
      await this.applicationContext.value.overlay.close(this.overlayId)
      this.overlayId = null
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [ConnectWalletViewElement.tagName]: ConnectWalletViewElement
  }
}
