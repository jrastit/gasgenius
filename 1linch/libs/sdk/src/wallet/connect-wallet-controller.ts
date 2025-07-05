import { lazyAppContext } from '@1inch-community/core/lazy'
import { objectsEqual } from '@1inch-community/core/utils'
import {
  ChainId,
  EIP6963ProviderDetail,
  EIP6963ProviderInfo,
  IApplicationContext,
  IDataAdapter,
  IWallet,
  IWalletAdapter,
  IWalletInternal,
} from '@1inch-community/models'
import {
  BehaviorSubject,
  debounceTime,
  defaultIfEmpty,
  first,
  fromEvent,
  Observable,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
  timer,
} from 'rxjs'
import type {
  Address,
  SendTransactionParameters,
  SendTransactionReturnType,
  SignTypedDataParameters,
  WriteContractParameters,
  WriteContractReturnType,
} from 'viem'
import { adapterId } from './adapter-id'
import { UniversalBrowserExtensionAdapter } from './adapters/universal-browser-extension-adapter'
import {
  getWalletConnectProviderDetail,
  WalletConnectV2Adapter,
} from './adapters/wallet-connect-v2-adapter'
import { GlobalDataAdapter } from './data-adapters/global-data-adapter'
import { getInjectedProviderDetail, getInjectedProviderSupported } from './injected-provider-detail'
import {
  addConnectedWallet,
  getActiveAddress,
  getActiveWallet,
  getConnectedWallet,
  removeConnectedWallet,
  setActiveWallet,
} from './storage'

export class WalletController implements IWallet, IWalletInternal {
  private readonly context = lazyAppContext('WalletController')

  readonly data = new GlobalDataAdapter(this)

  readonly activeAdapters = new Map<string, IWalletAdapter>()
  readonly update$ = new Subject<void>()
  readonly supportedWallets$ = new BehaviorSubject<EIP6963ProviderInfo[]>([])

  private readonly connectionUriLink$ = new Subject<string | null>()
  private currentActiveAdapterId: string | null = null
  private readonly adapters = new Map<string, IWalletAdapter>()

  get isConnected(): boolean {
    return this.currentActiveAdapter !== null
  }

  get connectedWalletInfo() {
    return this.currentActiveAdapter?.info ?? null
  }

  get currentActiveAdapter(): IWalletAdapter | null {
    if (!this.currentActiveAdapterId) return null
    return this.activeAdapters.get(this.currentActiveAdapterId) ?? null
  }

  async init(context: IApplicationContext): Promise<void> {
    this.context.set(context)
    // todo: use Promise.all for app start speed up
    await this.data.init(context)
    await this.detectEIP6963Wallets()
    await this.restoreWalletConnection()
    this.update$.pipe(tap(() => this.updateSupportWallets())).subscribe()

    this.update$.next()
  }

  async getSupportedWallets() {
    return this.supportedWallets$.value
  }

  async connect(info: EIP6963ProviderInfo, opts?: unknown) {
    const id = adapterId(info)
    if (!this.adapters.has(id)) {
      throw new Error(`Invalid wallet info ${info.name} not exist`)
    }
    const adapter = this.adapters.get(id)!
    const chainId = await adapter.data.getWalletChainId()
    const connectState = await this.connectSafe(chainId ?? ChainId.eth, id, opts)
    this.afterConnectWallet(connectState, id)
    this.update$.next()
    return connectState
  }

  async addConnection(info: EIP6963ProviderInfo, opts?: unknown): Promise<boolean> {
    const id = adapterId(info)
    if (!this.adapters.has(id)) {
      throw new Error(`Invalid wallet info ${info.name} not exist`)
    }
    const adapter: IWalletAdapter = this.adapters.get(id)!
    if (!this.activeAdapters.has(id)) {
      throw new Error(`Wallet adapter ${info.name} not connected`)
    }
    const chainId = await adapter.data.getWalletChainId()
    let connectState: boolean
    try {
      connectState = await this.adapterConnect(adapter, chainId ?? ChainId.eth, opts)
    } catch {
      connectState = false
    }

    this.update$.next()
    return connectState
  }

  private async disconnectAllWallets(): Promise<boolean> {
    if (this.currentActiveAdapterId) {
      removeConnectedWallet(this.context.value.storage, this.currentActiveAdapterId)
    }

    for (const [id, adapter] of this.adapters) {
      const isWalletConnect = adapter.info.uuid === 'walletConnect'
      await adapter.disconnect()

      if (!isWalletConnect) {
        this.activeAdapters.delete(id)
      }
    }

    setActiveWallet(this.context.value.storage, null)
    this.currentActiveAdapterId = null
    this.update$.next()

    return true
  }

  async disconnect(info?: EIP6963ProviderInfo | null, address?: Address | null): Promise<boolean> {
    if (!info) {
      return await this.disconnectAllWallets()
    }
    const id = adapterId(info)
    const adapter = this.adapters.get(id)

    if (!adapter) return true

    try {
      const isWalletConnect = adapter.info.uuid === 'walletConnect'
      const state = await adapter.disconnect(address)
      const addresses = await adapter.data.getAddresses()
      const hasConnectedAddresses = addresses.length > 0

      if (this.currentActiveAdapterId) {
        if (!hasConnectedAddresses) {
          removeConnectedWallet(this.context.value.storage, this.currentActiveAdapterId)
          setActiveWallet(this.context.value.storage, null)
        }

        if (!isWalletConnect) {
          this.activeAdapters.delete(this.currentActiveAdapterId)
          this.currentActiveAdapterId = null
        }

        await this.restoreWalletConnection()
      }

      this.update$.next()
      return state
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async changeChain(chainId: ChainId): Promise<boolean> {
    const adapter = this.currentActiveAdapter
    if (adapter === null) return false
    return await adapter.changeChain(chainId)
  }

  getDataAdapter(info: EIP6963ProviderInfo): IDataAdapter {
    const id = adapterId(info)
    const adapter: IWalletAdapter | undefined = this.adapters.get(id)
    if (!adapter) {
      throw new Error(`Invalid wallet info ${info.name} not exist`)
    }
    return adapter.data
  }

  async setActiveAddress(info: EIP6963ProviderInfo, address: Address) {
    const id = adapterId(info)
    return await this.setActiveAddressInner(id, address)
  }

  async writeContract(params: WriteContractParameters): Promise<WriteContractReturnType> {
    if (!this.currentActiveAdapter || !this.currentActiveAdapter.client) {
      throw new Error('Wallet not connected')
    }
    return await this.currentActiveAdapter.writeContract(params)
  }

  async sendTransaction(params: SendTransactionParameters): Promise<SendTransactionReturnType> {
    if (!this.currentActiveAdapter || !this.currentActiveAdapter.client) {
      throw new Error('Wallet not connected')
    }
    return await this.currentActiveAdapter.sendTransaction(params)
  }

  async signTypedData(typeData: SignTypedDataParameters) {
    if (!this.currentActiveAdapter || !this.currentActiveAdapter.client) {
      throw new Error('Wallet not connected')
    }
    return await this.currentActiveAdapter.signTypedData(typeData)
  }

  public connectionUriLink(): Observable<string | null> {
    return this.connectionUriLink$.asObservable()
  }

  public async isSupportConnectionUriLink(info: EIP6963ProviderInfo): Promise<boolean> {
    const id = adapterId(info)
    const support = await this.adapters.get(id)?.isSupportConnectionUriLink()

    return support ?? false
  }

  private async setActiveAddressInner(id: string, address: Address) {
    let state = true
    if (this.currentActiveAdapterId !== id) {
      if (!this.adapters.has(id)) {
        throw new Error(`Invalid wallet not exist`)
      }
      const adapter = this.adapters.get(id)!
      const chainId = await adapter.data.getWalletChainId()
      state = await this.connectSafe(chainId ?? ChainId.eth, id)
      this.afterConnectWallet(state, id)
    }
    if (state) {
      this.currentActiveAdapter?.setActiveAddress(address)
    }
    this.update$.next()
  }

  private async connectSafe(
    chainId: ChainId,
    walletId: string,
    opts?: unknown,
    retry = false
  ): Promise<boolean> {
    const adapter: IWalletAdapter | undefined = this.adapters.get(walletId)
    if (!adapter) {
      throw new Error(`Invalid wallet id`)
    }
    let connectState: boolean
    if (!this.activeAdapters.has(walletId) || retry) {
      try {
        connectState = await this.adapterConnect(adapter, chainId, opts)
      } catch {
        connectState = false
      }
      connectState && this.activeAdapters.set(walletId, adapter)
    } else {
      connectState = await adapter.isConnected()
      if (!retry && !connectState) {
        connectState = await this.connectSafe(chainId, walletId, opts, true)
      }
    }
    return connectState
  }

  private async adapterConnect(
    adapter: IWalletAdapter,
    chainId: ChainId,
    opts?: unknown
  ): Promise<boolean> {
    adapter
      .connectionUriLink()
      .pipe(
        first(),
        tap((uri) => this.connectionUriLink$.next(uri))
      )
      .subscribe()

    return await adapter.connect(chainId, opts)
  }

  private async restoreConnectSafe(walletId: string, force: boolean): Promise<boolean> {
    const adapter: IWalletAdapter | undefined = this.adapters.get(walletId)
    if (!adapter) {
      throw new Error(`Invalid wallet id`)
    }
    let connectState: boolean
    if (!this.activeAdapters.has(walletId)) {
      try {
        const chainId = await adapter.data.getWalletChainId()
        connectState = await adapter.restoreConnect(chainId ?? ChainId.eth, force)
      } catch {
        connectState = false
      }
      connectState && this.activeAdapters.set(walletId, adapter)
    } else {
      connectState = await adapter.isConnected()
    }
    return connectState
  }

  private async restoreWalletConnection() {
    const activeWalletId = getActiveWallet(this.context.value.storage)
    const connectedWallet: string[] | null = getConnectedWallet(this.context.value.storage)
    if (!connectedWallet) return
    await this.restoreWalletConnectionNotActiveWallet(activeWalletId, connectedWallet)
    await this.restoreWalletConnectionActiveWallet(activeWalletId)
  }

  private async restoreWalletConnectionNotActiveWallet(
    activeWalletId: string | null,
    connectedWallet: string[]
  ) {
    for (const id of connectedWallet) {
      if (id === activeWalletId) continue
      if (!this.adapters.has(id)) continue
      const connectState = await this.restoreConnectSafe(id, false).catch(() => false)
      this.afterConnectWallet(connectState, id)
    }
  }

  private async restoreWalletConnectionActiveWallet(activeWalletId: string | null) {
    if (!activeWalletId || !this.adapters.has(activeWalletId)) return
    const connectState = await this.restoreConnectSafe(activeWalletId, true)
    this.afterConnectWallet(connectState, activeWalletId)
    if (!connectState) return
    const activeAddressFromStore = getActiveAddress(this.context.value.storage)
    if (!activeAddressFromStore || !this.currentActiveAdapter) return
    const addresses = await this.currentActiveAdapter.data.getAddresses()
    if (!addresses.includes(activeAddressFromStore)) return
    await this.setActiveAddressInner(activeWalletId, activeAddressFromStore)
  }

  private detectEIP6963Wallets() {
    return new Promise<void>((resolve) => {
      let skipInjectedProvider = false
      fromEvent<CustomEvent<EIP6963ProviderDetail>>(window, 'eip6963:announceProvider')
        .pipe(
          tap((event) => {
            skipInjectedProvider =
              objectsEqual(window.ethereum, event.detail.provider) || skipInjectedProvider
            const id = adapterId(event.detail.info)
            if (!this.adapters.has(id)) {
              this.adapters.set(id, new UniversalBrowserExtensionAdapter(event.detail))
            }
          }),
          debounceTime(100),
          take(1),
          takeUntil(timer(200)),
          defaultIfEmpty(null),
          switchMap(async () => {
            if (!skipInjectedProvider && getInjectedProviderSupported()) {
              const injectedProviderDetail = await getInjectedProviderDetail()
              const id = adapterId(injectedProviderDetail.info)
              if (!this.adapters.has(id)) {
                this.adapters.set(id, new UniversalBrowserExtensionAdapter(injectedProviderDetail))
              }
            }
            const wc = await getWalletConnectProviderDetail()
            const wcId = adapterId(wc.info)
            this.adapters.set(wcId, new WalletConnectV2Adapter(wc))
            resolve()
          })
        )
        .subscribe()
      window.dispatchEvent(new Event('eip6963:requestProvider'))
    })
  }

  private afterConnectWallet(connectState: boolean, id: string) {
    if (connectState) {
      this.currentActiveAdapterId = id
      addConnectedWallet(this.context.value.storage, id)
      setActiveWallet(this.context.value.storage, id)
    } else {
      removeConnectedWallet(this.context.value.storage, id)
      const currentActiveWalletIdFromStore = getActiveWallet(this.context.value.storage)
      if (currentActiveWalletIdFromStore === id) {
        setActiveWallet(this.context.value.storage, null)
      }
      if (this.currentActiveAdapterId === id) {
        this.currentActiveAdapterId = null
      }
      if (this.activeAdapters.has(id)) {
        const adapter = this.adapters.get(id)!
        adapter.disconnect().catch()
        this.activeAdapters.delete(id)
      }
    }
  }

  private updateSupportWallets() {
    const info: EIP6963ProviderInfo[] = []
    const equal = (a: EIP6963ProviderInfo[], b: EIP6963ProviderInfo[]): boolean => {
      if (a.length !== b.length) return false
      return a.every((val, index) => val.uuid === b[index].uuid)
    }

    this.adapters.forEach((adapter) => info.push(adapter.data.getInfo()))
    const sortedAdapters = info.sort((info1, info2) => {
      const id1 = adapterId(info1)
      const id2 = adapterId(info2)

      if (id1 === this.currentActiveAdapterId && id2 !== this.currentActiveAdapterId) {
        return -1
      }
      if (id1 !== this.currentActiveAdapterId && id2 === this.currentActiveAdapterId) {
        return 1
      }
      if (this.activeAdapters.has(id1) && this.activeAdapters.has(id2)) {
        return 0
      }
      if (this.activeAdapters.has(id1) && !this.activeAdapters.has(id2)) {
        return -1
      }
      if (!this.activeAdapters.has(id1) && this.activeAdapters.has(id2)) {
        return 1
      }

      return 0
    })

    if (!equal(this.supportedWallets$.value, sortedAdapters)) {
      this.supportedWallets$.next(sortedAdapters)
    }
  }
}
