import { lazyAppContextConsumer, lazyProvider } from '@1inch-community/core/lazy'
import { observe } from '@1inch-community/core/lit-utils'
import '@1inch-community/ui-components/button'
import '@1inch-community/ui-components/card'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { defer } from 'rxjs'
import '../../shared-elements/token-list'
import { walletAccountContext } from './context'
import './elements/wallet-account-header'
import { walletAccountViewStyle } from './wallet-account-view.style'
import { WalletAccountContext } from './wallet-account.context'

@customElement(WalletAccountView.tagName)
export class WalletAccountView extends LitElement {
  static readonly tagName = 'inch-wallet-account-view' as const

  static override styles = walletAccountViewStyle

  @property({ type: Boolean, attribute: true }) mobileView?: boolean

  private readonly applicationContext = lazyAppContextConsumer(this)

  private readonly walletAccountContext = lazyProvider(this, { context: walletAccountContext })

  private readonly chainListView$ = defer(() => this.walletAccountContext.value.chainFilter$)
  private readonly activeAddress$ = defer(
    () => this.walletAccountContext.value.connectedWalletAddress$
  )

  private initContext() {
    if (!this.applicationContext) {
      return
    }

    this.walletAccountContext.set(
      new WalletAccountContext(
        this.applicationContext.value.wallet,
        this.applicationContext.value.tokenStorage,
        this.applicationContext.value.storage
      )
    )
  }

  protected override render() {
    this.initContext()

    return html`
      <inch-token-list
        type="flat"
        showOnlyWithBalance
        .mobileView="${this.mobileView}"
        .chainIds="${observe(this.chainListView$)}"
        .walletAddress="${observe(this.activeAddress$)}"
        .header="${() => html` <inch-wallet-account-header></inch-wallet-account-header>`}"
      ></inch-token-list>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [WalletAccountView.tagName]: WalletAccountView
  }
}
