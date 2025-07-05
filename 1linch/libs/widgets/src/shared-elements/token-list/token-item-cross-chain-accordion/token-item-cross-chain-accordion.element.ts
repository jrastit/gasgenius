import { lazyAppContextConsumer } from '@1inch-community/core/lazy'
import { translate } from '@1inch-community/core/lit-utils'
import { ChainId, ICrossChainTokensBindingRecord, TokenRecordId } from '@1inch-community/models'
import { parseChainId } from '@1inch-community/sdk/chain'
import { destructuringId } from '@1inch-community/sdk/tokens'
import '@1inch-community/ui-components/button'
import '@1inch-community/ui-components/icon'
import '@1inch-community/ui-components/marquee'
import '@1inch-community/ui-components/text-animate'
import { Task } from '@lit/task'
import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { when } from 'lit/directives/when.js'
import { Address } from 'viem'
import '../../token-icon'
import { changeExpand } from '../events'
import { calculateSize } from '../sizes'
import { tokenItemBaseHostStyle } from '../token-item-base'
import './token-item-cross-chain-accordion-chain-list'

@customElement(TokenItemCrossChainAccordionElement.tagName)
export class TokenItemCrossChainAccordionElement extends LitElement {
  static tagName = 'inch-token-item-cross-chain-accordion' as const

  static override styles = tokenItemBaseHostStyle

  @property({ type: Object, attribute: false })
  crossChainTokensBindingRecord?: ICrossChainTokensBindingRecord

  @property({ type: Number, attribute: false }) index = 0
  @property({ type: String, attribute: false }) walletAddress?: Address
  @property({ type: Array, attribute: false }) showChainIds?: ChainId[]
  @property({ type: Array, attribute: true }) favoriteTokenIds?: TokenRecordId[]
  @property({ type: Boolean, attribute: false }) disabledSingleChainTokens = false
  @property({ type: Boolean, attribute: false }) showFavoriteTokenToggle = false
  @property({ type: Boolean, attribute: false }) expanded = false
  @property({ type: Boolean, attribute: false }) mobileView = false

  @state() private showMoreChain = false

  private readonly applicationContext = lazyAppContextConsumer(this)

  private readonly task = new Task(
    this,
    async ([crossChainTokensBindingRecord, walletAddress, showChainIds]) => {
      if (!crossChainTokensBindingRecord || !showChainIds) throw new Error('')
      const { symbol } = crossChainTokensBindingRecord
      const [tokenName, tokenIdListWithBalance] = await Promise.all([
        this.applicationContext.value.tokenStorage.getCrossChainTokenName({ symbol }),
        walletAddress
          ? this.applicationContext.value.tokenStorage.getCrossChainTokenIdListWithBalance({
              chainIds: showChainIds ?? [],
              walletAddress,
              symbol,
            })
          : null,
      ])
      const tokenIdWithBalanceSet = new Set(tokenIdListWithBalance ?? [])
      const tokenIdListWithoutBalance = crossChainTokensBindingRecord.tokenRecordIds.filter(
        (id) => !tokenIdWithBalanceSet.has(id)
      )
      const chainIds: ChainId[] = crossChainTokensBindingRecord.tokenRecordIds.map((id) => {
        const [chainIdStr] = destructuringId(id)
        return parseChainId(chainIdStr)
      })
      if (tokenIdWithBalanceSet.size === 0) {
        this.showMoreChain = true
      }
      return [
        crossChainTokensBindingRecord,
        tokenName,
        chainIds,
        tokenIdListWithoutBalance,
        tokenIdListWithBalance,
      ] as const
    },
    () => [this.crossChainTokensBindingRecord, this.walletAddress, this.showChainIds] as const
  )

  disconnectedCallback() {
    super.disconnectedCallback()
    if (this.expanded) {
      changeExpand(this)
    }
  }

  protected render() {
    return this.task.render({
      pending: () => this.renderTokenViewOrLoader(),
      error: () => this.renderTokenViewOrLoader(),
      complete: () => this.renderTokenViewOrLoader(),
    })
  }

  private renderTokenViewOrLoader() {
    const [
      crossChainTokensBindingRecord,
      tokenName,
      chainIds,
      tokenIdListWithoutBalance,
      tokenIdListWithBalance,
    ] = this.task.value ?? []
    return this.renderTokenView(
      crossChainTokensBindingRecord,
      tokenName,
      chainIds,
      tokenIdListWithoutBalance,
      tokenIdListWithBalance
    )
  }

  private renderTokenView(
    crossChainTokensBindingRecord?: ICrossChainTokensBindingRecord,
    tokenName?: string,
    chainIds?: ChainId[],
    tokenIdListWithoutBalance?: TokenRecordId[],
    tokenIdListWithBalance?: TokenRecordId[] | null
  ) {
    const { symbol } = crossChainTokensBindingRecord ?? {}

    if (!this.expanded) {
      this.showMoreChain = false
    }

    const tokenNetworkText = crossChainTokensBindingRecord
      ? this.renderNetworkDescription(crossChainTokensBindingRecord)
      : undefined

    let size = 0
    if (this.expanded && tokenIdListWithoutBalance && tokenIdListWithBalance !== undefined) {
      size = calculateSize(this.showMoreChain, tokenIdListWithoutBalance, tokenIdListWithBalance)
    }
    let iconAfterStyle: Record<string, string> = {
      transform: 'rotate(-90deg)',
    }
    if (size !== 0) {
      iconAfterStyle = {}
    }

    return html`
      <inch-token-item-base
        .showIconAfter="${true}"
        .tokenNameText="${tokenName}"
        .tokenNetworkText="${tokenNetworkText}"
        .symbol="${symbol}"
        .walletAddress="${this.walletAddress}"
        .mobileView="${this.mobileView}"
        .chainIds="${chainIds}"
        .iconAfterStyle="${iconAfterStyle}"
        .additionalHeight="${size}"
        .selected="${this.expanded}"
        .iconAfterName="${'chevronDown16'}"
        @onClickIconAfter="${() => {
          changeExpand(this)
        }}"
        @onClickToken="${() => {
          changeExpand(this)
        }}"
      >
        <token-item-cross-chain-accordion-chain-list
          .disabledSingleChainTokens="${this.disabledSingleChainTokens}"
          .favoriteTokenIds="${this.favoriteTokenIds}"
          .tokenIdListWithoutBalance="${tokenIdListWithoutBalance}"
          .tokenIdListWithBalance="${tokenIdListWithBalance}"
          .expanded="${this.expanded}"
          .showMoreChain="${this.showMoreChain}"
          .walletAddress="${this.walletAddress}"
          .showFavoriteTokenToggle="${this.showFavoriteTokenToggle}"
          .mobileView="${this.mobileView}"
          @changeExpandMore="${() => {
            this.showMoreChain = !this.showMoreChain
          }}"
        ></token-item-cross-chain-accordion-chain-list>
      </inch-token-item-base>
    `
  }

  private renderNetworkDescription(crossChainTokensBindingRecord: ICrossChainTokensBindingRecord) {
    return html`
      <span>
        ${crossChainTokensBindingRecord.tokenRecordIds.length}
        ${when(
          crossChainTokensBindingRecord.tokenRecordIds.length === 1,
          () => html`${translate('inch-token-item-cross-chain-accordion.network')}`,
          () => html`${translate('inch-token-item-cross-chain-accordion.networks')}`
        )}
      </span>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TokenItemCrossChainAccordionElement.tagName]: TokenItemCrossChainAccordionElement
  }
}
