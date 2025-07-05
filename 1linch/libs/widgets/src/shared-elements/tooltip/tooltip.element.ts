import { html, LitElement, TemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { tooltipStyle } from './tooltip.style'

@customElement(TooltipElement.tagName)
export class TooltipElement extends LitElement {
  static tagName = 'inch-tooltip' as const

  static override styles = tooltipStyle

  @property({ type: String, attribute: false }) text?: string | TemplateResult

  render() {
    return html`${this.text}`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TooltipElement.tagName]: TooltipElement
  }
}
