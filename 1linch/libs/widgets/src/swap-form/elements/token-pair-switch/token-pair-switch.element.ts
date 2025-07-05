import { EmbeddedConfigToken } from '@1inch-community/core/application-context'
import { throttle } from '@1inch-community/core/decorators'
import { lazyConsumer } from '@1inch-community/core/lazy'
import { observe } from '@1inch-community/core/lit-utils'
import { SwapContextToken } from '@1inch-community/sdk/swap'
import '@1inch-community/ui-components/icon'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { combineLatest, defer, map } from 'rxjs'
import { tokenPairSwitchStyle } from './token-pair-switch.style'

@customElement(TokenPairSwitchElement.tagName)
export class TokenPairSwitchElement extends LitElement {
  static tagName = 'inch-token-pair-switch' as const

  static override styles = tokenPairSwitchStyle

  private readonly swapContext = lazyConsumer(this, { context: SwapContextToken })

  private readonly config = lazyConsumer(this, { context: EmbeddedConfigToken })

  private get disabledTokenChanging() {
    return this.config.isInit && this.config.value.swapFromParams.disabledTokenChanging
  }

  private readonly isDisabled$ = defer(() => {
    return combineLatest([
      this.swapContext.value.getTokenByType('source'),
      this.swapContext.value.getTokenByType('destination'),
    ])
  }).pipe(
    map(
      ([sourceToken, destinationToken]) =>
        !sourceToken || !destinationToken || this.disabledTokenChanging
    )
  )

  protected override render() {
    return html`
      <button
        @click="${() => this.onClick()}"
        ?disabled="${observe(this.isDisabled$, false)}"
        class="switcher"
      >
        <inch-icon class="switcher-icon" icon="arrowDown24"></inch-icon>
      </button>
    `
  }

  @throttle(350)
  protected async onClick() {
    if (this.disabledTokenChanging) return
    this.swapContext.value.switchPair()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'inch-token-pair-switch': TokenPairSwitchElement
  }
}
