import { type Observable } from 'rxjs'
import { type Address } from 'viem'
import { ChainId } from '../chain'
import { IToken } from '../token'

export interface ISelectTokenContext {
  readonly chainId$: Observable<ChainId | null>
  readonly connectedWalletAddress$: Observable<Address | null>
  readonly tokenListFlatView$: Observable<boolean>
  readonly searchToken$: Observable<string>
  readonly changeFavoriteTokenState$: Observable<[ChainId, Address]> // token info
  readonly searchInProgress$: Observable<boolean>
  readonly openCrossChainView$: Observable<[string, boolean]>
  readonly chainFilter$: Observable<ChainId[]>
  readonly chainListView$: Observable<ChainId[]>
  readonly isSupportCrossChain$: Observable<boolean>
  readonly sourceToken$: Observable<IToken | null>
  readonly destinationToken$: Observable<IToken | null>
  tokenListFlatViewToggle(): void
  setSearchState(state: boolean): void
  setSearchToken(state: string): void
  getSearchTokenValue(): string
  getOpenCrossChainView(): [string, boolean]
  onOpenCrossChainView(symbol: string, openMore: boolean): void
  onSelectToken(token: IToken): void
  onChangeChainFilter(chainIdList: ChainId[]): void
}
