import { lazyAppContextConsumer } from '@1inch-community/core/lazy'
import { appendClass, subscribe, translate } from '@1inch-community/core/lit-utils'
import { IToken, OverlayViewPopupPosition, TokenRecordId } from '@1inch-community/models'
import { chainViewConfig } from '@1inch-community/sdk/chain'
import { Task } from '@lit/task'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { when } from 'lit/directives/when.js'
import { fromEvent, tap } from 'rxjs'
import { Address } from 'viem'
import '../../../token-icon'
import { tooltip } from '../../../tooltip'
import { favoriteToken, selectToken } from '../../events'
import { favoriteTokenToggleStyle } from '../../styles/favorite-token-toggle.style'
import { mobileListStyle } from '../../styles/mobile-list.style'
import { tokenItemCrossChainAccordionChainViewStyle } from './token-item-cross-chain-accordion-chain-view.style'

@customElement(TokenItemCrossChainAccordionChainViewElement.tagName)
export class TokenItemCrossChainAccordionChainViewElement extends LitElement {
  static tagName = 'inch-token-item-cross-chain-accordion-chain-view' as const

  static override styles = [
    tokenItemCrossChainAccordionChainViewStyle,
    favoriteTokenToggleStyle,
    mobileListStyle,
  ]

  @property({ type: String, attribute: false }) tokenId?: TokenRecordId
  @property({ type: String, attribute: false }) walletAddress?: Address
  @property({ type: Boolean, attribute: false }) showFavoriteTokenToggle = false
  @property({ type: Boolean, attribute: false }) mobileView = false
  @property({ type: Boolean, attribute: false }) isFavorite = false
  @property({ type: Boolean, attribute: false }) disabledSingleChainTokens = false

  private readonly applicationContext = lazyAppContextConsumer(this)

  private readonly task = new Task(
    this,
    async ([tokenId]) => {
      if (!tokenId) throw new Error('')
      const token = await this.applicationContext.value.tokenStorage.getTokenById({
        tokenRecordId: tokenId,
      })
      if (!token) {
        console.error('token not found', tokenId)
        throw new Error('')
      }
      return token
    },
    () => [this.tokenId, this.walletAddress] as const
  )

  protected override firstUpdated() {
    subscribe(
      this,
      [
        fromEvent(this, 'click').pipe(
          tap((event: Event) => {
            event.stopPropagation()
            event.preventDefault()
            if (!this.task.value || !this.task.value) return
            const token = this.task.value
            if (this.disabledSingleChainTokens && !token.isSupportCrossChain) return
            selectToken(this, this.task.value)
          })
        ),
      ],
      { requestUpdate: false }
    )
  }

  render() {
    return this.task.render({
      error: () => this.renderChainViewOrLoader(),
      pending: () => this.renderChainViewOrLoader(),
      complete: () => this.renderChainViewOrLoader(),
    })
  }

  private renderChainViewOrLoader() {
    if (!this.task.value) return this.renderLoader()
    return this.renderChainView(this.task.value)
  }

  private renderChainView(token: IToken) {
    const chainView = chainViewConfig[token.chainId]
    const disabled = this.disabledSingleChainTokens && !token.isSupportCrossChain
    if (!chainView) return this.renderLoader()
    let favoriteIconStyle: Record<string, string> = {
      border: 'var(--color-content-content-secondary)',
    }
    if (this.isFavorite) {
      favoriteIconStyle = {
        border: 'var(--color-core-orange-warning)',
        body: 'var(--color-core-orange-warning)',
      }
    }
    appendClass(this, {
      'show-favorite-token-toggle': this.showFavoriteTokenToggle,
      'favorite-token': this.isFavorite,
      'mobile-view': this.mobileView,
      disabled,
    })
    return html`
      <div
        class="chain-view-container"
        ${tooltip({
          disabled: !disabled,
          disabledCursorPointer: true,
          maxWidth: 180,
          position: {
            x: [OverlayViewPopupPosition.right, OverlayViewPopupPosition.center],
            y: [OverlayViewPopupPosition.center],
          },
          text: html`${translate(
            'inch-token-item-cross-chain-flat.token-not-supported-cross-chain-accordion',
            {
              tokenName: token.name,
              chainName: chainView.name,
            }
          )}`,
        })}
      >
        <div class="left">
          <inch-icon class="corner-icon" icon="cornerDownRight16"></inch-icon>
          <inch-icon icon="${chainView.iconName}"></inch-icon>
          <div>${chainView.name}</div>
        </div>
        <div class="right favorite-icon-overflow">
          <inch-token-balance
            class="balance"
            .tokenId="${this.tokenId}"
            .symbol="${token.symbol}"
            .walletAddress="${this.walletAddress}"
          ></inch-token-balance>
          <inch-token-fiat-balance
            class="fiat-balance"
            .tokenId="${this.tokenId}"
            .symbol="${token.symbol}"
            .walletAddress="${this.walletAddress}"
          ></inch-token-fiat-balance>
        </div>
        ${when(
          this.showFavoriteTokenToggle,
          () => html`
            <inch-icon
              class="favorite-icon"
              icon="startDefault16"
              .props="${favoriteIconStyle}"
              @click="${(event: UIEvent) => {
                event.stopPropagation()
                event.preventDefault()
                if (!this.tokenId) return
                this.isFavorite = !this.isFavorite
                favoriteToken(this, [this.isFavorite, this.tokenId])
              }}"
            ></inch-icon>
          `
        )}
      </div>
    `
  }

  private renderLoader() {
    return html``
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TokenItemCrossChainAccordionChainViewElement.tagName]: TokenItemCrossChainAccordionChainViewElement
  }
}
