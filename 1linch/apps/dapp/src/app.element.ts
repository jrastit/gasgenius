import { scrollbarStyle } from '@1inch-community/core/theme'
import '@1inch-community/widgets/notifications'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { appStyle } from './app.style'
import './elements/footer'
import './elements/header'
import './elements/swap-form'

@customElement('app-root')
export class AppElement extends LitElement {
  static override styles = [scrollbarStyle, appStyle]

  protected render() {
    return html`
      <inch-header></inch-header>
      <div id="outlet" class="content">
        <inch-swap-form-container></inch-swap-form-container>
      </div>
      <inch-footer></inch-footer>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-root': AppElement
  }
}
