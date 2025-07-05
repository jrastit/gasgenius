import { LongTimeCache } from '@1inch-community/core/cache'
import { formatHex, FormatHexParams } from '@1inch-community/core/formatters'
import { lazyAppContextConsumer } from '@1inch-community/core/lazy'
import { ChainId } from '@1inch-community/models'
import '@1inch-community/ui-components/loaders'
import { Task } from '@lit/task'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { Address } from 'viem'
import { tooltip } from '../tooltip'

@customElement(AddressViewElement.tagName)
export class AddressViewElement extends LitElement {
  static tagName = 'inch-address-view' as const

  @property({ type: String, attribute: true }) address?: Address
  @property({ type: Boolean, attribute: true }) hideTooltip: boolean = false
  @property({ type: Object, attribute: false }) formatParams?: FormatHexParams

  private readonly context = lazyAppContextConsumer(this)
  private readonly ensNameCache = new LongTimeCache<Address, string | null>(
    `${AddressViewElement.tagName}-ens-name-cache`,
    3
  )

  private readonly task = new Task(
    this,
    async ([address]) => {
      if (!address) throw new Error('')
      if (this.ensNameCache.has(address)) {
        return this.ensNameCache.get(address)!
      }
      const client = await this.context.value.onChain.getClient(ChainId.eth)
      const name = await client.getEnsName({ address })
      this.ensNameCache.set(address, name)
      return name
    },
    () => [this.address] as const
  )

  render() {
    return this.task.render({
      complete: () => this.renderLoaderOrAddressOrEnsName(),
      pending: () => this.renderLoaderOrAddressOrEnsName(),
      error: () => this.renderLoaderOrAddressOrEnsName(),
    })
  }

  private renderLoaderOrAddressOrEnsName() {
    if (!this.address) return this.renderLoader()
    if (this.task.value) return this.renderENSName(this.task.value, this.address)
    return this.renderAddress(this.address)
  }

  private renderLoader() {
    return html`<inch-loader-skeleton></inch-loader-skeleton>`
  }

  private renderENSName(name: string, address: Address) {
    if (this.hideTooltip) {
      return html`<span>${name}</span>`
    }
    return html`<span ${tooltip(address)}>${name}</span>`
  }

  private renderAddress(address: Address) {
    const formatedAddress = formatHex(address, this.formatParams)
    if (this.hideTooltip) {
      return html`<span>${formatedAddress}</span>`
    }
    return html`<span ${tooltip(address)}>${formatedAddress}</span>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [AddressViewElement.tagName]: AddressViewElement
  }
}
