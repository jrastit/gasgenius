import { PersistCache } from '@1inch-community/core/cache'
import { lazyAppContextConsumer } from '@1inch-community/core/lazy'
import { subscribe } from '@1inch-community/core/lit-utils'
import { JsonBigFloatParser } from '@1inch-community/core/storage'
import { ChainId, IBigFloat } from '@1inch-community/models'
import { getChainIdList } from '@1inch-community/sdk/chain'
import '@1inch-community/ui-components/icon'
import '@1inch-community/ui-components/number-animation'
import { Task } from '@lit/task'
import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { tap } from 'rxjs'
import { Address } from 'viem'
import { tooltip } from '../../tooltip'

const allChainIds = getChainIdList()

@customElement(WalletTotalFiatBalanceElement.tagName)
export class WalletTotalFiatBalanceElement extends LitElement {
  static tagName = 'inch-wallet-total-fiat-balance' as const

  static override styles = css`
    :host {
      display: flex;
      gap: 8px;
      align-items: center;
      position: relative;
    }

    .alert {
      opacity: 0;
      margin-left: -24px;
      transform: translateX(-100%);
      transition:
        transform 0.2s,
        margin-left 0.2s,
        opacity 0.2s;
      transition-delay: 1s;
      pointer-events: none;
    }

    .alert_show {
      position: static;
      margin-left: 0;
      transform: translateX(0);
      opacity: 1;
      pointer-events: all;
    }
  `

  @property({ type: String, attribute: false }) address?: Address
  @property({ type: String, attribute: false }) chainIds: ChainId[] = allChainIds

  private readonly applicationContext = lazyAppContextConsumer(this)

  private readonly cache = new PersistCache<Address, IBigFloat>(
    `${WalletTotalFiatBalanceElement.tagName}-cache`,
    JsonBigFloatParser
  )

  private readonly task = new Task(
    this,
    async ([address, chainIds]) => {
      if (!address) throw new Error('')
      const balance =
        await this.applicationContext.value.tokenStorage.getCrossChainTotalFiatBalance({
          walletAddress: address,
          chainIds: chainIds || null,
        })
      this.cache.set(address, balance)
      return balance
    },
    () => [this.address, this.chainIds] as const
  )

  async connectedCallback() {
    super.connectedCallback()
    await this.cache.init(this.applicationContext.value)
  }

  protected firstUpdated() {
    subscribe(
      this,
      [
        this.applicationContext.value.onChain.crossChainEmitter.pipe(
          tap(() => this.task.run([this.address, this.chainIds]))
        ),
      ],
      { requestUpdate: false }
    )
  }

  protected override render() {
    return this.task.render({
      pending: () => this.renderBalanceOrLoader(),
      error: () => this.renderBalanceOrLoader(),
      complete: () => this.renderBalanceOrLoader(),
    })
  }

  private renderBalanceOrLoader() {
    if (!this.task.value) {
      if (this.address && this.cache.has(this.address)) {
        return this.renderBalance(this.cache.get(this.address)!)
      }
      return this.renderLoader()
    }
    return this.renderBalance(this.task.value)
  }

  private renderBalance(balance: IBigFloat) {
    const classes = {
      alert: true,
      alert_show: this.chainIds.length !== allChainIds.length,
    }
    return html`
      <inch-number-animation
        ${tooltip(`$${balance.toFixedSmart(9)}`)}
        .value="${balance.toFixedSmart(2)}"
        prefixSymbol="$"
      ></inch-number-animation>
      <inch-icon
        ${tooltip({ text: 'Some networks are hidden' })}
        class="${classMap(classes)}"
        icon="info16"
      ></inch-icon>
    `
  }

  private renderLoader() {
    return html`<inch-loader-skeleton></inch-loader-skeleton>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [WalletTotalFiatBalanceElement.tagName]: WalletTotalFiatBalanceElement
  }
}
