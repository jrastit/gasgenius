import { lazyAppContextConsumer, lazyConsumer } from '@1inch-community/core/lazy'
import {
  __ISwapFormEmbeddedController,
  EmbeddedBootstrapConfigSwapForm,
  SwapSnapshot,
  TokenType,
} from '@1inch-community/models'
import { SwapContextToken } from '@1inch-community/sdk/swap'
import { SceneController } from '@1inch-community/ui-components/scene'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ElementContainer } from '../model/element-container'

@customElement(SwapFormEmbeddedContainerElement.tagName)
export class SwapFormEmbeddedContainerElement extends LitElement implements ElementContainer {
  static readonly tagName = 'inch-swap-form-embedded-container' as const

  static readonly styles = [SceneController.styles()]

  private readonly swapContext = lazyConsumer(this, { context: SwapContextToken, subscribe: true })

  private readonly applicationContext = lazyAppContextConsumer(this)

  private targetSelectToken: TokenType | null = null

  private swapSnapshot: SwapSnapshot | null = null

  private swapFormEmbeddedController?: __ISwapFormEmbeddedController

  private readonly scene = new SceneController('swapForm', {
    swapForm: { minWidth: 434, maxHeight: 625, lazyRender: true },
    selectToken: { minWidth: 434, maxHeight: 680 },
    confirmSwap: { minWidth: 434, maxHeight: 680 },
  })

  async setConfig(config: EmbeddedBootstrapConfigSwapForm) {
    const selectTokenLoader = config.swapFromParams.disabledTokenChanging
      ? () => Promise.resolve()
      : () => import('@1inch-community/widgets/select-token')
    await Promise.all([
      this.setToken(config),
      import('@1inch-community/ui-components/card'),
      import('@1inch-community/widgets/swap-form'),
      selectTokenLoader(),
    ])
  }

  bindEmbeddedController(controller: __ISwapFormEmbeddedController) {
    this.swapFormEmbeddedController = controller
  }

  protected render() {
    return html` <inch-card>
      ${this.scene.render({
        swapForm: () => html`
          <inch-swap-form
            @confirmSwap="${(event: CustomEvent) => this.onOpenConfirmSwap(event)}"
            @changeChain="${() => this.swapFormEmbeddedController?.emitter.emit('changeChain')}"
            @openTokenSelector="${(event: CustomEvent) => this.onOpenSelectToken(event)}"
            @connectWallet="${() => this.swapFormEmbeddedController?.emitter.emit('connectWallet')}"
          ></inch-swap-form>
        `,
        confirmSwap: () =>
          html` <inch-confirm-swap
            .swapSnapshot="${this.swapSnapshot as any}"
            @backCard="${async () => {
              await this.scene.back()
              this.swapSnapshot = null
            }}"
          ></inch-confirm-swap>`,
        selectToken: () => html`
          <inch-select-token
            tokenType="${this.targetSelectToken!}"
            @backCard="${() => this.scene.back()}"
          ></inch-select-token>
        `,
      })}
    </inch-card>`
  }

  private async onOpenConfirmSwap(event: CustomEvent) {
    this.swapSnapshot = event.detail.value
    await this.scene.nextTo('confirmSwap')
  }

  private async onOpenSelectToken(event: CustomEvent) {
    this.targetSelectToken = event.detail.value
    await this.scene.nextTo('selectToken')
  }

  private async setToken(config: EmbeddedBootstrapConfigSwapForm) {
    const { chainId } = config
    const { sourceTokenSymbol, destinationTokenSymbol } = config.swapFromParams
    const [source, destination] = await Promise.all([
      this.applicationContext.value.tokenStorage.getTokenBySymbol(
        chainId,
        sourceTokenSymbol.toUpperCase()
      ),
      this.applicationContext.value.tokenStorage.getTokenBySymbol(
        chainId,
        destinationTokenSymbol.toUpperCase()
      ),
    ])
    this.swapContext.value.setPair({
      source: source[0],
      destination: destination[0],
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'inch-swap-form-embedded-container': SwapFormEmbeddedContainerElement
  }
}
