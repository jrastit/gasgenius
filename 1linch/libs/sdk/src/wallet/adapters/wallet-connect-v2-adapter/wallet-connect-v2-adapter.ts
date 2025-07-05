import {
  ChainId,
  EIP6963ProviderDetail,
  IDataAdapter,
  IProviderDataAdapterInternal,
  IWalletAdapter,
} from '@1inch-community/models'
import {
  catchError,
  firstValueFrom,
  Observable,
  of,
  Subject,
  switchMap,
  tap,
  throwError,
  timer,
} from 'rxjs'
import {
  Address,
  Omit,
  SendTransactionParameters,
  SendTransactionReturnType,
  SignTypedDataParameters,
  SignTypedDataReturnType,
  WalletClient,
  WriteContractParameters,
  WriteContractReturnType,
} from 'viem'
import { ProviderDataAdapter } from '../../data-adapters/provider-data-adapter'
import { createClientAndSyncChain } from '../create-client-and-sync-chain'
import { MultiConnectProvider } from './multi-connect-provider'

export class WalletConnectV2Adapter implements IWalletAdapter {
  readonly data: IDataAdapter & IProviderDataAdapterInternal

  private provider: MultiConnectProvider | null = null

  private readonly connectionUriLink$ = new Subject<string>()

  client: WalletClient | null = null

  get info() {
    return this.providerDetail.info
  }

  constructor(private readonly providerDetail: Omit<EIP6963ProviderDetail, 'provider'>) {
    this.data = new ProviderDataAdapter(this.providerDetail.info)
  }

  async isConnected(): Promise<boolean> {
    return this.provider?.isConnected() ?? false
  }

  private async createProvider(): Promise<MultiConnectProvider> {
    const provider = new (await import('./multi-connect-provider')).MultiConnectProvider()

    provider.connectionUriLink$
      .pipe(
        tap((uri) => this.connectionUriLink$.next(uri)),
        catchError(() => of(null))
      )
      .subscribe()

    return provider
  }

  async connect(chainId: ChainId, opts?: unknown): Promise<boolean> {
    if (!this.provider) {
      const provider = await this.createProvider()
      await provider.connect(opts)

      this.client = await createClientAndSyncChain(chainId, provider)
      this.data.setProvider(provider)
      this.provider = provider
    } else {
      await this.provider.connect(opts)
    }
    return true
  }

  async restoreConnect(): Promise<boolean> {
    if (!this.provider) {
      const provider = await this.createProvider()
      await provider.restoreConnect()

      this.client = await createClientAndSyncChain(provider.chainId, provider)
      this.data.setProvider(provider)
      this.provider = provider
    } else {
      await this.provider.restoreConnect()
    }
    return true
  }

  async disconnect(address?: Address | null): Promise<boolean> {
    await this.provider?.disconnect(address)
    return true
  }

  async changeChain(chainId: ChainId): Promise<boolean> {
    await this.client?.switchChain({ id: chainId })
    return true
  }

  setActiveAddress(address: Address | null): void {
    this.provider?.setActiveAddress(address)
  }

  async writeContract(params: WriteContractParameters): Promise<WriteContractReturnType> {
    if (!(await this.isConnected()) || !this.client) {
      throw new Error('Wallet not connected')
    }
    const address = (await this.data.getActiveAddress())!
    return await Promise.any([
      this.client.writeContract({
        ...params,
        account: address,
      }),
      firstValueFrom(
        timer(60 * 1000 * 3).pipe(
          // 3 min
          switchMap(() => throwError(() => new Error('wallet connect request timed out')))
        )
      ),
    ])
  }

  async sendTransaction(params: SendTransactionParameters): Promise<SendTransactionReturnType> {
    if (!(await this.isConnected()) || !this.client) {
      throw new Error('Wallet not connected')
    }
    const address = (await this.data.getActiveAddress())!
    return await Promise.any([
      this.client.sendTransaction({
        ...params,
        account: address,
      }),
      firstValueFrom(
        timer(60 * 1000 * 3).pipe(
          // 3 min
          switchMap(() => throwError(() => new Error('wallet connect request timed out')))
        )
      ),
    ])
  }

  async signTypedData(typeData: SignTypedDataParameters): Promise<SignTypedDataReturnType> {
    if (!(await this.isConnected()) || !this.client) {
      throw new Error('Wallet not connected')
    }
    const address = (await this.data.getActiveAddress())!
    return await Promise.race([
      this.client.signTypedData({
        ...typeData,
        account: address,
      }),
      firstValueFrom(
        timer(60 * 1000 * 3).pipe(
          // 3 min
          switchMap(() => throwError(() => new Error('wallet connect request timed out')))
        )
      ),
    ])
  }

  connectionUriLink(): Observable<string | null> {
    return this.connectionUriLink$.asObservable()
  }

  async isSupportConnectionUriLink(): Promise<boolean> {
    return true
  }
}
