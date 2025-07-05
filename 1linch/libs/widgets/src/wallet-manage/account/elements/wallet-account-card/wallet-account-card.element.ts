import { throttle } from '@1inch-community/core/decorators'
import { lazyAppContextConsumer, lazyConsumer } from '@1inch-community/core/lazy'
import { dispatchEvent, observe, subscribe, translate } from '@1inch-community/core/lit-utils'
import { getRandomBrightColor } from '@1inch-community/core/theme'
import { ChainId, EIP6963ProviderInfo, OverlayViewMode } from '@1inch-community/models'
import '@1inch-community/ui-components/button'
import '@1inch-community/ui-components/icon'
import { scrollContext } from '@1inch-community/ui-components/scroll'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { when } from 'lit/directives/when.js'
import { combineLatest, defer, filter, tap } from 'rxjs'
import { Address } from 'viem'
import '../../../../shared-elements/balance-view'
import { DisconnectEventModel } from '../../../disconnect/disconnect-event-model'
import { walletAccountContext } from '../../context'
import '../../i18n'
import '../wallet-account-card-account-more'
import { MenuItem } from '../wallet-account-card-account-more'
import { walletAccountCardStyle } from './wallet-account-card.style'

enum MenuItemIds {
  CopyAddress,
  ExternalView,
  Switch,
  Disconnect,
}

@customElement(WalletAccountCardElement.tagName)
export class WalletAccountCardElement extends LitElement {
  static readonly tagName = 'inch-wallet-account-card' as const

  static override styles = [walletAccountCardStyle]

  private readonly applicationContext = lazyAppContextConsumer(this)

  private readonly context = lazyConsumer(this, { context: walletAccountContext })

  @state()
  private walletAddress?: Address

  @state()
  private walletInfo?: EIP6963ProviderInfo

  @state()
  private chainId?: ChainId

  @state()
  private isCollapsed = false

  private overlayId: number | null = null

  private readonly menuItems: MenuItem[] = [
    {
      text: 'widgets.wallet-account-view.card.more.copy',
      style: 'standard',
      icon: 'copy16',
      id: MenuItemIds.CopyAddress,
    },
    {
      text: 'widgets.wallet-account-view.card.more.view',
      style: 'standard',
      icon: 'externalLink16',
      id: MenuItemIds.ExternalView,
    },
    {
      text: 'widgets.wallet-account-view.card.more.switch',
      style: 'standard',
      icon: 'swap24',
      id: MenuItemIds.Switch,
    },
    {
      text: 'widgets.wallet-account-view.card.more.disconnect',
      style: 'dangerous',
      icon: 'logout16',
      id: MenuItemIds.Disconnect,
    },
  ]

  private readonly scrollConsumer = lazyConsumer(this, { context: scrollContext })

  private readonly chainListView$ = defer(() => this.context.value.chainFilter$)

  protected override firstUpdated() {
    if (!this.context) {
      throw new Error('setup context before')
    }
    const collapseThreshold = 25
    const collapsedPosition = 200 // Card height

    let scrollDirection: 'up' | 'down' | undefined

    subscribe(
      this,
      this.scrollConsumer.value.scrollTopFromConsumer$.pipe(
        tap((value) => {
          const cur = Math.floor(value / collapseThreshold) * collapseThreshold
          let changeDir: 'up' | 'down' | undefined

          if (cur >= collapsedPosition) {
            changeDir = 'down'
          } else if (cur === 0) {
            changeDir = 'up'
          } else {
            changeDir = undefined
          }

          if (scrollDirection != changeDir) {
            scrollDirection = changeDir
          }

          if (!scrollDirection) {
            return
          }

          if (scrollDirection === 'down' && value >= collapseThreshold && !this.isCollapsed) {
            this.isCollapsed = true
            this.closeMenuMore()
          } else if (scrollDirection === 'up' && value <= collapseThreshold && this.isCollapsed) {
            this.isCollapsed = false
          }
        })
      )
    )

    subscribe(
      this,
      [
        combineLatest([
          this.context.value.connectedWalletAddress$,
          this.context.value.connectedWalletInfo$,
          this.context.value.chainId$,
        ]).pipe(
          filter(
            ([address, info, chainId]) => address !== null && info !== null && chainId !== null
          ),
          tap(([address, info, chainId]) => {
            this.walletAddress = address!
            this.walletInfo = info!
            this.chainId = chainId!
          })
        ),
      ],
      { requestUpdate: false }
    )
  }

  private onChangeWalletClick() {
    dispatchEvent(this, 'changeWalletClick', undefined)
  }

  @throttle(500)
  private onMenuItemClick(id: number) {
    if (!this.context || !this.walletAddress || !this.chainId || !this.walletInfo) {
      return
    }

    if (this.overlayId) {
      this.applicationContext.value.overlay.close(this.overlayId).catch((e) => console.warn(e))
    }

    switch (id) {
      case MenuItemIds.CopyAddress:
        this.context.value.copyAddress(this.walletAddress)
        break
      case MenuItemIds.ExternalView:
        this.context.value.openExplorer(this.chainId, this.walletAddress)
        break
      case MenuItemIds.Switch:
        this.onChangeWalletClick()
        break
      case MenuItemIds.Disconnect:
        dispatchEvent(
          this,
          DisconnectEventModel.EVENT_TYPE,
          new DisconnectEventModel(this.walletInfo, this.walletAddress)
        )
        break
    }
  }

  @throttle(300)
  private async onMoreClick(target: HTMLElement) {
    if (this.applicationContext.value.overlay.isOpenOverlay(this.overlayId)) {
      await this.closeMenuMore()
      return
    }

    this.overlayId = await this.applicationContext.value.overlay.open(
      html`
        <inch-wallet-account-card-more
          .items="${this.menuItems}"
          @menuMoreItemClick="${(e: CustomEvent) => this.onMenuItemClick(e.detail.value)}"
        ></inch-wallet-account-card-more>
      `,
      {
        mode: OverlayViewMode.popupAuto,
        targetFactory: () => target,
      }
    )
  }

  private async closeMenuMore() {
    if (this.overlayId) {
      await this.applicationContext.value.overlay.close(this.overlayId)
      this.overlayId = null
    }
  }

  private generateColorByAddress(address: string): string {
    return getRandomBrightColor(() => Number(address) / 10 ** 48)
  }

  protected override render() {
    const address = this.walletAddress
    const icon = this.walletInfo?.icon
    const name = this.walletInfo?.name
    const hasData = address && icon && name

    const color = address && this.generateColorByAddress(address)
    const backgroundStyle = color
      ? `--card-background: ${color}`
      : `--card-background: var(--primary-hover)`

    return html`
      <div class="card ${this.isCollapsed ? 'collapsed' : ''}" style="${backgroundStyle}">
        <inch-icon
          class="background-unicorn ${this.isCollapsed ? 'collapsed' : ''}"
          icon="unicornBackground"
        ></inch-icon>

        <div class="card-wallet-info-container">
          <div class="card-wallet-container ${this.isCollapsed ? 'fade-out' : ''}">
            <div
              class="card-wallet ${hasData ? '' : 'loader'} ${this.isCollapsed ? 'fade-out' : ''}"
            >
              ${when(
                hasData,
                () => html`
                  <div class="card-wallet-icon">
                    <img class="wallet-icon" alt="${name}" src="${icon}" />
                  </div>
                  <inch-address-view
                    class="card-wallet-address"
                    address="${address}"
                  ></inch-address-view>

                  <inch-button
                    @click="${() => this.onChangeWalletClick()}"
                    type="tertiary"
                    size="xs"
                  >
                    <inch-icon class="card-item__color" icon="swap24"></inch-icon>
                  </inch-button>
                `
              )}
            </div>
          </div>

          <div class="card-wallet-full-balance ${this.isCollapsed ? 'collapsed' : ''}">
            <inch-wallet-total-fiat-balance
              class="card-wallet-balance"
              .chainIds="${observe(this.chainListView$)}"
              .address="${this.walletAddress}"
            ></inch-wallet-total-fiat-balance>
          </div>

          <inch-button
            class="card-menu-more"
            @click="${(e: MouseEvent) => this.onMoreClick(e.target as HTMLElement)}"
            type="tertiary"
            size="xs"
          >
            <inch-icon class="card-item__color" icon="more24"></inch-icon>
          </inch-button>
        </div>
        <div class="card-actions ${this.isCollapsed ? 'fade-out' : ''}">
          <inch-button @click="${() => {}}" type="tertiary" fullSize="${true}" size="l">
            <inch-icon class="btn-send-icon-arrow" icon="arrowLeft24"></inch-icon>
            <span class="card-item__color">
              ${translate(`widgets.wallet-account-view.card.send`)}
            </span>
          </inch-button>

          <inch-button @click="${() => {}}" type="tertiary" fullSize="${true}" size="l">
            <inch-icon class="btn-receive-icon-arrow" icon="arrowLeft24"></inch-icon>
            <span class="card-item__color">
              ${translate(`widgets.wallet-account-view.card.receive`)}
            </span>
          </inch-button>
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [WalletAccountCardElement.tagName]: WalletAccountCardElement
  }
}
