import { appendClass, appendStyle, subscribe } from '@1inch-community/core/lit-utils'
import { css, html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { filter, fromEvent, tap } from 'rxjs'

@customElement(LoaderSkeletonMaskElement.tagName)
export class LoaderSkeletonMaskElement extends LitElement {
  static tagName = 'inch-loader-skeleton-mask' as const

  @property({ type: Number, attribute: false }) animationDelayMillisecond: number = 0

  static override styles = css`
    :host {
      mask-image: linear-gradient(to right, black, black);
    }

    :host(.loader) {
      mask-image: linear-gradient(to right, black, transparent, black, black, black);
      mask-size: 200% 100%;
      mask-position: 100% 0;
      animation: pulse 2s linear infinite;
    }

    @keyframes pulse {
      0% {
        mask-position: 100% 0;
        -webkit-mask-position: 100% 0;
      }
      100% {
        mask-position: -100% 0;
        -webkit-mask-position: -100% 0;
      }
    }
  `

  @property({ type: Boolean, attribute: false })
  set showLoader(state: boolean) {
    this.animationEnabled = state
    if (state) {
      this.animationIntervalEnabled = true
    }
  }

  @state() private animationEnabled = true
  @state() private animationIntervalEnabled = true

  protected firstUpdated() {
    subscribe(
      this,
      fromEvent(this, 'animationiteration').pipe(
        filter(() => !this.animationEnabled),
        tap(() => {
          this.animationIntervalEnabled = false
        })
      )
    )
  }

  protected render() {
    appendStyle(this, {
      animationDelay: `${this.animationDelayMillisecond}ms`,
    })
    appendClass(this, {
      loader: this.animationIntervalEnabled,
    })
    return html` <slot></slot> `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [LoaderSkeletonMaskElement.tagName]: LoaderSkeletonMaskElement
  }
}
