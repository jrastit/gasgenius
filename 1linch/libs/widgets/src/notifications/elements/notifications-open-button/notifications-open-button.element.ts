import { lazyAppContextConsumer } from '@1inch-community/core/lazy'
import { subscribe } from '@1inch-community/core/lit-utils'
import '@1inch-community/ui-components/button'
import '@1inch-community/ui-components/icon'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { when } from 'lit/directives/when.js'
import { defer, tap } from 'rxjs'
import { notificationsOpenButtonStyle } from './notifications-open-button.style'

@customElement(NotificationsOpenButtonElement.tagName)
export class NotificationsOpenButtonElement extends LitElement {
  static tagName = 'inch-notifications-open-button' as const

  static override styles = [notificationsOpenButtonStyle]

  private readonly applicationContext = lazyAppContextConsumer(this)

  @state() count = 0

  private readonly count$ = defer(
    () => this.applicationContext.value.notifications.notificationsCount$
  )

  protected firstUpdated() {
    this.count =
      this.applicationContext.value.storage.get('inch-notifications-open-button__count', Number) ??
      0
    subscribe(this, [
      this.count$.pipe(
        tap((count) => {
          this.applicationContext.value.storage.set('inch-notifications-open-button__count', count)
          this.count = count
        })
      ),
    ])
  }

  protected render() {
    return html`
      <inch-button
        disabled="${ifDefined(this.count === 0 ? '' : undefined)}"
        @click="${() => this.applicationContext.value.notifications.openAllNotifications()}"
        size="l"
        type="primary-gray"
      >
        <inch-icon icon="bell24"></inch-icon>
      </inch-button>
      ${when(this.count, () => html` <span class="notification-counter">${this.count}</span> `)}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'inch-notifications-open-button': NotificationsOpenButtonElement
  }
}
