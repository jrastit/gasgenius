import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { cardStyle } from './card.style'

@customElement(CardElement.tagName)
export class CardElement extends LitElement {
  static tagName = 'inch-card' as const

  static override styles = cardStyle

  @property({ type: Boolean }) overlayView = false

  @property({ type: Boolean }) showShadow = false

  protected override render() {
    return html`
      <slot name="close-overlay"></slot>
      <slot name="header"></slot>
      <div class="card-content">
        <slot></slot>
      </div>
    `
  }

  protected override firstUpdated() {
    if (this.overlayView && !this.classList.contains('overlay')) {
      this.classList.add('overlay')
    }
    if (this.showShadow && !this.classList.contains('shadow')) {
      this.classList.add('shadow')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [CardElement.tagName]: CardElement
  }
}
