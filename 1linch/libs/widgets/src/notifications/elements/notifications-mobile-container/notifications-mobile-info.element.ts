import { formatHex } from '@1inch-community/core/formatters'
import { lazyAppContextConsumer } from '@1inch-community/core/lazy'
import { observe } from '@1inch-community/core/lit-utils'
import '@1inch-community/ui-components/icon'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { defer, map, Observable } from 'rxjs'
import { notificationsMobileInfoStyle } from './notifications-mobile-info.style'

@customElement(NotificationsMobileInfoElement.tagName)
export class NotificationsMobileInfoElement extends LitElement {
  static readonly tagName = 'inch-notifications-mobile-info' as const

  static override styles = notificationsMobileInfoStyle

  private readonly applicationContext = lazyAppContextConsumer(this)

  private readonly addressView$: Observable<string> = defer(
    () => this.applicationContext.value.wallet.data.activeAddress$
  ).pipe(
    map((address) => {
      if (!address) return ''
      const width = Math.max(Math.round(window.innerWidth / 25), 12)
      const head = Math.round(width / 2)
      const tail = width - head
      return formatHex(address, { width, head, tail })
    })
  )

  protected render() {
    return html`
      <div class="grid-container">
        <inch-icon icon="logoFull"></inch-icon>
        <div class="address">
          <span>${observe(this.addressView$)}</span>
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'inch-notifications-mobile-info': NotificationsMobileInfoElement
  }
}
