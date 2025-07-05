import { Observable } from 'rxjs'
import { Address } from 'viem'
import { IBigFloat } from '../big-float'
import { ChainId } from '../chain'
import type { EIP6963ProviderInfo } from '../wallet'

export interface IWalletAccountContext {
  readonly connectedWalletInfo$: Observable<EIP6963ProviderInfo | null>
  readonly connectedWalletAddress$: Observable<Address | null>
  readonly walletBalance$: Observable<IBigFloat>
  readonly chainId$: Observable<ChainId | null>
  readonly chainFilter$: Observable<ChainId[]>

  copyAddress(walletAddress: Address): void
  openExplorer(chainId: ChainId, walletAddress: Address): void
  onChangeChainFilter(value: ChainId[]): void
}
