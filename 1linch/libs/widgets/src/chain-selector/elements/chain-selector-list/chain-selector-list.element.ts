import { dispatchEvent } from '@1inch-community/core/lit-utils'
import { ChainViewFull } from '@1inch-community/models'
import { chainList } from '@1inch-community/sdk/chain'
import '@1inch-community/ui-components/button'
import '@1inch-community/ui-components/card'
import '@1inch-community/ui-components/scroll'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { map as LitMap } from 'lit/directives/map.js'
import '../chain-selector-list-item'
import { chainSelectorListStyle } from './chain-selector-list.style'

@customElement(ChainSelectorListElement.tagName)
export class ChainSelectorListElement extends LitElement {
  static tagName = 'inch-chain-selector-list' as const

  static override styles = [chainSelectorListStyle]

  @property({ type: Array, attribute: false }) selectedChainViewList: ChainViewFull[] = []

  protected override render() {
    const text =
      this.selectedChainViewList.length === chainList.length ? 'Deselect All' : 'Select All'
    return html`
      <inch-card overlayView>
        <inch-card-header separator mini>
          <span slot="left-container" class="title">Networks</span>
          <inch-button
            slot="right-container"
            size="xl"
            type="link"
            @click="${this.onSelectAllClick}"
          >
            <inch-text-animate text="${text}"></inch-text-animate>
          </inch-button>
        </inch-card-header>
        ${this.getList()}
      </inch-card>
    `
  }

  private getList() {
    return html`
      <inch-scroll-view-consumer>
        ${LitMap(
          chainList,
          (info) => html`
            <inch-chain-selector-list-item
              .info="${info}"
              .isActiveChain="${this.selectedChainViewList.includes(info)}"
              @chainItemClick="${(event: CustomEvent) =>
                this.onChainItemClick(event.detail.value as ChainViewFull)}"
            ></inch-chain-selector-list-item>
          `
        )}
      </inch-scroll-view-consumer>
    `

    // return chainList.map(
    //   (info) => html`
    //     <inch-chain-selector-list-item
    //       .info="${info}"
    //       .isActiveChain="${this.selectedChainViewList.includes(info)}"
    //       @chainItemClick="${(event: CustomEvent) =>
    //         this.onChainItemClick(event.detail.value as ChainViewFull)}"
    //     ></inch-chain-selector-list-item>
    //   `
    // )
  }

  private resetSelectedChainViewList() {
    this.selectedChainViewList = [chainList[0]]
  }

  private onSelectAllClick(): void {
    if (this.selectedChainViewList.length === chainList.length) {
      this.resetSelectedChainViewList()
    } else {
      this.selectedChainViewList = chainList
    }

    dispatchEvent(this, 'changeSelectedChainViewList', this.selectedChainViewList)
  }

  private onChainItemClick(chainInfo: ChainViewFull) {
    if (this.selectedChainViewList.includes(chainInfo)) {
      this.selectedChainViewList = this.selectedChainViewList.filter((item) => item !== chainInfo)
    } else {
      this.selectedChainViewList = [...this.selectedChainViewList, chainInfo]
    }

    if (this.selectedChainViewList.length === 0) {
      this.resetSelectedChainViewList()
    }

    dispatchEvent(this, 'changeSelectedChainViewList', this.selectedChainViewList)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'inch-chain-selector-list': ChainSelectorListElement
  }
}
