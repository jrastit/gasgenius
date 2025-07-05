import { lazyAppContextConsumer } from '@1inch-community/core/lazy'
import {
  appendStyle,
  async,
  dispatchEvent,
  getMobileMatchMedia,
  subscribe,
  translate,
} from '@1inch-community/core/lit-utils'
import { EIP6963ProviderInfo } from '@1inch-community/models'
import '@1inch-community/ui-components/button'
import '@1inch-community/ui-components/icon'
import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { map as litMap } from 'lit/directives/map.js'
import { when } from 'lit/directives/when.js'
import { combineLatest, tap } from 'rxjs'
import { Address } from 'viem'
import '../../../../shared-elements/balance-view'
import { DisconnectEventModel } from '../../../disconnect/disconnect-event-model'
import { walletViewStyle } from './wallet-view.style'

@customElement(WalletViewElement.tagName)
export class WalletViewElement extends LitElement {
  static tagName = 'inch-wallet-view' as const

  private readonly applicationContext = lazyAppContextConsumer(this)

  private readonly mobileMedia = getMobileMatchMedia()

  static override styles = walletViewStyle

  @property({ type: Object }) info?: EIP6963ProviderInfo

  @state() private showLoader = false

  @state() private showAddresses = false

  private isActiveWallet = false

  private activeAddress: Address | null = null

  private isWalletConnected = false

  private addressList: Address[] | null = null

  protected override willUpdate() {
    const info = this.info

    if (!info) {
      throw new Error('')
    }

    const providerDataAdapter = this.getController().getDataAdapter(info)
    const globalDataAdapter = this.getController().data
    subscribe(
      this,
      [
        providerDataAdapter.isConnected$.pipe(tap((state) => (this.isWalletConnected = state))),
        combineLatest([globalDataAdapter.activeAddress$, providerDataAdapter.activeAddress$]).pipe(
          tap(([globalActiveAddress, walletActiveAddress]) => {
            if (globalActiveAddress === walletActiveAddress) {
              this.activeAddress = walletActiveAddress
            }
          })
        ),
        providerDataAdapter.addresses$.pipe(
          tap((state) => (this.addressList = !state.length ? null : state))
        ),
        globalDataAdapter.isActiveWallet$(info).pipe(tap((state) => (this.isActiveWallet = state))),
      ],
      { requestUpdate: true }
    )
  }

  protected override render() {
    if (!this.info) {
      throw new Error('')
    }

    return this.isWalletConnected
      ? this.getAlreadyConnectedWalletView(this.info)
      : this.getConnectWalletView(this.info)
  }

  private getConnectWalletView(info: EIP6963ProviderInfo) {
    const isMultiWallet = info.uuid === 'walletConnect' || (this.addressList?.length ?? 0) > 1

    return html`
      <div class="wallet-view-container" @click="${() => this.onClick(isMultiWallet)}">
        <div class="data-container left-data">
          <img class="wallet-icon" alt="${info.name}" src="${info.icon}" />
          <span class="wallet-name">${info.name}</span>
        </div>
        ${when(
          this.isActiveWallet,
          () => html`
            <div class="data-container right-data">
              <div class="wallet-view-recent">Recent</div>
            </div>
          `
        )}
      </div>
    `
  }

  private getAlreadyConnectedWalletView(info: EIP6963ProviderInfo) {
    const activeAddress = this.activeAddress ?? (this.addressList ?? [])[0]
    const isWalletConnect = info.uuid === 'walletConnect'
    const isMultiWallet = (this.addressList?.length ?? 0) > 1
    const subtitle = isMultiWallet
      ? html`${this.addressList?.length} ${translate('widgets.wallet-view.wallet-subtitle')}`
      : html`
          <inch-wallet-total-fiat-balance
            class="wallet-sub-title"
            .address="${activeAddress}"
          ></inch-wallet-total-fiat-balance>
        `

    const addressListLength = this.addressList?.length ?? 0
    const height = (this.showAddresses && addressListLength >= 1 ? addressListLength * 56 : 0) + 56

    appendStyle(this, {
      height: `${height}px`,
    })

    return html`
      <div class="wallet-view-container" @click="${() => this.onClick(isMultiWallet)}">
        <div class="data-container left-data">
          <img class="wallet-icon" alt="${info.name}" src="${info.icon}" />
          <div class="wallet-info-container">
            <span class="wallet-title"
              >${when(
                !isMultiWallet && activeAddress,
                () => html`<inch-address-view address="${activeAddress}"></inch-address-view>`,
                () => html`${info.name}`
              )}</span
            >
            <span class="wallet-sub-title">${subtitle}</span>
          </div>
        </div>
        <div class="data-container right-data">
          <inch-button
            class="disconnect-address-btn"
            @click="${(event: MouseEvent) => {
              event.stopPropagation()
              this.onDisconnectClick(info)
            }}"
            type="tertiary"
            size="l"
          >
            <inch-icon
              width="24"
              height="24"
              class="disconnect-address-icon"
              icon="logout16"
            ></inch-icon>
          </inch-button>

          ${this.getConnectButtonView(this.isWalletConnected, isWalletConnect)}
        </div>
      </div>
      ${when(this.showAddresses, () => this.getAddressesSubList(info, isWalletConnect))}
    `
  }

  private getConnectButtonView(isConnected: boolean, isWalletConnect: boolean) {
    if (!isConnected) {
      return html``
    }

    return html`
      ${when(
        this.showLoader,
        () => html` <inch-icon class="loader-icon" icon="fire48"></inch-icon>`,
        () => html`
          ${when(
            this.activeAddress === null && this.isActiveWallet,
            () => html` <inch-icon icon="lock16"></inch-icon> `
          )}
          ${when(
            isWalletConnect && this.activeAddress,
            () => html`
              <inch-button
                @click="${(event: MouseEvent) => this.onConnect(event)}"
                class="add-connection"
                size="l"
                type="tertiary"
              >
                <inch-icon width="24" height="24" icon="plusCircle16"></inch-icon>
              </inch-button>
            `
          )}
        `
      )}
    `
  }

  private getAddressesSubList(info: EIP6963ProviderInfo, isWalletConnect: boolean) {
    return html`
      ${when(
        this.addressList,
        () => html`
          <div class="address-list">
            ${litMap(this.addressList!, (address) => {
              return html`
                <div
                  @click="${() => this.setActiveAddress(address)}"
                  class="wallet-view-container address-container ${async(
                    this.isActiveAddress(address).then((state) =>
                      state ? 'address-container__active' : ''
                    )
                  )}"
                >
                  <div class="data-container left-data">
                    <inch-icon class="sub-wallet-icon" icon="arrowTopToRightRounded32"></inch-icon>
                    <div class="wallet-info-container">
                      <span class="wallet-title">
                        <inch-address-view address="${address}"></inch-address-view>
                      </span>
                      <span>
                        <inch-wallet-total-fiat-balance
                          class="wallet-sub-title"
                          .address="${address}"
                        ></inch-wallet-total-fiat-balance>
                      </span>
                    </div>
                  </div>
                  <div class="data-container right-data">
                    ${when(
                      this.activeAddress === address,
                      () => html`
                        <div class="check-icon-container">
                          <inch-icon class="active-address-check-icon" icon="check24"></inch-icon>
                        </div>
                      `
                    )}
                    ${when(
                      isWalletConnect,
                      () => html`
                        <inch-button
                          class="disconnect-address-btn"
                          @click="${(event: MouseEvent) => {
                            event.stopPropagation()
                            this.onDisconnectClick(info, address)
                          }}"
                          type="tertiary"
                          size="l"
                        >
                          <inch-icon
                            class="disconnect-address-icon"
                            width="24"
                            height="24"
                            icon="logout16"
                          ></inch-icon>
                        </inch-button>
                      `,
                      () => html`<span class="disconnect-address-btn-stub"></span>`
                    )}
                  </div>
                </div>
              `
            })}
          </div>
        `
      )}
    `
  }

  private onDisconnectClick(info: EIP6963ProviderInfo | null, address?: Address | null) {
    dispatchEvent(this, DisconnectEventModel.EVENT_TYPE, new DisconnectEventModel(info, address))
  }

  private async onClick(isMultiWallet: boolean) {
    if (this.isWalletConnected && this.addressList?.length) {
      if (!isMultiWallet) {
        await this.setActiveAddress(this.addressList[0])
      } else {
        this.showAddresses = !this.showAddresses
      }

      return
    }
    await this.onConnect()
  }

  private async onConnect(event?: MouseEvent) {
    if (!this.info || this.showLoader) {
      return
    }
    event?.preventDefault()
    event?.stopPropagation()
    const supportConnectionLink =
      await this.applicationContext.value.wallet.isSupportConnectionUriLink(this.info)

    if (supportConnectionLink && !this.mobileMedia.matches) {
      dispatchEvent(this, 'onUseConnectionLink', this.info)
      return
    }

    this.showLoader = true
    const isWalletConnect = this.info.uuid === 'walletConnect'

    if (this.isWalletConnected && isWalletConnect) {
      this.showAddresses = await this.getController().addConnection(this.info)
    } else {
      this.showAddresses = await this.getController().connect(this.info)
    }
    this.showLoader = false
  }

  private async setActiveAddress(address: Address) {
    if (!this.info) {
      return
    }
    await this.getController().setActiveAddress(this.info, address)
  }

  private getController() {
    return this.applicationContext.value.wallet
  }

  private isActiveAddress(address: Address): Promise<boolean> {
    if (!this.info) {
      throw new Error('')
    }
    return this.getController().data.isActiveAddress(this.info, address)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [WalletViewElement.tagName]: WalletViewElement
  }
}
