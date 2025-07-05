import { asyncTimeout } from '@1inch-community/core/async'
import { lazyAppContextConsumer } from '@1inch-community/core/lazy'
import { appendClass, observe, translate } from '@1inch-community/core/lit-utils'
import { ChainId, type ITokenListViewData, type TokenRecordId } from '@1inch-community/models'
import '@1inch-community/ui-components/scroll'
import type { ScrollViewVirtualizerConsumerElement } from '@1inch-community/ui-components/scroll'
import { html, LitElement, TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { map as LitMap } from 'lit/directives/map.js'
import { createRef, ref } from 'lit/directives/ref.js'
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  defer,
  map,
  merge,
  Observable,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs'
import { Address } from 'viem'
import { changeSearchState } from '../events'
import '../token-item-cross-chain-accordion'
import '../token-item-cross-chain-flat'
import '../token-item-loader'
import { tokenListStyle } from './token-list.style'

type TokenListByViewTypeAndSearchFilterAndChainIdsType = Observable<
  ITokenListViewData | TokenRecordId[]
>

export type TokenListType = 'flat' | 'accordion'

@customElement(TokenListElement.tagName)
export class TokenListElement extends LitElement {
  static tagName = 'inch-token-list' as const

  static override styles = tokenListStyle

  @property({ type: Boolean, attribute: true }) showFavoriteTokenToggle = false
  @property({ type: Boolean, attribute: true }) showOnlyWithBalance = false
  @property({ type: Boolean, attribute: false }) mobileView = false
  @property({ type: Boolean, attribute: false }) disabledSingleChainTokens = true
  @property({ type: Array, attribute: false }) favoriteTokenIds?: TokenRecordId[]
  @property({ type: Function, attribute: false }) header?: () => TemplateResult<1>

  @property({ type: String, attribute: true })
  set type(value: TokenListType) {
    this.type$.next(value)
  }

  @property({ type: Array, attribute: false })
  set chainIds(value: ChainId[]) {
    if (!Array.isArray(value)) return
    this.chainIds$.next(value)
  }

  @property({ type: String, attribute: false })
  set walletAddress(value: Address) {
    if (!value) return
    this.walletAddress$.next(value)
  }

  @property({ type: String, attribute: false })
  set searchFilter(value: string) {
    if (this.searchFilter$.value === value) return
    this.searchFilter$.next(value)
    this.requestUpdate()
    if (!this.searchInProgress) {
      this.searchInProgress = true
      changeSearchState(this, this.searchInProgress)
    }
  }

  private searchInProgress = false

  @state() private expandedAccordionItemIndex: number | null = null

  @state() private isEmpty = false

  private readonly emptyList: 'loader'[] = new Array(50).fill('loader')

  private tokenListViewDataSnapshot: ITokenListViewData | null = null

  private readonly applicationContext = lazyAppContextConsumer(this)

  private readonly virtualizedRef = createRef<ScrollViewVirtualizerConsumerElement>()

  private readonly type$ = new BehaviorSubject<TokenListType>('accordion')
  private readonly walletAddress$ = new BehaviorSubject<Address | undefined>(undefined)
  private readonly chainIds$ = new BehaviorSubject<ChainId[]>([])
  private readonly searchFilter$ = new BehaviorSubject<string>('')
  private readonly crossChainEmitter$ = defer(
    () => this.applicationContext.value.onChain.crossChainEmitter
  ).pipe(startWith(null))
  private readonly tokensUpdate$ = defer(
    () => this.applicationContext.value.tokenStorage.tokensUpdate$
  ).pipe(startWith(null))
  private readonly balancesUpdate$ = defer(
    () => this.applicationContext.value.tokenStorage.balancesUpdate$
  ).pipe(startWith(null))

  private readonly tokenListByViewTypeAndSearchFilterAndChainIds$: TokenListByViewTypeAndSearchFilterAndChainIdsType =
    combineLatest([
      this.type$,
      this.searchFilter$,
      this.chainIds$,
      this.walletAddress$,
      merge(this.crossChainEmitter$, this.tokensUpdate$, this.balancesUpdate$),
    ]).pipe(
      debounceTime(0),
      switchMap(([type, searchFilter, chainIds, walletAddress]) => {
        if (type === 'flat' || searchFilter.length > 0) {
          return this.applicationContext.value.tokenStorage.getTokenIdList({
            chainIds,
            tokensOnlyWithBalance: this.showOnlyWithBalance,
            walletAddress: walletAddress || null,
            tokenNameSymbolAddressMatches: searchFilter || null,
          })
        }
        if (type === 'accordion') {
          return this.applicationContext.value.tokenStorage.getSymbolData({
            chainIds,
            tokensOnlyWithBalance: this.showOnlyWithBalance,
            walletAddress: walletAddress || null,
          })
        }
        throw new Error(`TokenListElementError: Unknown type: ${type}`)
      })
    )

  private readonly dataIndexListOfFlatTokenIdList$ =
    this.tokenListByViewTypeAndSearchFilterAndChainIds$.pipe(
      map((data) => {
        if (Array.isArray(data)) {
          this.tokenListViewDataSnapshot = null
          return data
        }
        const length = data.userTokensInfo.length + data.allTokensInfo.length
        this.tokenListViewDataSnapshot = data
        return new Array(length).fill(0) as 0[]
      }),
      tap((data) => {
        if (this.searchInProgress) {
          this.searchInProgress = false
          changeSearchState(this, this.searchInProgress)
        }
        this.isEmpty = data.length === 0
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    )

  protected render() {
    appendClass(this, {
      empty: this.isEmpty,
      search: this.searchFilter$.value.length > 0,
    })
    return html`
      ${this.renderEmptySearchView()}
      <inch-scroll-view-virtualizer-consumer
        ${ref(this.virtualizedRef)}
        .header="${this.header}"
        .stubView=${() => this.renderStubList()}
        .items=${observe(this.dataIndexListOfFlatTokenIdList$, this.emptyList)}
        .keyFunction="${(id: TokenRecordId | 0 | 'loader', index: number) =>
          this.keyFunction(id, index)}"
        .renderItem="${(id: TokenRecordId | 0 | 'loader', index: number) =>
          this.renderItem(id, index)}"
      ></inch-scroll-view-virtualizer-consumer>
    `
  }

  private renderEmptySearchView() {
    return html`
      <div class="empty-search">
        <inch-icon icon="emptySearch"></inch-icon>
        <h3>${translate('inch-token-list.search-empty', { name: this.searchFilter$.value })}</h3>
        <span>${translate('inch-token-list.search-empty-description')}</span>
      </div>
    `
  }

  private renderItem(id: TokenRecordId | 0 | 'loader', index: number): TemplateResult<1> {
    if (id === 'loader') {
      return this.renderLoaderItem(index)
    }
    if (id === 0) {
      return this.renderAccordionItem(index)
    }
    if (typeof id === 'string') {
      return this.renderFlatItem(id, index)
    }
    throw new Error(`TokenListElementError: Unsupported template`)
  }

  private renderStubList() {
    return html`${LitMap(this.emptyList, (_, index) => this.renderLoaderItem(index))}`
  }

  private renderLoaderItem(index: number) {
    return html`
      <inch-token-item-loader
        .iconAfterStyle="${this.type$.value === 'accordion'
          ? { transform: 'rotate(-90deg)' }
          : undefined}"
        .showIconAfter="${this.type$.value === 'accordion'}"
        .index="${index}"
        .iconAfterName="${this.type$.value === 'accordion' ? 'chevronDown16' : undefined}"
        .mobileView="${this.mobileView}"
      ></inch-token-item-loader>
    `
  }

  private renderAccordionItem(index: number) {
    const record = this.extractTokenViewDataByIndex(index)
    const walletAddress = this.walletAddress$.value
    const chainIds = this.chainIds$.value
    return html`<inch-token-item-cross-chain-accordion
      .disabledSingleChainTokens="${this.disabledSingleChainTokens}"
      .favoriteTokenIds="${this.favoriteTokenIds}"
      .showFavoriteTokenToggle="${this.showFavoriteTokenToggle}"
      .crossChainTokensBindingRecord="${record}"
      .walletAddress="${walletAddress}"
      .showChainIds="${chainIds}"
      .expanded="${this.expandedAccordionItemIndex === index}"
      .index="${index}"
      .mobileView="${this.mobileView}"
      @changeExpand="${() => this.changeExpandHandler(index)}"
    ></inch-token-item-cross-chain-accordion>`
  }

  private renderFlatItem(id: TokenRecordId, index: number) {
    const walletAddress = this.walletAddress$.value
    return html` <inch-token-item-cross-chain-flat
      .disabledSingleChainTokens="${this.disabledSingleChainTokens}"
      .showFavoriteTokenToggle="${this.showFavoriteTokenToggle}"
      .tokenId="${id}"
      .walletAddress="${walletAddress}"
      .index="${index}"
      .mobileView="${this.mobileView}"
      .isFavorite="${this.favoriteTokenIds?.includes(id)}"
    ></inch-token-item-cross-chain-flat>`
  }

  private keyFunction(id: TokenRecordId | 0 | 'loader', index: number): string {
    if (id === 0 && this.tokenListViewDataSnapshot !== null) {
      const record = this.extractTokenViewDataByIndex(index)!
      return [record.symbol, ...record.tokenRecordIds].join('')
    }
    if (typeof id === 'string' && id !== 'loader') {
      return id
    }
    if (id !== 'loader') {
      return `loader-${index}`
    }
    return index.toString()
  }

  private extractTokenViewDataByIndex(index: number) {
    if (this.tokenListViewDataSnapshot === null) return null
    if (index >= this.tokenListViewDataSnapshot.userTokensInfo.length) {
      const allTokensInfoIndex = index - this.tokenListViewDataSnapshot.userTokensInfo.length
      return this.tokenListViewDataSnapshot.allTokensInfo[allTokensInfoIndex] ?? null
    }
    return this.tokenListViewDataSnapshot.userTokensInfo[index]
  }

  private async changeExpandHandler(index: number) {
    if (this.expandedAccordionItemIndex === index) {
      this.expandedAccordionItemIndex = null
    } else {
      this.expandedAccordionItemIndex = index
      await asyncTimeout(300)
      this.virtualizedRef.value?.scrollToIndex(index)
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TokenListElement.tagName]: TokenListElement
  }
}
