import { lazyAppContextConsumer } from '@1inch-community/core/lazy'
import { subscribe } from '@1inch-community/core/lit-utils'
import { BigFloat } from '@1inch-community/core/math'
import { ChainId, IBigFloat, TokenRecordId } from '@1inch-community/models'
import '@1inch-community/ui-components/loaders'
import '@1inch-community/ui-components/number-animation'
import { Task } from '@lit/task'
import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'
import { tap } from 'rxjs'
import type { Address } from 'viem'
import { tooltip } from '../../tooltip'
import { tokenBalanceStyle } from '../style/token-balance.style'

@customElement(TokenBalanceElement.tagName)
export class TokenBalanceElement extends LitElement {
  static tagName = 'inch-token-balance' as const

  static override styles = tokenBalanceStyle

  @property({ type: String, attribute: false }) value?: IBigFloat
  @property({ type: String, attribute: false }) tokenId?: TokenRecordId
  @property({ type: String, attribute: false }) symbol?: string
  @property({ type: String, attribute: false }) chainIds?: ChainId[]
  @property({ type: String, attribute: false }) walletAddress?: Address
  @property({ type: Boolean, attribute: true }) endTextAlign = false
  @property({ type: Boolean, attribute: true }) animateTransition = true
  @property({ type: Number, attribute: false }) skeletonAnimationDelayMillisecond: number = 0

  @state() isConnectedWallet = true

  private readonly applicationContext = lazyAppContextConsumer(this)

  private readonly task = new Task(
    this,
    async ([tokenId, symbol, chainIds, walletAddress]) => {
      if (this.value) {
        return this.value
      }
      if (!this.isConnectedWallet) {
        return BigFloat.zero()
      }
      if (tokenId && walletAddress) {
        return await this.applicationContext.value.tokenStorage.getTokenBalanceById({
          tokenRecordId: tokenId,
          walletAddress,
        })
      }
      if (symbol && chainIds && walletAddress) {
        return await this.applicationContext.value.tokenStorage.getTotalTokenBalanceBySymbol({
          chainIds,
          symbol,
          walletAddress,
        })
      }
      throw new Error('')
    },
    () => [this.tokenId, this.symbol, this.chainIds, this.walletAddress] as const
  )

  protected firstUpdated() {
    if (this.value) {
      return
    }
    subscribe(
      this,
      [
        this.applicationContext.value.onChain.crossChainEmitter.pipe(
          tap(() => this.task.run([this.tokenId, this.symbol, this.chainIds, this.walletAddress]))
        ),
        this.applicationContext.value.wallet.data.isConnected$.pipe(
          tap((state) => (this.isConnectedWallet = state))
        ),
      ],
      { requestUpdate: false }
    )
  }

  protected render() {
    return this.task.render({
      error: () => this.renderBalanceOrLoader(),
      pending: () => this.renderBalanceOrLoader(),
      complete: () => this.renderBalanceOrLoader(),
    })
  }

  private renderBalanceOrLoader() {
    if (!this.task.value) return this.renderLoader()
    return this.renderBalance(this.task.value)
  }

  private renderBalance(balance: IBigFloat) {
    if (this.animateTransition) {
      const style = {
        justifyContent: this.endTextAlign ? 'end' : '',
      }
      return html`
        <inch-number-animation
          ${tooltip(`${balance.toFixedSmart(9)} ${this.symbol}`)}
          style="${styleMap(style)}"
          .value="${balance.toFixedSmart(2)}"
          postfixSymbol="${this.symbol}"
        ></inch-number-animation>
      `
    }
    return html` <span ${tooltip(`${balance.toFixedSmart(9)} ${this.symbol}`)}>
      ${balance.toFixedSmart(2)} ${this.symbol}
    </span>`
  }

  private renderLoader() {
    const style = {
      marginLeft: this.endTextAlign ? 'auto' : '',
    }
    return html`<inch-loader-skeleton
      style="${styleMap(style)}"
      .animationDelayMillisecond="${this.skeletonAnimationDelayMillisecond}"
    ></inch-loader-skeleton>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TokenBalanceElement.tagName]: TokenBalanceElement
  }
}
