import { JsonParser } from '@1inch-community/core/storage'
import {
  ChainId,
  EIP6963ProviderInfo,
  IBigFloat,
  IPersistSyncStorage,
  ITokenStorage,
  IWallet,
  IWalletAccountContext,
} from '@1inch-community/models'
import { getChainIdList, getWalletExplorerUrl } from '@1inch-community/sdk/chain'
import { BehaviorSubject, defer, distinctUntilChanged, filter, Observable, switchMap } from 'rxjs'
import type { Address } from 'viem'

export class WalletAccountContext implements IWalletAccountContext {
  readonly connectedWalletInfo$: Observable<EIP6963ProviderInfo | null> = defer(
    () => this.wallet.data.info$
  )
  readonly connectedWalletAddress$: Observable<Address | null> = defer(
    () => this.wallet.data.activeAddress$
  )
  readonly chainId$: Observable<ChainId | null> = defer(() => this.wallet.data.chainId$)

  readonly walletBalance$: Observable<IBigFloat> = this.connectedWalletAddress$.pipe(
    distinctUntilChanged(),
    filter((address) => address !== null),
    switchMap((address) =>
      this.tokenStorage.getCrossChainTotalFiatBalance({ walletAddress: address, chainIds: null })
    )
  )

  readonly chainFilter$ = new BehaviorSubject<ChainId[]>([])

  constructor(
    private readonly wallet: IWallet,
    private readonly tokenStorage: ITokenStorage,
    private readonly persistSyncStorage: IPersistSyncStorage
  ) {
    const chainFilter =
      persistSyncStorage.get<ChainId[]>('inch-select-token_chain-filter', JsonParser) ??
      getChainIdList()
    this.chainFilter$.next(chainFilter)
  }

  copyAddress(walletAddress: Address): void {
    navigator.clipboard.writeText(walletAddress.toString()).catch((e) => console.warn(e))
  }

  openExplorer(chainId: ChainId, walletAddress: Address): void {
    const url = getWalletExplorerUrl(chainId, walletAddress)

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  onChangeChainFilter(chainIdList: ChainId[]): void {
    this.chainFilter$.next(chainIdList)
    this.persistSyncStorage.set('inch-select-token_chain-filter', chainIdList)
  }
}
