import { throttle } from '@1inch-community/core/decorators'
import { lazyAppContextConsumer } from '@1inch-community/core/lazy'
import { appendClass, subscribe, translate } from '@1inch-community/core/lit-utils'
import { EIP6963ProviderInfo } from '@1inch-community/models'
import '@1inch-community/ui-components/button'
import '@1inch-community/ui-components/chip'
import '@1inch-community/ui-components/icon'
import { html, LitElement, svg, TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { when } from 'lit/directives/when.js'
import { from, of, switchMap, tap } from 'rxjs'
import { QRCodeGenerator } from './utils'
import { walletQrcodeViewStyle } from './wallet-qrcode-view.style'

@customElement(WalletDisconnectViewElement.tagName)
export class WalletDisconnectViewElement extends LitElement {
  static tagName = 'inch-wallet-qrcode-view' as const

  static override styles = walletQrcodeViewStyle

  private static readonly QRCODE_SIZE = 280
  private static readonly LOGO_SIZE = WalletDisconnectViewElement.QRCODE_SIZE / 4

  private readonly applicationContext = lazyAppContextConsumer(this)

  @property({ type: Object }) data?: EIP6963ProviderInfo

  @state() private waitConnection: boolean = false
  @state() private connectUriLink: string | null = null
  @state() private qrcode: TemplateResult[] | null = null

  protected firstUpdated() {
    subscribe(
      this,
      this.applicationContext.value.wallet.connectionUriLink().pipe(
        switchMap((uri) => {
          this.waitConnection = false
          this.connectUriLink = uri

          if (uri) {
            return from(
              QRCodeGenerator.render(
                uri,
                WalletDisconnectViewElement.QRCODE_SIZE,
                WalletDisconnectViewElement.LOGO_SIZE
              )
            )
          }
          return of(null)
        }),
        tap((img) => (this.qrcode = img))
      ),
      { requestUpdate: false }
    )

    this.connectWallet()
  }

  private async connectWallet(showAlternativeConnection: boolean = false) {
    try {
      if (this.data) {
        const wallet = this.applicationContext.value.wallet
        const adapter = wallet.getDataAdapter(this.data)
        const isConnected = await adapter.isConnected()
        const method = (isConnected ? wallet.addConnection : wallet.connect).bind(wallet)

        method(this.data, { showQrModal: showAlternativeConnection }).catch((e) => console.warn(e))
      }
    } catch {
      // ignore
    }
  }

  private qrcodeView(qrcode: TemplateResult[]) {
    const size = WalletDisconnectViewElement.QRCODE_SIZE
    const logoSize = WalletDisconnectViewElement.LOGO_SIZE

    return html`
      <div class="qrcode-code-svg-container" style="width:${size}px; height:${size}px;">
        ${when(
          this.data,
          (data) => html`
            <img
              class="connector-icon"
              width="${logoSize}"
              height="${logoSize}"
              alt="${data.name}"
              src="${data.icon}"
            />
          `
        )}
        ${svg`
             <svg height="100%" width="100%">
              ${qrcode}
            </svg>
          `}
      </div>
    `
  }

  @throttle(2000)
  private async onAlternativeConnectClick() {
    this.waitConnection = true
    await this.connectWallet(/* showAlternativeConnection */ true)
  }

  @throttle(500)
  private onCopyOnClipboard() {
    if (this.connectUriLink) {
      navigator.clipboard.writeText(this.connectUriLink).catch((e) => console.warn(e))
    }
  }

  protected override render() {
    appendClass(this, {
      loader: this.qrcode === null,
    })
    return html`
      <div class="qrcode-container">
        <div class="qrcode-title">
          <inch-icon icon="scan16"></inch-icon>
          ${translate('widgets.wallet-qrcode.title')}
        </div>
        <div class="qrcode-code-container">
          <div class="qrcode-code">
            ${when(
              this.qrcode,
              (img) => html`${this.qrcodeView(img)}`,
              () => html` <div class="loader"></div>`
            )}
          </div>
          <div class="qrcode-copy-container">
            <inch-button
              disabled="${ifDefined(this.connectUriLink ? undefined : true)}"
              class="button__size"
              @click="${() => this.onCopyOnClipboard()}"
              type="tertiary"
              size="l"
              fullsize
            >
              <span class="color__secondary">
                <inch-icon width="16" height="16" icon="copy16"></inch-icon>
              </span>
              <span class="color__secondary"
                >${translate('widgets.wallet-qrcode.button.copy')}</span
              >
            </inch-button>
          </div>
        </div>
        <div class="qrcode-action-container">
          ${when(
            this.data,
            () => html`
              <inch-button
                disabled="${ifDefined(this.waitConnection || undefined)}"
                @click="${() => this.onAlternativeConnectClick()}"
                type="tertiary"
                class="button__size"
                size="l"
                fullsize
              >
                ${when(
                  this.waitConnection,
                  () => html`
                    <inch-icon class="loader-icon" width="16" height="16" icon="fire48"></inch-icon>
                  `,
                  () => translate('widgets.wallet-qrcode.button.alternative-connection')
                )}
              </inch-button>
            `
          )}
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
