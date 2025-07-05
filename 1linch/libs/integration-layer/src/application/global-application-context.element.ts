import { ApplicationContextToken } from '@1inch-community/core/application-context'
import { lazyProvider } from '@1inch-community/core/lazy'
import { css, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { getContext } from './context'

@customElement(GlobalApplicationContextElement.tagName)
export class GlobalApplicationContextElement extends LitElement {
  static readonly tagName = 'global-application-context'

  static override readonly styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
  `

  constructor() {
    super()
    lazyProvider(this, { context: ApplicationContextToken, initialValue: getContext() })
  }

  protected render() {
    return html`<slot></slot>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [GlobalApplicationContextElement.tagName]: GlobalApplicationContextElement
  }
}
