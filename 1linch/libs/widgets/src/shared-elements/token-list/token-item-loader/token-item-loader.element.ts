import '@1inch-community/ui-components/loaders'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../token-item-base'
import { tokenItemBaseHostStyle } from '../token-item-base'

@customElement(TokenItemLoaderElement.tagName)
export class TokenItemLoaderElement extends LitElement {
  static tagName = 'inch-token-item-loader' as const

  static override styles = tokenItemBaseHostStyle

  @property({ type: Object, attribute: false }) iconAfterStyle?: Record<string, string>
  @property({ type: Boolean, attribute: false }) mobileView = false
  @property({ type: Number, attribute: false }) index = 0
  @property({ type: String, attribute: false }) iconAfterName?: string
  @property({ type: Boolean, attribute: false }) showIconAfter = false

  protected render() {
    return html`<inch-token-item-base
      .iconAfterStyle="${this.iconAfterStyle}"
      .showIconAfter="${this.showIconAfter}"
      .index="${this.index}"
      .iconAfterName="${this.iconAfterName}"
      .mobileView="${this.mobileView}"
    ></inch-token-item-base>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TokenItemLoaderElement.tagName]: TokenItemLoaderElement
  }
}
