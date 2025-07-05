import { EmbeddedConfigToken } from '@1inch-community/core/application-context'
import { lazyAppContextConsumer } from '@1inch-community/core/lazy'
import { observe, translate } from '@1inch-community/core/lit-utils'
import { EmbeddedBootstrapConfigSwapForm, ISwapContext } from '@1inch-community/models'
import { SwapContextToken } from '@1inch-community/sdk/swap'
import '@1inch-community/ui-components/button'
import '@1inch-community/ui-components/card'
import '@1inch-community/ui-components/icon'
import { consume } from '@lit/context'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { combineLatest, defer, distinctUntilChanged, map, startWith } from 'rxjs'
import './elements'
import { swapFromStyle } from './swap-from.style'

@customElement(SwapFromElement.tagName)
export class SwapFromElement extends LitElement {
  static tagName = 'inch-swap-form' as const

  static override styles = swapFromStyle

  static lastFusionRenderIsEmptyState = true

  private readonly applicationContext = lazyAppContextConsumer(this)

  @consume({ context: SwapContextToken, subscribe: true })
  swapContext?: ISwapContext

  @consume({ context: EmbeddedConfigToken })
  config?: EmbeddedBootstrapConfigSwapForm

  private readonly fusionView$ = combineLatest([
    defer(() => this.applicationContext.value.wallet.data.activeAddress$),
    defer(() => this.swapContext!.getTokenByType('source')),
    defer(() => this.swapContext!.getTokenByType('destination')),
  ]).pipe(
    map(
      ([address, sourceToken, destinationToken]) => !address || !sourceToken || !destinationToken
    ),
    startWith(SwapFromElement.lastFusionRenderIsEmptyState),
    distinctUntilChanged(),
    map((isEmpty) => {
      SwapFromElement.lastFusionRenderIsEmptyState = isEmpty
      if (isEmpty) return html``
      return html`<inch-fusion-swap-info></inch-fusion-swap-info>`
    })
  )

  protected override render() {
    if (!this.swapContext) return
    return html`
      <div class="swap-form-container">
        <inch-card-header
          headerText="${translate('widgets.swap-form.header.swap')}"
          headerTextPosition="left"
        >
          <slot name="header" slot="right-container"></slot>
        </inch-card-header>

        <div class="input-container">
          <inch-swap-form-input tokenType="source"></inch-swap-form-input>
          <inch-token-pair-switch></inch-token-pair-switch>
          <inch-swap-form-input disabled tokenType="destination"></inch-swap-form-input>
        </div>

        ${observe(this.fusionView$)}

        <inch-swap-button></inch-swap-button>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'inch-swap-form': SwapFromElement
  }
}
