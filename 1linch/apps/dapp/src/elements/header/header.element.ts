import { lazyAppContextConsumer } from '@1inch-community/core/lazy'
import { getMobileMatchMediaAndSubscribe, subscribe } from '@1inch-community/core/lit-utils'
import '@1inch-community/ui-components/icon'
import '@1inch-community/widgets/chain-selector'
import '@1inch-community/widgets/notifications'
import '@1inch-community/widgets/wallet-manage'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'
import { when } from 'lit/directives/when.js'
import { getHeaderHeight } from '../../platform/sizes'
import { headerStyle } from './header.style'

@customElement(HeaderElement.tagName)
export class HeaderElement extends LitElement {
  static tagName = 'inch-header' as const

  static override styles = headerStyle

  private readonly applicationContext = lazyAppContextConsumer(this)

  private mobileMedia = getMobileMatchMediaAndSubscribe(this)

  protected firstUpdated() {
    subscribe(this, [this.applicationContext.value.wallet.data.isConnected$])
  }

  protected render() {
    if (this.mobileMedia.matches) {
      return this.getMobileHeader()
    }

    return this.getDesktopHeader()
  }

  private getDesktopHeader() {
    const styles = {
      height: `${getHeaderHeight()}px`,
    }
    return html`
      <div class="header-container" style="${styleMap(styles)}">
        <div class="left-content">
          <inch-icon icon="logoFull"></inch-icon>
        </div>
        ${when(
          this.applicationContext.value.wallet.isConnected,
          () => html`
            <div class="right-content">
              <inch-connect-wallet-view></inch-connect-wallet-view>
              <inch-notifications-open-button></inch-notifications-open-button>
            </div>
          `
        )}
      </div>
    `
  }

  private getMobileHeader() {
    return html`
      <div class="header-container mobile-header">
        <inch-icon icon="logoFull"></inch-icon>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'inch-header': HeaderElement
  }
}
