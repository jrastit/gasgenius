import { lazyAppContextConsumer, lazyProvider } from '@1inch-community/core/lazy'
import {
  getMobileMatchMedia,
  getMobileMatchMediaAndSubscribe,
} from '@1inch-community/core/lit-utils'
import { SwapContextToken } from '@1inch-community/sdk/swap'
import '@1inch-community/ui-components/card'
import '@1inch-community/widgets/swap-form'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement(SwapFormElement.tagName)
export class SwapFormElement extends LitElement {
  static tagName = 'inch-swap-form-container' as const

  swapContext = lazyProvider(this, { context: SwapContextToken })

  private readonly applicationContext = lazyAppContextConsumer(this)

  private mobileMedia = getMobileMatchMediaAndSubscribe(this)

  async connectedCallback() {
    await this.preloadForm(getMobileMatchMedia().matches)
    super.connectedCallback()
    const context = await this.applicationContext.value.makeSwapContext()
    this.swapContext.set(context)
    this.requestUpdate()
    this.preloadForm(!this.mobileMedia.matches).catch(console.error)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.swapContext.value.destroy()
  }

  protected render() {
    if (!this.swapContext) return
    if (this.mobileMedia.matches) {
      return html`<inch-swap-form-mobile></inch-swap-form-mobile>`
    }
    return html`<inch-swap-form-desktop></inch-swap-form-desktop>`
  }

  private async preloadForm(isMobile: boolean) {
    if (isMobile) {
      await import('./swap-form-mobile.element')
    } else {
      await import('./swap-form-desktop.element')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'inch-swap-form-container': SwapFormElement
  }
}
