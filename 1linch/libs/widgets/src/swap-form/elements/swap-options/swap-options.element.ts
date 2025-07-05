import { lazyAppContextConsumer } from '@1inch-community/core/lazy'
import { getMobileMatchMedia, subscribe } from '@1inch-community/core/lit-utils'
import { BigFloat } from '@1inch-community/core/math'
import {
  ISwapContextStrategyDataSnapshot,
  SettingsValue,
  StrategyOptionType,
} from '@1inch-community/models'
import { getNativeToken, getSymbolFromWrapToken } from '@1inch-community/sdk/chain'
import { buildTokenId, buildTokenIdByToken, isTokensEqual } from '@1inch-community/sdk/tokens'
import '@1inch-community/ui-components/button'
import '@1inch-community/ui-components/icon'
import { html, LitElement, PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { map as litMap } from 'lit/directives/map.js'
import { defer, firstValueFrom, map, Observable, shareReplay } from 'rxjs'
import './swap-option-item'
import { MinReceiveData, NetworkFeeData, RateData } from './swap-option-item'
import { swapOptionStyle } from './swap-options.style'

@customElement(SwapOptionsElement.tagName)
export class SwapOptionsElement extends LitElement {
  static tagName = 'inch-swap-options' as const

  static override styles = swapOptionStyle

  @property({ type: Boolean, attribute: false }) editable = false
  @property({ type: Object, attribute: false }) snapshot?: ISwapContextStrategyDataSnapshot
  @property({ type: Object, attribute: false }) excludeOptions?: Set<StrategyOptionType>

  private readonly applicationContext = lazyAppContextConsumer(this)

  @state() private readonly values: Map<StrategyOptionType, unknown> = new Map<
    StrategyOptionType,
    unknown
  >()

  private readonly auction$: Observable<SettingsValue> = defer(
    () =>
      this.applicationContext.value.settings.getSetting<[number, 'custom' | 'preset']>(
        'auctionTime'
      ).value$
  ).pipe(
    map((auctionTime) => {
      if (auctionTime) return { type: auctionTime[1], value: auctionTime[0] }

      return { type: 'auto', value: this.snapshot?.options.AUCTION_TIME ?? null } as const
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  private readonly slippage$: Observable<SettingsValue> = defer(
    () =>
      this.applicationContext.value.settings.getSetting<[number, 'custom' | 'preset']>('slippage')
        .value$
  ).pipe(
    map((slippageSettings) => {
      if (slippageSettings) return { type: slippageSettings[1], value: slippageSettings[0] }

      return { type: 'auto', value: this.snapshot?.options.SLIPPAGE ?? null } as const
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties)

    const snapshot: ISwapContextStrategyDataSnapshot | undefined =
      _changedProperties.get('snapshot')

    this.loadAll(snapshot)
  }

  private loadAll(snapshot?: ISwapContextStrategyDataSnapshot) {
    if (!snapshot) {
      return
    }

    this.values.clear()

    Object.keys(snapshot.options).forEach((key) => {
      const type = StrategyOptionType[key as StrategyOptionType]

      if (!this.excludeOptions || !this.excludeOptions.has(type)) {
        this.values.set(type, null)
      }
    })

    this.loadMinReceiveFiatValue()
    this.loadSlippage()
    this.loadAuction()
    this.loadNetworkFeeFiatValue()
    this.loadRate()
  }

  private async loadAuction(): Promise<void> {
    try {
      if (this.values.has(StrategyOptionType.AUCTION_TIME)) {
        const value = await firstValueFrom(this.auction$)
        this.values.set(StrategyOptionType.AUCTION_TIME, value)
      }
    } catch (e) {
      console.warn(e)
    } finally {
      this.requestUpdate()
    }
  }

  private async loadSlippage(): Promise<void> {
    try {
      if (this.values.has(StrategyOptionType.SLIPPAGE)) {
        const value = await firstValueFrom(this.slippage$)
        this.values.set(StrategyOptionType.SLIPPAGE, value)
      }
    } catch (e) {
      console.warn(e)
    } finally {
      this.requestUpdate()
    }
  }

  private async loadMinReceiveFiatValue(): Promise<void> {
    try {
      const snapshot = this.snapshot
      const destToken = snapshot?.destinationToken
      const minAmountValue = snapshot?.options?.MIN_RECEIVE

      if (
        !destToken ||
        !snapshot ||
        !minAmountValue ||
        !this.values.has(StrategyOptionType.MIN_RECEIVE)
      ) {
        return
      }

      const tokenPrice = await this.applicationContext.value.tokenStorage.getTokenFiatPrice({
        tokenRecordId: buildTokenId(destToken.chainId, destToken.address),
      })

      const amountFiat = (minAmountValue ?? BigFloat.zero()).times(tokenPrice)
      const amountFiatFormated = amountFiat.toFixedSmart(2)
      const value: MinReceiveData = {
        amountFiatFormated,
        minAmountValue: minAmountValue.toFixedSmart(6),
        symbol: destToken.symbol,
      }

      this.values.set(StrategyOptionType.MIN_RECEIVE, value)
    } catch (e) {
      console.warn(e)
    } finally {
      this.requestUpdate()
    }
  }

  private async loadNetworkFeeFiatValue(): Promise<void> {
    try {
      const snapshot = this.snapshot
      const chainId = snapshot?.sourceToken.chainId
      const networkFee = snapshot?.options?.NETWORK_FEE

      if (!snapshot || !chainId || !this.values.has(StrategyOptionType.NETWORK_FEE)) {
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

      const value: NetworkFeeData = {
        strategyType: snapshot.strategyName,
        fiatValue: amountFiatFormated ?? '0',
        valueFormatted: networkFee?.toFixedSmart(6) ?? '0',
        value: networkFee ?? null,
        symbol: native.symbol,
      }

      this.values.set(StrategyOptionType.NETWORK_FEE, value)
    } catch (e) {
      console.warn(e)
    } finally {
      this.requestUpdate()
    }
  }

  private async loadRate(): Promise<void> {
    try {
      const snapshot = this.snapshot
      const rateData = snapshot?.options?.RATE

      if (!snapshot || !rateData || !this.values.has(StrategyOptionType.RATE)) {
        return
      }

      const { rate, revertedRate, sourceToken, destinationToken } = rateData
      const primaryToken = await this.applicationContext.value.tokenStorage.getPriorityToken(
        sourceToken.chainId,
        [sourceToken.address, destinationToken.address]
      )
      const originPrimary = isTokensEqual(primaryToken, sourceToken)
        ? sourceToken
        : destinationToken
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

      const value: RateData = {
        tokenASymbol: getSymbolFromWrapToken(secondaryToken),
        tokenBSymbol: getSymbolFromWrapToken(originPrimary),
        rateFormated,
        rateFiatFormated,
      }
      this.values.set(StrategyOptionType.RATE, value)
    } catch (e) {
      console.warn(e)
    } finally {
      this.requestUpdate()
    }
  }

  private getViewByType(type: StrategyOptionType, value: unknown) {
    switch (type) {
      case StrategyOptionType.AUCTION_TIME:
        return html` <inch-swap-option-item-auction
          .editable=${this.editable}
          .value=${value}
        ></inch-swap-option-item-auction>`

      case StrategyOptionType.SLIPPAGE:
        return html` <inch-swap-option-item-slippage
          .editable=${this.editable}
          .value=${value}
        ></inch-swap-option-item-slippage>`

      case StrategyOptionType.MIN_RECEIVE:
        return html` <inch-swap-option-item-min-receive
          .value="${value}"
        ></inch-swap-option-item-min-receive>`

      case StrategyOptionType.NETWORK_FEE:
        return html` <inch-swap-option-item-network-fee
          .value=${value}
        ></inch-swap-option-item-network-fee>`

      case StrategyOptionType.RATE:
        return html` <inch-swap-option-item-rate .value=${value}></inch-swap-option-item-rate>`
    }
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties)
    subscribe(this, [this.slippage$, this.auction$], { requestUpdate: false })
    this.loadAll(this.snapshot)
  }

  protected override render() {
    const snapshot = this.snapshot
    const options = snapshot?.options
    const isMobile = getMobileMatchMedia().matches

    if (!snapshot || !options) {
      return
    }

    return html`
      <div class="content-container">
        ${litMap(
          Array.from(this.values.entries()),
          ([type, value]) => html`
            <div class="content-row ${isMobile ? 'mobile-content-row' : ''}">
              ${this.getViewByType(type, value)}
            </div>
          `
        )}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [SwapOptionsElement.tagName]: SwapOptionsElement
  }
}
