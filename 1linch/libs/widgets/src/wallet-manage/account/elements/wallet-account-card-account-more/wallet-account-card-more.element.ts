import { dispatchEvent, translate } from '@1inch-community/core/lit-utils'
import '@1inch-community/ui-components/card'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { map as LitMap } from 'lit/directives/map.js'
import { walletAccountCardMoreStyle } from './wallet-account-card-more.style'

export interface MenuItem {
  id: number
  text: string
  style: 'standard' | 'dangerous'
  icon: string
}

@customElement(WalletAccountCardMoreElement.tagName)
export class WalletAccountCardMoreElement extends LitElement {
  static readonly tagName = 'inch-wallet-account-card-more' as const

  static override styles = [walletAccountCardMoreStyle]

  @property({ type: Array, attribute: false }) items: MenuItem[] = []

  private onMenuItemClick(id: number) {
    dispatchEvent(this, 'menuMoreItemClick', id)
  }

  protected override render() {
    return html`
      <inch-card overlayView>
        ${LitMap(
          this.items,
          (item) => html`
            <inch-button
              class="popup-item"
              @click="${() => this.onMenuItemClick(item.id)}"
              type="tertiary-gray"
              fullSize="${true}"
              size="l"
            >
              <div class="popup-item-content-container popup-item-content-container__${item.style}">
                <inch-icon class="popup-item-content-icon" icon="${item.icon}"></inch-icon>
                <span>${translate(item.text)}</span>
              </div>
            </inch-button>
          `
        )}
      </inch-card>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'inch-wallet-account-card-more': WalletAccountCardMoreElement
  }
}
