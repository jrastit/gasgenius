import { lazyAppContextConsumer } from '@1inch-community/core/lazy'
import { changeMobileMatchMedia, getMobileMatchMedia } from '@1inch-community/core/lit-utils'
import '@1inch-community/widgets/notifications'
import '@1inch-community/widgets/wallet-manage'
import '@1inch-community/ui-components/icon'
import '@1inch-community/ui-components/card'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'
import { getFooterHeight } from '../../platform/sizes'
import { footerStyle } from './footer.style'

import('../settings')

@customElement(FooterElement.tagName)
export class FooterElement extends LitElement {
  static tagName = 'inch-footer' as const

  static styles = footerStyle

  private readonly applicationContext = lazyAppContextConsumer(this)

  private mobileMedia = getMobileMatchMedia()

  connectedCallback() {
    super.connectedCallback()
    changeMobileMatchMedia(this)
  }

  protected render() {
    if (this.mobileMedia.matches) {
      return this.getMobileFooter()
    }

    return this.getDesktopFooter()
  }

  private getDesktopFooter() {
    const styles = {
      height: `${getFooterHeight()}px`,
    }
    return html`
      <div class="footer-container" style="${styleMap(styles)}">
        <a class="link" target="_blank" href="https://github.com/1inch-community/interface">
          <inch-icon icon="github24"></inch-icon>
          GitHub
        </a>
        <span class="version"
          >version: ${this.applicationContext.value.environment.get('appVersion')}</span
        >
      </div>
    `
  }

  private getMobileFooter() {
    return html`
      <div class="footer-container mobile-footer">
        <inch-connect-wallet-view mobileView></inch-connect-wallet-view>

        <inch-notifications-open-button></inch-notifications-open-button>

        <inch-button @click="${() => this.onOpenSettings()}" type="primary-gray" size="l">
          <inch-icon icon="settings24"></inch-icon>
        </inch-button>
      </div>
    `
  }

  private async onOpenSettings() {
    const id = await this.applicationContext.value.overlay.open(html`
      <inch-card overlayView>
        <inch-settings
          @closeSettings="${() => this.applicationContext.value.overlay.close(id)}"
        ></inch-settings>
      </inch-card>
    `)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'inch-footer': FooterElement
  }
}
