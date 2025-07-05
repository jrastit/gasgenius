import { appendStyle } from '@1inch-community/core/lit-utils'
import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'

@customElement(LoaderSpinnerElement.tagName)
export class LoaderSpinnerElement extends LitElement {
  static tagName = 'inch-loader-spinner' as const

  static override styles = css`
    :host {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      box-sizing: border-box;
      color: var(--color-content-content-tertiary);
    }

    .loader {
      position: absolute;
      cursor: wait;
      display: flex;
      width: calc(100% + 4px);
      height: calc(100% + 4px);
      box-sizing: border-box;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      border: 0.1em solid var(--secondary);
      z-index: 1;
    }

    .loader_animation {
      border-bottom-color: inherit;
      border-top-color: inherit;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }

      100% {
        transform: rotate(360deg);
      }
    }
  `

  @property({ type: Number, attribute: true }) size: number = 24
  @property({ type: Boolean, attribute: false }) showLoader = true

  protected render(): unknown {
    appendStyle(this, {
      width: `${this.size}px`,
      height: `${this.size}px`,
    })
    const classes = {
      loader: true,
      loader_animation: this.showLoader,
    }
    return html`<div class="${classMap(classes)}"></div>
      <slot></slot>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [LoaderSpinnerElement.tagName]: LoaderSpinnerElement
  }
}
