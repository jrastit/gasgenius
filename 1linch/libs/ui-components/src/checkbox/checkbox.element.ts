import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { checkboxStyle } from './checkbox.style'

@customElement(CheckboxElement.tagName)
export class CheckboxElement extends LitElement {
  static tagName = 'inch-checkbox' as const

  static override styles = checkboxStyle

  protected render() {
    return html` <div class="checkbox-body"></div> `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'inch-checkbox': CheckboxElement
  }
}
