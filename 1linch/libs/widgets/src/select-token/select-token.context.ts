import { JsonParser } from '@1inch-community/core/storage'
import {
  ChainId,
  IApplicationContext,
  ISelectTokenContext,
  ISwapContext,
  IToken,
  TokenType,
} from '@1inch-community/models'
import { getChainIdList } from '@1inch-community/sdk/chain'
import { BehaviorSubject, combineLatest, defer, map, Observable, Subject } from 'rxjs'
import { type Address } from 'viem'

export class SelectTokenContext implements ISelectTokenContext {
  readonly chainId$: Observable<ChainId | null> = defer(
    () => this.applicationContext.wallet.data.chainId$
  )
  readonly connectedWalletAddress$: Observable<Address | null> = defer(
    () => this.applicationContext.wallet.data.activeAddress$
  )
  readonly tokenListFlatView$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
  readonly searchToken$: BehaviorSubject<string> = new BehaviorSubject<string>('')
  readonly changeFavoriteTokenState$: Subject<[ChainId, Address]> = new Subject()
  readonly searchInProgress$: Subject<boolean> = new BehaviorSubject(false)
  readonly openCrossChainView$ = new BehaviorSubject<[string, boolean]>(['', false])
  readonly chainFilter$ = new BehaviorSubject<ChainId[]>([])
  readonly sourceToken$ = defer(() => this.swapContext.getTokenByType('source'))
  readonly destinationToken$ = defer(() => this.swapContext.getTokenByType('destination'))

  readonly chainListView$ = combineLatest([this.chainFilter$, this.sourceToken$]).pipe(
    map(([chainFilter, sourceToken]) => {
      if (this.tokenType === 'destination' && sourceToken && !sourceToken.isSupportCrossChain) {
        return [sourceToken.chainId]
      }
      return chainFilter
    })
  )

  readonly isSupportCrossChain$ = this.sourceToken$.pipe(
    map((sourceToken) => {
      if (this.tokenType === 'source') return true
      return !(sourceToken && !sourceToken.isSupportCrossChain)
    })
  )

  constructor(
    private readonly tokenType: TokenType,
    private readonly applicationContext: IApplicationContext,
    private readonly swapContext: ISwapContext
  ) {
    const chainFilter =
      this.applicationContext.storage.get<ChainId[]>(
        'inch-select-token_chain-filter',
        JsonParser
      ) ?? getChainIdList()
    const tokenListFlatView =
      this.applicationContext.storage.get<boolean>('inch-select-token_flat-list', JsonParser) ??
      false
    this.chainFilter$.next(chainFilter)
    this.tokenListFlatView$.next(tokenListFlatView)
  }

  tokenListFlatViewToggle(): void {
    this.tokenListFlatView$.next(!this.tokenListFlatView$.value)
    this.applicationContext.storage.set(
      'inch-select-token_flat-list',
      this.tokenListFlatView$.value
    )
  }

  setSearchState(state: boolean): void {
    this.searchInProgress$.next(state)
  }

  setSearchToken(state: string): void {
    this.searchToken$.next(state)
  }

  getSearchTokenValue() {
    return this.searchToken$.value
  }

  onSelectToken(token: IToken) {
    this.swapContext.setToken(this.tokenType, token)
  }

  onChangeChainFilter(chainIdList: ChainId[]): void {
    this.chainFilter$.next(chainIdList)
    this.applicationContext.storage.set('inch-select-token_chain-filter', chainIdList)
  }

  getOpenCrossChainView() {
    return this.openCrossChainView$.value
  }

  onOpenCrossChainView(symbol: string, openMore: boolean) {
    this.openCrossChainView$.next([symbol, openMore])
  }
}
