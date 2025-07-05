import { lazyAppContextConsumer } from '@1inch-community/core/lazy'
import { subscribe } from '@1inch-community/core/lit-utils'
import { BigFloat } from '@1inch-community/core/math'
import { IBigFloat, TokenRecordId } from '@1inch-community/models'
import '@1inch-community/ui-components/number-animation'
import { Task } from '@lit/task'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { tap } from 'rxjs'
import { tooltip } from '../tooltip'

@customElement(FiatAmountViewElement.tagName)
export class FiatAmountViewElement extends LitElement {
  static tagName = 'inch-fiat-amount-view' as const

  @property({ type: String, attribute: false }) tokenId?: TokenRecordId
  @property({ type: Object, attribute: false }) amount: IBigFloat = BigFloat.zero()

  private readonly applicationContext = lazyAppContextConsumer(this)

  private readonly task = new Task(
    this,
    async ([tokenRecordId, amount]) => {
      if (!tokenRecordId) throw new Error('')
      const price = await this.applicationContext.value.tokenStorage.getTokenFiatPrice({
        tokenRecordId,
      })
      return price.times(amount)
    },
    () => [this.tokenId, this.amount] as const
  )

  protected firstUpdated() {
    subscribe(
      this,
      [
        this.applicationContext.value.onChain.crossChainEmitter.pipe(
          tap(() => this.task.run([this.tokenId, this.amount]))
        ),
      ],
      { requestUpdate: false }
    )
  }

  render() {
    return this.task.render({
      complete: () => this.renderValue(),
      pending: () => this.renderValue(),
      error: () => this.renderValue(),
    })
  }

  private renderValue() {
    const amount = this.task.value
    if (!amount) {
      return html``
    }
    return html`
      <inch-number-animation
        ${tooltip(`$${amount.toFixedSmart(9)}`)}
        .value="${amount.toFixedSmart(2)}"
        prefixSymbol="$"
      ></inch-number-animation>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [FiatAmountViewElement.tagName]: FiatAmountViewElement
  }
}
