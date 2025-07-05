import { asyncFrame } from '@1inch-community/core/async'
import { appendClass, resizeObserver, subscribe } from '@1inch-community/core/lit-utils'
import { css, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { createRef, ref } from 'lit/directives/ref.js'
import { tap } from 'rxjs'

@customElement(MarqueeElement.tagName)
export class MarqueeElement extends LitElement {
  static tagName = 'inch-marquee' as const

  static override styles = css`
    :host {
      display: block;
      white-space: nowrap;
      overflow: hidden;
      position: relative;
    }

    :host .marquee {
      display: inline-block;
      animation: bounce 5s ease-in-out infinite alternate;
      animation-delay: 3s;
    }

    @keyframes bounce {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(var(--offset, -50%));
      }
    }
  `

  private readonly textRef = createRef<HTMLSpanElement>()

  async firstUpdated() {
    await asyncFrame()
    this.updateView()
    subscribe(this, [resizeObserver(this).pipe(tap(() => this.updateView()))], {
      requestUpdate: false,
    })
  }

  render() {
    return html` <span ${ref(this.textRef)}><slot></slot></span> `
  }

  private updateView() {
    if (!this.textRef.value) return
    const textRect = this.textRef.value?.getBoundingClientRect()
    const hostRect = this.getBoundingClientRect()
    const width = textRect?.width ?? 0
    appendClass(this.textRef.value, {
      marquee: width > hostRect.width,
    })
    const offset = width - hostRect.width + 8
    if (offset > 0) {
      this.style.setProperty('--offset', `-${offset}px`)
    } else {
      this.style.removeProperty('--offset')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [MarqueeElement.tagName]: MarqueeElement
  }
}
