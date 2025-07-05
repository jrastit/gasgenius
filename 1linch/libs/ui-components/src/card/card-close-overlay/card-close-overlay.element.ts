import { dispatchEvent, subscribe } from '@1inch-community/core/lit-utils'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { fromEvent, tap } from 'rxjs'
import '../../icon'
import { cardCloseOverlayStyle } from './card-close-overlay.style'

@customElement(CardCloseOverlayElement.tagName)
export class CardCloseOverlayElement extends LitElement {
  static readonly tagName = 'inch-card-close-overlay' as const

  static override styles = cardCloseOverlayStyle

  constructor() {
    super()
    this.slot = 'close-overlay'
  }

  protected firstUpdated() {
    subscribe(
      this,
      [
        fromEvent(this, 'click').pipe(
          tap((event: Event) => dispatchEvent(this, 'closeCard', null, event))
        ),
      ],
      { requestUpdate: false }
    )
  }

  protected render() {
    return html` <inch-icon icon="hideSidebar24"></inch-icon> `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'inch-card-close-overlay': CardCloseOverlayElement
  }
}
