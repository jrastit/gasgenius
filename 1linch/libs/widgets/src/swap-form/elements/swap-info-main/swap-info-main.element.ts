import { lazyAppContextConsumer } from '@1inch-community/core/lazy'
import { dispatchEvent, observe, subscribe, translate } from '@1inch-community/core/lit-utils'
import { BigFloat } from '@1inch-community/core/math'
import {
  ISwapContext,
  ISwapContextStrategyDataSnapshot,
  Rate,
  StrategyOptionType,
} from '@1inch-community/models'
import { getNativeToken, getSymbolFromWrapToken } from '@1inch-community/sdk/chain'
import { SwapContextToken } from '@1inch-community/sdk/swap'
import {
  buildTokenId,
  buildTokenIdByToken,
  isRateEqual,
  isTokensEqual,
} from '@1inch-community/sdk/tokens'
import '@1inch-community/ui-components/button'
import '@1inch-community/ui-components/icon'
import { consume } from '@lit/context'
import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { styleMap } from 'lit/directives/style-map.js'
import { when } from 'lit/directives/when.js'
import {
  combineLatest,
  debounceTime,
  defer,
  distinctUntilChanged,
  firstValueFrom,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs'
import '../swap-options/swap-options.element'
import { swapInfoMainStyle } from './swap-info-main.style'

const strategyIcon = new Map<string, string>([
  ['Fusion', 'fusion16'],
  ['FusionPlus', 'fusion16'],
])

@customElement(SwapInfoMainElement.tagName)
export class SwapInfoMainElement extends LitElement {
  static tagName = 'inch-swap-info-main' as const

  static override styles = swapInfoMainStyle

  @property({ type: Boolean }) isOpen = false

  @consume({ context: SwapContextToken })
  context?: ISwapContext

  private readonly applicationContext = lazyAppContextConsumer(this)

  @state() private loading: boolean = false
  private snapshot: ISwapContextStrategyDataSnapshot | null = null

  private readonly changeConfig$ = defer(() =>
    combineLatest([
      this.getContext()
        .getTokenByType('source')
        .pipe(distinctUntilChanged((previous, current) => isTokensEqual(previous, current))),
      this.getContext()
        .getTokenByType('destination')
        .pipe(distinctUntilChanged((previous, current) => isTokensEqual(previous, current))),
    ])
  )

  readonly rate$ = defer(() =>
    this.getContext().dataSnapshot$.pipe(
      switchMap((snapshot) => of(snapshot?.options.RATE ?? null))
    )
  )

  readonly networkFeeView$ = defer(() =>
    this.getContext().dataSnapshot$.pipe(
      debounceTime(0),
      switchMap(async (snapshot) => {
        const networkFee = snapshot?.options?.NETWORK_FEE

        if (networkFee === null) return this.getLoadView()
        const chainId = snapshot?.sourceToken.chainId

        if (!snapshot || !chainId) {
          return
        }

        let amountFiatFormated: string | null | '0' = null
        const native = getNativeToken(chainId)

        if (networkFee?.isGreaterThan(BigFloat.zero())) {
          const tokenPrice = await this.applicationContext.value.tokenStorage.getTokenFiatPrice({
            tokenRecordId: buildTokenId(chainId, native.address),
          })

          const amountFiat = (networkFee ?? BigFloat.zero()).times(tokenPrice)
          amountFiatFormated = amountFiat.toFixedSmart(2)
        }

        const fusionIconClass = {
          'fusion-icon': true,
          'fusion-icon-open': this.isOpen,
        }

        return html`
          <div class="${classMap(fusionIconClass)}">
            ${when(
              strategyIcon.get(snapshot.strategyName),
              (icon) => html` <inch-icon icon="${icon}"></inch-icon>`
            )}
            <span>
              ${when(
                networkFee?.value,
                () => html`~$${amountFiatFormated ?? '0'}`,
                () => html`${translate('widgets.swap-form.fusion-info.net-fee-free')}`
              )}
            </span>
          </div>
        `
      }),
      startWith(this.getLoadView())
    )
  )

  readonly rateView$ = this.rate$.pipe(
    debounceTime(0),
    distinctUntilChanged(rateViewDistinctUntilChangedHandler),
    switchMap(async (rateData) => {
      const sourceToken = await firstValueFrom(this.getContext().getTokenByType('source'))
      const destinationToken = await firstValueFrom(this.getContext().getTokenByType('destination'))

      if (rateData === null || !sourceToken || !destinationToken) return this.getLoadView()

      const { rate, revertedRate } = rateData
      const primaryToken = await this.applicationContext.value.tokenStorage.getPriorityToken(
        sourceToken.chainId,
        [sourceToken.address, destinationToken.address]
      )
      const secondaryToken = isTokensEqual(primaryToken, sourceToken)
        ? destinationToken
        : sourceToken
      const isRevertedRate = isTokensEqual(primaryToken, sourceToken)
      const targetRate = isRevertedRate ? revertedRate : rate
      const rateFormated = targetRate.toFixedSmart(2)
      const tokenPrice = await this.applicationContext.value.tokenStorage.getTokenFiatPrice({
        tokenRecordId: buildTokenIdByToken(secondaryToken),
      })
      const rateFiatFormated = tokenPrice.toFixedSmart(2)
      return html`
        <span class="rate-view"
          >1 ${getSymbolFromWrapToken(secondaryToken)} = ${rateFormated} ${primaryToken.symbol}
          <span class="dst-token-rate-usd-price">~$${rateFiatFormated}</span></span
        >
      `
    }),
    startWith(this.getLoadView())
  )

  protected firstUpdated() {
    subscribe(
      this,
      [
        this.changeConfig$.pipe(
          tap(() => {
            this.loading = true
            this.isOpen = false
          })
        ),
        this.getContext().loading$.pipe(
          tap((isLoading) => {
            if (this.loading && !isLoading) {
              this.loading = false
            }
          })
        ),
        this.getContext().dataSnapshot$.pipe(
          tap(async (snapshot) => {
            this.snapshot = snapshot

            if (
              !snapshot ||
              !snapshot.sourceToken ||
              !snapshot.destinationToken ||
              snapshot.sourceTokenAmount.isZero()
            ) {
              this.loading = true
            }

            if (snapshot?.sourceTokenAmount?.isGreaterThan(BigFloat.zero())) {
              const maxAmount = await this.getContext().getMaxAmount()

              if (snapshot.sourceTokenAmount.isGreaterThan(maxAmount)) {
                this.loading = true
              }
            }
          })
        ),
      ],
      { requestUpdate: false }
    )
  }

  override connectedCallback() {
    super.connectedCallback()
    dispatchEvent(this, 'changeFusionInfoOpenState', this.isOpen)
  }

  override disconnectedCallback() {
    super.disconnectedCallback()
    dispatchEvent(this, 'changeFusionInfoOpenState', false)
  }

  protected override render() {
    const classes = {
      container: true,
      open: this.isOpen,
      'snapshot-loading': this.loading,
    }

    const iconClasses = {
      icon: true,
      'open-icon': this.isOpen,
    }

    const fusionIconClass = {
      'fusion-icon': true,
      'fusion-icon-open': this.isOpen,
    }
    const length = Object.keys(this.snapshot?.options ?? {}).length
    const styles = {
      height: this.isOpen ? `${length * 40 + 56 - 16}px` : '',
    }

    return html`
      <div
        class="${classMap(classes)}"
        style="${styleMap(styles)}"
        @click="${() => {
          if (this.isOpen || this.loading) return
          this.isOpen = true
          dispatchEvent(this, 'changeFusionInfoOpenState', this.isOpen)
        }}"
      >
        ${when(
          this.loading,
          () => html``,
          () => html`
            <div class="short-content">
              <div class="rate-container">${observe(this.rateView$)}</div>
              <div class="${classMap(fusionIconClass)}">${observe(this.networkFeeView$)}</div>
              <inch-button
                @click="${(event: MouseEvent) => this.onChangeOpen(event)}"
                size="l"
                type="tertiary"
              >
                <inch-icon class="${classMap(iconClasses)}" icon="chevronDown16"></inch-icon>
              </inch-button>
            </div>

            <div class="content-container">
              ${when(
                this.snapshot,
                (snapshot) => html`
                  <inch-swap-options
                    .snapshot="${snapshot}"
                    .editable="${false}"
                    .excludeOptions="${new Set([StrategyOptionType.RATE])}"
                  ></inch-swap-options>
                `
              )}
            </div>
          `
        )}
      </div>
    `
  }

  private getLoadView() {
    return html` <div class="rate-loader"></div> `
  }

  private onChangeOpen(event: MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    this.isOpen = !this.isOpen
    dispatchEvent(this, 'changeFusionInfoOpenState', this.isOpen)
  }

  private getContext() {
    if (!this.context) throw new Error('')
    return this.context
  }
}

function rateViewDistinctUntilChangedHandler(rate1: Rate | null, rate2: Rate | null) {
  if (rate1 === null || rate2 === null) {
    return false
  }
  return isRateEqual(rate1, rate2)
}

declare global {
  interface HTMLElementTagNameMap {
    'inch-fusion-swap-info-main': SwapInfoMainElement
  }
}
