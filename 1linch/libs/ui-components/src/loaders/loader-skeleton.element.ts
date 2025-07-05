import { appendStyle } from '@1inch-community/core/lit-utils'
import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement(LoaderSkeletonElement.tagName)
export class LoaderSkeletonElement extends LitElement {
  static tagName = 'inch-loader-skeleton' as const

  @property({ type: Number, attribute: false }) animationDelayMillisecond: number = 0

  static override styles = css`
    :host {
      display: block;
      cursor: wait;
      width: 6em;
      background: linear-gradient(
        90deg,
        var(--color-background-bg-secondary) 25%,
        var(--color-background-bg-primary) 37%,
        var(--color-background-bg-secondary) 63%
      );
      background-size: 400% 100%;
      animation: pulse 5s linear infinite;
      border-radius: 4px;
    }

    @keyframes pulse {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `

  protected render() {
    appendStyle(this, {
      animationDelay: `${this.animationDelayMillisecond}ms`,
    })
    return html`<slot>&nbsp;</slot>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [LoaderSkeletonElement.tagName]: LoaderSkeletonElement
  }
}
