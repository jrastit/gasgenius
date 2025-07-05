import { Observable } from 'rxjs'
import type {
  Address,
  SendTransactionParameters,
  SendTransactionReturnType,
  SignTypedDataParameters,
  SignTypedDataReturnType,
  WalletClient,
  WriteContractParameters,
  WriteContractReturnType,
} from 'viem'
import { ChainId } from '../chain'
import { IDataAdapter, IProviderDataAdapterInternal } from './data-adapter'
import { EIP6963ProviderInfo } from './provider'

export interface IWalletAdapter {
  readonly data: IDataAdapter & IProviderDataAdapterInternal
  readonly client: WalletClient | null
  readonly info: EIP6963ProviderInfo
  isConnected(): Promise<boolean>
  connect(chainId: ChainId, opts?: unknown): Promise<boolean>
  restoreConnect(chainId: ChainId, force: boolean): Promise<boolean>
  disconnect(address?: Address | null): Promise<boolean>
  changeChain(chainId: ChainId): Promise<boolean>
  setActiveAddress(address: Address | null): void
  writeContract(params: WriteContractParameters): Promise<WriteContractReturnType>
  sendTransaction(params: SendTransactionParameters): Promise<SendTransactionReturnType>
  signTypedData(typeData: SignTypedDataParameters): Promise<SignTypedDataReturnType>
  connectionUriLink(): Observable<string | null>
  isSupportConnectionUriLink(): Promise<boolean>
}
