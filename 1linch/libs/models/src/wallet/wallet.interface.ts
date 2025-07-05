import { Observable } from 'rxjs'
import type {
  Address,
  SendTransactionParameters,
  SendTransactionReturnType,
  SignTypedDataParameters,
  SignTypedDataReturnType,
  WriteContractParameters,
  WriteContractReturnType,
} from 'viem'
import { InitializingEntity } from '../base'
import { ChainId } from '../chain'
import { IDataAdapter, IGlobalDataAdapter } from './data-adapter'
import { EIP6963ProviderInfo } from './provider'
import { IWalletAdapter } from './wallet-adapter'

export interface IWallet extends InitializingEntity {
  readonly data: IDataAdapter & IGlobalDataAdapter
  readonly isConnected: boolean
  readonly connectedWalletInfo: EIP6963ProviderInfo | null
  readonly supportedWallets$: Observable<EIP6963ProviderInfo[]>
  getSupportedWallets(): Promise<EIP6963ProviderInfo[]>
  connect(info: EIP6963ProviderInfo, opts?: unknown): Promise<boolean>
  addConnection(info: EIP6963ProviderInfo, opts?: unknown): Promise<boolean>
  disconnect(info?: EIP6963ProviderInfo | null, address?: Address | null): Promise<boolean>
  changeChain(chainId: ChainId): Promise<boolean>
  getDataAdapter(info: EIP6963ProviderInfo): IDataAdapter
  setActiveAddress(info: EIP6963ProviderInfo, address: Address): Promise<void>
  writeContract(params: WriteContractParameters): Promise<WriteContractReturnType>
  sendTransaction(params: SendTransactionParameters): Promise<SendTransactionReturnType>
  signTypedData(typeData: SignTypedDataParameters): Promise<SignTypedDataReturnType>
  connectionUriLink(): Observable<string | null>
  isSupportConnectionUriLink(info: EIP6963ProviderInfo): Promise<boolean>
}

export interface IWalletInternal {
  readonly currentActiveAdapter: IWalletAdapter | null
  readonly activeAdapters: Map<string, IWalletAdapter>
  readonly update$: Observable<void>
}
