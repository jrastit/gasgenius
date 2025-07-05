import { dispatchEvent, isRTLCurrentLocale } from '@1inch-community/core/lit-utils'
import { ChainViewFull } from '@1inch-community/models'
import { isL2Chain } from '@1inch-community/sdk/chain'
import '@1inch-community/ui-components/icon'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { when } from 'lit/directives/when.js'
import { chainSelectorListItemStyle } from './chain-selector-list-item.style'

@customElement(ChainSelectorListItemElement.tagName)
export class ChainSelectorListItemElement extends LitElement {
  static tagName = 'inch-chain-selector-list-item' as const

  static override styles = chainSelectorListItemStyle

  @property({ type: Object }) info?: ChainViewFull

  @property({ type: Boolean, attribute: false }) isActiveChain: boolean = false

  protected override render() {
    if (this.info === undefined) return

    const isL2 = isL2Chain(this.info.chainId)

    const classes = {
      container: true,
      active: this.isActiveChain,
    }
    const iconSize = 24

    return html`
      <div class="${classMap(classes)}" @click="${() => this.onItemClick()}">
        ${when(
          isL2,
          () => html`
            <inch-icon icon="${isRTLCurrentLocale() ? 'l2ChainRTL24' : 'l2Chain24'}"></inch-icon>
          `
        )}
        <inch-icon
          width="${iconSize}px"
          height="${iconSize}px"
          icon="${this.info.iconName}"
        ></inch-icon>
        <span>${this.info.name}</span>
        <inch-icon
          class="list-icon"
          icon="${this.isActiveChain ? 'check24' : 'plus24'}"
        ></inch-icon>
        <inch-icon class="list-icon-delete" icon="minus24"></inch-icon>
      </div>
    `
  }

  private onItemClick() {
    if (!this.info) throw new Error('')
    dispatchEvent(this, 'chainItemClick', this.info)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [ChainSelectorListItemElement.tagName]: ChainSelectorListItemElement
  }
}
