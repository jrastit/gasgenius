import { ChainId, EIP6963ProviderDetail, IWalletAdapter } from '@1inch-community/models'
import { Observable, of } from 'rxjs'
import type {
  Address,
  Hex,
  SendTransactionParameters,
  SendTransactionReturnType,
  SignTypedDataParameters,
  SignTypedDataReturnType,
  WalletClient,
  WriteContractParameters,
  WriteContractReturnType,
} from 'viem'
import { ProviderDataAdapter } from '../data-adapters/provider-data-adapter'
import { isUserRejectError, WalletError } from '../wallet-errors'
import { createClient, createClientAndSyncChain } from './create-client-and-sync-chain'

export class UniversalBrowserExtensionAdapter implements IWalletAdapter {
  readonly data: ProviderDataAdapter

  client: WalletClient | null = null

  get info() {
    return this.providerDetail.info
  }

  constructor(private readonly providerDetail: EIP6963ProviderDetail) {
    this.data = new ProviderDataAdapter(this.providerDetail.info)
  }

  async connect(chainId: ChainId): Promise<boolean> {
    this.client = await createClientAndSyncChain(chainId, this.providerDetail.provider)
    this.data.setProvider(this.providerDetail.provider)
    return true
  }

  async restoreConnect(chainId: ChainId, force?: boolean): Promise<boolean> {
    this.data.setProvider(this.providerDetail.provider)
    const addresses = await this.data.getAddresses()
    const walletChainId = await this.data.getWalletChainId()
    const state = addresses.length > 0
    if (!state) {
      this.data.setProvider(null)
    } else {
      this.client = createClient(chainId, this.providerDetail.provider)
    }
    if (!state && force && walletChainId === null) {
      return this.connect(chainId)
    }
    if (!state && force && walletChainId !== null) {
      this.connect(chainId).catch()
    }
    return state
  }

  async disconnect(): Promise<boolean> {
    this.client = null
    this.data.setProvider(null)
    this.setActiveAddress(null)
    return true
  }

  async changeChain(chainId: ChainId): Promise<boolean> {
    if (!this.client) return false
    await this.client.switchChain({ id: chainId })
    return true
  }

  async isConnected() {
    const addresses = (await this.client?.getAddresses()) ?? []
    return addresses.length > 0
  }

  setActiveAddress(address: Address | null): void {
    this.data.setActiveAddress(address)
  }

  async writeContract(params: WriteContractParameters): Promise<WriteContractReturnType> {
    if (!(await this.isConnected()) || !this.client) {
      throw new Error('Wallet not connected')
    }
    const address = (await this.data.getActiveAddress())!
    return await this.client.writeContract({
      ...params,
      account: address,
    })
  }

  async sendTransaction(params: SendTransactionParameters): Promise<SendTransactionReturnType> {
    if (!(await this.isConnected()) || !this.client) {
      throw new Error('Wallet not connected')
    }
    const address = (await this.data.getActiveAddress())!
    return await this.client.sendTransaction({
      ...params,
      account: address,
    })
  }

  async signTypedData(typeData: SignTypedDataParameters): Promise<SignTypedDataReturnType> {
    if (!(await this.isConnected()) || !this.client) {
      throw new Error('Wallet not connected')
    }
    const address = (await this.data.getActiveAddress())!
    try {
      return await this.client.signTypedData({
        ...typeData,
        account: address,
      })
    } catch (error) {
      if (isUserRejectError(error as WalletError)) {
        throw error
      }
      console.error(error)
    }
    const data = JSON.stringify(typeData, stringifyReplacer)
    return (await this.providerDetail.provider.request({
      method: 'eth_signTypedData_v4',
      params: [address, data],
    })) as Hex
  }

  connectionUriLink(): Observable<string | null> {
    return of(null)
  }

  async isSupportConnectionUriLink(): Promise<boolean> {
    return false
  }
}

function stringifyReplacer(_: string, value: unknown) {
  if (typeof value === 'bigint') {
    return value.toString()
  }

  return value
}
