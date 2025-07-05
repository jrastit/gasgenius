import { lazyAppContextConsumer } from '@1inch-community/core/lazy'
import {
  dispatchEvent,
  getMobileMatchMediaAndSubscribe,
  observe,
  translate,
} from '@1inch-community/core/lit-utils'
import {
  FusionQuoteReceiveDto,
  IBigFloat,
  ISwapContext,
  IToken,
  SwapSnapshot,
} from '@1inch-community/models'
import { getNativeToken, getWrapperNativeToken, isNativeToken } from '@1inch-community/sdk/chain'
import { SwapContextToken } from '@1inch-community/sdk/swap'
import { buildTokenIdByToken } from '@1inch-community/sdk/tokens'
import '@1inch-community/ui-components/button'
import '@1inch-community/ui-components/card'
import '@1inch-community/ui-components/icon'
import '@1inch-community/widgets/notifications'
import { consume } from '@lit/context'
import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { choose } from 'lit/directives/choose.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { when } from 'lit/directives/when.js'
import { Observable, shareReplay, switchMap } from 'rxjs'
import { UserRejectedRequestError } from 'viem'
import '../../../shared-elements/token-icon'
import '../swap-options/swap-options.element'
import { confirmSwapStyle } from './confirm-swap.style'

@customElement(ConfirmSwapElement.tagName)
export class ConfirmSwapElement extends LitElement {
  static readonly tagName = 'inch-confirm-swap' as const

  static override readonly styles = confirmSwapStyle

  @property({ type: Object }) swapSnapshot!: SwapSnapshot<FusionQuoteReceiveDto>

  private readonly applicationContext = lazyAppContextConsumer(this)

  @consume({ context: SwapContextToken, subscribe: true })
  @property({ type: Object, attribute: false })
  swapContext?: ISwapContext

  @state() state: 'swap' | 'wrap' | null = null

  @state() swapInProgress = false

  private fiatAmountMap = new Map<string, Observable<string>>()

  private readonly mobileMedia = getMobileMatchMediaAndSubscribe(this)

  private get needWrap() {
    return isNativeToken(this.swapSnapshot.sourceToken.address)
  }

  private get isJustWrap() {
    return this.swapSnapshot.strategyName === 'NativeWrapper'
  }

  protected override render() {
    const size = this.mobileMedia.matches ? 'xl' : 'xxl'
    return html`
      <div class="confirm-swap-view">
        <inch-card-header
          backButton
          headerTextPosition="center"
          headerText="Confirm swap"
          headerTextPosition="left"
        >
        </inch-card-header>

        ${this.getTokenViewContainer()} ${this.getDetailInfo()}

        <inch-button
          loader="${ifDefined(this.swapInProgress ? '' : undefined)}"
          @click="${() => this.onSwap()}"
          fullSize
          size="${size}"
          type="${this.swapInProgress ? 'secondary' : 'primary'}"
        >
          ${when(
            this.swapInProgress,
            () => html`<span>Confirm swap in wallet</span>`,
            () => html`<span>Swap</span>`
          )}
        </inch-button>
      </div>
    `
  }

  private async onSwap() {
    if (this.swapInProgress) return
    try {
      this.swapInProgress = true
      const hash = await this.swapContext?.swap(this.swapSnapshot)
      dispatchEvent(this, 'backCard', null)
      if (hash) {
        await this.applicationContext.value.notifications.show(
          'Swap status',
          html` <inch-notification-fusion-swap-view
            orderHash="${hash}"
          ></inch-notification-fusion-swap-view>`,
          { pinned: true }
        )
      }
    } catch (error) {
      const errorText = parseError(error as Error)
      await this.applicationContext.value.notifications.error(html`${translate(errorText)}`)
      console.error(error)
    }
    this.swapInProgress = false
  }

  private getTokenViewContainer() {
    const token = this.isJustWrap
      ? getNativeToken(this.swapSnapshot.sourceToken.chainId)
      : this.swapSnapshot.sourceToken

    return html`
      <div class="token-view-container">
        ${this.getTokenView(token, this.swapSnapshot.sourceTokenAmount, 'source')}
        ${this.getSeparatorView(this.needWrap ? 'wrap' : 'swap')} ${this.getTokenWrapView()}
        ${this.getTokenView(
          this.swapSnapshot.destinationToken,
          this.swapSnapshot.destinationTokenAmount,
          'destination'
        )}
      </div>
    `
  }

  private getDetailInfo() {
    return html`
      <div class="content-container">
        ${when(
          this.swapSnapshot,
          (snapshot) => html` <inch-swap-options .snapshot="${snapshot}"></inch-swap-options>`
        )}
      </div>
    `
  }

  private getTokenView(token: IToken, amount: IBigFloat, type: 'source' | 'wrap' | 'destination') {
    const amountView = amount.toFixedSmart(6)
    return html`
      <div class="token-view">
        <div class="token-view-row token-view-top">
          <span>
            ${choose(type, [
              ['source', () => html`You pay`],
              ['wrap', () => html`You wrap`],
              ['destination', () => html`You receive`],
            ])}
          </span>

          <span>${observe(this.getFiatAmountStream(token, amount))}</span>
        </div>
        <div class="token-view-row">
          <div class="symbol-view">
            <inch-token-icon
              chainId="${this.swapSnapshot.sourceToken.chainId}"
              symbol="${token.symbol}"
              address="${token.address}"
            ></inch-token-icon>
            <span class="primary-text">${token.symbol}</span>
          </div>
          <span class="primary-text">${amountView}</span>
        </div>
      </div>
    `
  }

  private getTokenWrapView() {
    if (this.needWrap) {
      return html`
        ${this.getTokenView(
          getWrapperNativeToken(this.swapSnapshot.sourceToken.chainId),
          this.swapSnapshot.sourceTokenAmount,
          'wrap'
        )}
        ${this.getSeparatorView('swap')}
      `
    }
    return html``
  }

  private getSeparatorView(state: 'swap' | 'wrap') {
    return html`
      <div class="separator">
        <div class="separator-view"></div>
        <div
          class="separator-arrow-container ${this.state === state && this.needWrap
            ? 'separator-arrow-container-loader'
            : ''}"
        >
          <inch-icon icon="arrowDown24"></inch-icon>
        </div>
      </div>
    `
  }

  private getFiatAmountStream(token: IToken, amount: IBigFloat) {
    if (this.fiatAmountMap.has(token.address)) {
      return this.fiatAmountMap.get(token.address)!
    }

    const stream = this.applicationContext.value.onChain
      .getBlockEmitter(this.swapSnapshot.sourceToken.chainId)
      .pipe(
        switchMap(async () => {
          const fiatPrice = await this.applicationContext.value.tokenStorage.getTokenFiatPrice({
            tokenRecordId: buildTokenIdByToken(token),
          })
          const fiatBalance = amount.times(fiatPrice)
          return `~$${fiatBalance.toFixedSmart(2)}`
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      )
    this.fiatAmountMap.set(token.address, stream)
    return stream
  }
}

function parseError(error: Error): string {
  if (error instanceof UserRejectedRequestError) {
    return 'widgets.swap-form.swap-button.wallet-rejected'
  }
  return 'widgets.swap-form.swap-button.swap-error-message'
}

declare global {
  interface HTMLElementTagNameMap {
    'inch-confirm-swap': ConfirmSwapElement
  }
}
