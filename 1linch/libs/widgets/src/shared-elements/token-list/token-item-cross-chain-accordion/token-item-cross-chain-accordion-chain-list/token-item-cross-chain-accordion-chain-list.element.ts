import { appendClass } from '@1inch-community/core/lit-utils'
import { TokenRecordId } from '@1inch-community/models'
import '@1inch-community/ui-components/button'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { map } from 'lit/directives/map.js'
import { when } from 'lit/directives/when.js'
import { Address } from 'viem'
import { changeExpandMore } from '../../events'
import '../token-item-cross-chain-accordion-chain-view'
import { tokenItemCrossChainAccordionChainListStyle } from './token-item-cross-chain-accordion-chain-list.style'

@customElement(TokenItemCrossChainAccordionChainListElement.tagName)
export class TokenItemCrossChainAccordionChainListElement extends LitElement {
  static tagName = 'token-item-cross-chain-accordion-chain-list' as const

  static override styles = tokenItemCrossChainAccordionChainListStyle

  @property({ type: String, attribute: false }) tokenId?: string
  @property({ type: String, attribute: false }) walletAddress?: Address
  @property({ type: Array, attribute: false }) tokenIdListWithoutBalance: TokenRecordId[] = []
  @property({ type: Array, attribute: false }) tokenIdListWithBalance?: TokenRecordId[] | null
  @property({ type: Array, attribute: true }) favoriteTokenIds?: TokenRecordId[]
  @property({ type: Boolean, attribute: false }) expanded = false
  @property({ type: Boolean, attribute: false }) showMoreChain = false
  @property({ type: Boolean, attribute: false }) showFavoriteTokenToggle = false
  @property({ type: Boolean, attribute: false }) mobileView = false
  @property({ type: Boolean, attribute: false }) disabledSingleChainTokens = false

  render() {
    const zeroBalance =
      this.tokenIdListWithBalance === null || this.tokenIdListWithBalance?.length === 0
    const hasHideChains = (this.tokenIdListWithoutBalance?.length ?? 0) > 0
    const showMoreButton = this.expanded && !zeroBalance && hasHideChains
    const list: TokenRecordId[] = []
    if (this.expanded && !zeroBalance) {
      list.push(...this.tokenIdListWithBalance!)
    }
    if (this.expanded && (this.showMoreChain || zeroBalance)) {
      list.push(...this.tokenIdListWithoutBalance)
    }
    appendClass(this, {
      more: this.showMoreChain,
    })
    return html`${map(
      list,
      (id) => html`
        <inch-token-item-cross-chain-accordion-chain-view
          .tokenId="${id}"
          .disabledSingleChainTokens="${this.disabledSingleChainTokens}"
          .isFavorite="${this.favoriteTokenIds?.includes(id)}"
          .walletAddress="${this.walletAddress}"
          .showFavoriteTokenToggle="${this.showFavoriteTokenToggle}"
          .mobileView="${this.mobileView}"
        ></inch-token-item-cross-chain-accordion-chain-view>
      `
    )}
    ${when(
      showMoreButton,
      () => html`
      <inch-button type="link" @click="${(event: Event) => {
        event.preventDefault()
        event.stopPropagation()
        changeExpandMore(this)
      }}">
        <span class="show-more-button-icon-container">
          <inch-icon class="show-more-button-icon less-icon" icon="minus24"></inch-icon>
          <inch-icon class="show-more-button-icon more-icon" icon="plus24"></inch-icon>
        </span>
        <inch-text-animate text="${this.showMoreChain ? 'Less' : 'More'}">
      </inch-button>
      `
    )} `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TokenItemCrossChainAccordionChainListElement.tagName]: TokenItemCrossChainAccordionChainListElement
  }
}
