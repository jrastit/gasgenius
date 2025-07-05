import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { chipStyle } from './chip.style'

@customElement(ChipElement.tagName)
export class ChipElement extends LitElement {
  static tagName = 'inch-chip' as const

  static override styles = chipStyle

  @property({ type: String, attribute: true }) value?: string

  protected render() {
    return html` <div class="chip-content">${this.value}</div> `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [ChipElement.tagName]: ChipElement
  }
}
