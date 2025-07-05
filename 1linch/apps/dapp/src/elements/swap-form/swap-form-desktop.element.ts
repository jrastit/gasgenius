import {
  AccentColors,
  ISwapContext,
  OverlayViewMode,
  SwapSnapshot,
  TokenType,
} from '@1inch-community/models'
import { SwapContextToken } from '@1inch-community/sdk/swap'
import { SceneController } from '@1inch-community/ui-components/scene'
import { consume } from '@lit/context'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { when } from 'lit/directives/when.js'
import { swapFormStyle } from './swap-form.style'

import { lazyAppContextConsumer } from '@1inch-community/core/lazy'
import {
  registerShadowDomElement,
  subscribe,
  unregisterShadowDomElement,
} from '@1inch-community/core/lit-utils'
import { getThemeChange } from '@1inch-community/core/theme'
import '@1inch-community/ui-components/button'
import '@1inch-community/ui-components/card'
import '@1inch-community/widgets/swap-form'
import { distinctUntilChanged, map, tap } from 'rxjs'

import('@1inch-community/widgets/wallet-manage')
import('@1inch-community/widgets/select-token')
import('@1inch-community/ui-components/icon')
import('../settings')

@customElement(SwapFormDesktopElement.tagName)
export class SwapFormDesktopElement extends LitElement {
  static readonly tagName = 'inch-swap-form-desktop' as const

  static styles = [swapFormStyle, SceneController.styles()]

  @consume({ context: SwapContextToken })
  swapContext!: ISwapContext

  private readonly applicationContext = lazyAppContextConsumer(this)

  @state()
  private accessor isRainbowTheme = false

  private targetSelectToken: TokenType | null = null

  private swapSnapshot: SwapSnapshot | null = null

  private connectWalletViewId: number | null = null

  private readonly desktopScene = new SceneController('swapForm', {
    swapForm: { minWidth: 556, maxWidth: 556, maxHeight: 625, lazyRender: true },
    selectToken: { minWidth: 556, maxWidth: 556, maxHeight: 600 },
    confirmSwap: { minWidth: 556, maxWidth: 556, maxHeight: 680 },
    settings: { minWidth: 556, maxWidth: 556, maxHeight: 900, lazyRender: true },
  })

  connectedCallback() {
    super.connectedCallback()
    registerShadowDomElement('swap-form', this)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    unregisterShadowDomElement('swap-form')
  }

  protected firstUpdated() {
    subscribe(
      this,
      [
        getThemeChange().pipe(
          map(({ brandColor }) => brandColor),
          distinctUntilChanged(),
          tap((color) => (this.isRainbowTheme = color === AccentColors.rainbow))
        ),
      ],
      { requestUpdate: false }
    )
  }

  protected render() {
    const classes = {
      'shadow-container': true,
      'shadow-container-rainbow': this.isRainbowTheme,
    }
    return html`
      <div class="${classMap(classes)}">
        <inch-card>
          ${this.desktopScene.render({
            swapForm: () => html`
              <inch-swap-form
                @confirmSwap="${(event: CustomEvent) => this.onOpenConfirmSwap(event)}"
                @openTokenSelector="${(event: CustomEvent) => this.onOpenSelectToken(event)}"
                @connectWallet="${() => this.onOpenConnectWalletView()}"
              >
                <div slot="header">
                  <inch-button
                    @click="${() => this.desktopScene.nextTo('settings')}"
                    type="tertiary-gray"
                    size="l"
                  >
                    <inch-icon icon="settings24"></inch-icon>
                  </inch-button>
                </div>
              </inch-swap-form>
            `,
            selectToken: () => html`
              <inch-select-token
                tokenType="${this.targetSelectToken!}"
                @backCard="${() => this.desktopScene.back()}"
              ></inch-select-token>
            `,
            confirmSwap: () =>
              when(
                this.swapSnapshot,
                (swapSnapshot) => html`
                  <inch-confirm-swap
                    .swapSnapshot="${swapSnapshot as any}"
                    @backCard="${async () => {
                      await this.desktopScene.back()
                      this.swapSnapshot = null
                    }}"
                  ></inch-confirm-swap>
                `
              ),
            settings: () => html`
              <inch-settings @closeSettings="${() => this.desktopScene.back()}"></inch-settings>
            `,
          })}
        </inch-card>
      </div>
    `
  }

  private async onOpenSelectToken(event: CustomEvent) {
    this.targetSelectToken = event.detail.value
    await this.desktopScene.nextTo('selectToken')
  }

  private async onOpenConfirmSwap(event: CustomEvent) {
    this.swapSnapshot = event.detail.value
    await this.desktopScene.nextTo('confirmSwap')
  }

  private async onOpenConnectWalletView() {
    const close = () => {
      if (!this.connectWalletViewId) return
      this.applicationContext.value.overlay.close(this.connectWalletViewId)
      this.connectWalletViewId = null
    }
    if (
      this.connectWalletViewId &&
      this.applicationContext.value.overlay.isOpenOverlay(this.connectWalletViewId)
    ) {
      close()
      return
    }
    this.connectWalletViewId = await this.applicationContext.value.overlay.open(
      html` <inch-wallet-manager-route @closeCard="${close}"></inch-wallet-manager-route> `,
      { targetFactory: () => this, mode: OverlayViewMode.auto }
    )
  }
}
