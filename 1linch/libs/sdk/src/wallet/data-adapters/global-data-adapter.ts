import { lazyAppContext } from '@1inch-community/core/lazy'
import {
  ChainId,
  EIP6963ProviderInfo,
  IApplicationContext,
  IDataAdapter,
  IGlobalDataAdapter,
  IWalletAdapter,
  IWalletInternal,
} from '@1inch-community/models'
import {
  asapScheduler,
  combineLatest,
  defaultIfEmpty,
  defer,
  distinctUntilChanged,
  filter,
  firstValueFrom,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  subscribeOn,
  switchMap,
  takeUntil,
  tap,
  timer,
} from 'rxjs'
import { Address, isAddressEqual, ProviderRpcError } from 'viem'
import { adapterId } from '../adapter-id'
import { setActiveAddress } from '../storage'

export class GlobalDataAdapter implements IDataAdapter, IGlobalDataAdapter {
  private readonly context = lazyAppContext('GlobalDataAdapter')

  private readonly currentActiveAdapter$ = defer(() => this.dataProvider.update$).pipe(
    startWith(null),
    map(() => this.dataProvider.currentActiveAdapter),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  private readonly currentActiveAdapterData$: Observable<IWalletAdapter['data'] | null> =
    this.currentActiveAdapter$.pipe(
      map((adapter) => adapter?.data ?? null),
      shareReplay({ bufferSize: 1, refCount: true })
    )

  readonly info$ = this.currentActiveAdapterData$.pipe(
    filter(Boolean),
    switchMap((data) => data.info$)
  )

  readonly addresses$: Observable<Address[]> = this.currentActiveAdapterData$.pipe(
    switchMap((data) => data?.addresses$ ?? of([])),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  readonly activeAddress$: Observable<Address | null> = this.currentActiveAdapterData$.pipe(
    switchMap((data) => data?.activeAddress$ ?? of(null)),
    tap((address) => address && setActiveAddress(this.context.value.storage, address)),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  readonly chainId$: Observable<ChainId | null> = this.currentActiveAdapterData$.pipe(
    switchMap((data) => data?.chainId$ ?? of(null)),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  readonly disconnect$: Observable<ProviderRpcError> = this.currentActiveAdapterData$.pipe(
    switchMap((data) => data?.disconnect$ ?? of()),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  readonly isConnected$: Observable<boolean> = this.currentActiveAdapterData$.pipe(
    switchMap((data) => data?.isConnected$ ?? of(false)),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  constructor(private readonly dataProvider: IWalletInternal) {
    combineLatest([this.activeAddress$, this.chainId$]).pipe(subscribeOn(asapScheduler)).subscribe()
  }

  async init(context: IApplicationContext) {
    this.context.set(context)
  }

  getInfo() {
    if (!this.dataProvider.currentActiveAdapter) throw new Error('')
    return this.dataProvider.currentActiveAdapter.data.getInfo()
  }

  async getAddresses(): Promise<Address[]> {
    const data = await this.getProviderDataAdapter()
    if (!data) return []
    return await data.getAddresses()
  }

  async getActiveAddress(): Promise<Address | null> {
    if (!this.dataProvider.currentActiveAdapter) {
      return null
    }
    const data = await this.getProviderDataAdapter()
    if (!data) return null
    return await data.getActiveAddress()
  }

  async getWalletChainId(): Promise<ChainId | null> {
    if (!this.dataProvider.currentActiveAdapter) {
      return null
    }
    const data = await this.getProviderDataAdapter()
    if (!data) return null
    return await data.getWalletChainId()
  }

  async isConnected(): Promise<boolean> {
    if (!this.dataProvider.currentActiveAdapter) {
      return false
    }
    const data = await this.getProviderDataAdapter()
    if (!data) return false
    return await data.isConnected()
  }

  async isActiveAddress(info: EIP6963ProviderInfo, address: Address): Promise<boolean> {
    const id = adapterId(info)
    const activeAddress =
      (await this.dataProvider.currentActiveAdapter?.data.getActiveAddress()) ?? null
    const activeAdapterInfo = this.dataProvider.currentActiveAdapter?.data.getInfo() ?? null
    const activeAdapterId = activeAdapterInfo ? adapterId(activeAdapterInfo) : null
    return (
      !!activeAddress &&
      !!activeAdapterId &&
      id === activeAdapterId &&
      isAddressEqual(activeAddress, address)
    )
  }

  isActiveWallet(info: EIP6963ProviderInfo): boolean {
    const id = adapterId(info)
    const activeAdapterInfo = this.dataProvider.currentActiveAdapter?.data.getInfo() ?? null
    const activeAdapterId = activeAdapterInfo ? adapterId(activeAdapterInfo) : null
    return !!activeAdapterId && activeAdapterId === id
  }

  isActiveAddress$(info: EIP6963ProviderInfo, address: `0x${string}`): Observable<boolean> {
    const id = adapterId(info)
    return combineLatest([this.currentActiveAdapter$, this.activeAddress$]).pipe(
      map(([adapter, activeAddress]) => {
        const activeAdapterId = adapter ? adapterId(adapter.data.getInfo()) : null
        return (
          !!activeAddress &&
          !!activeAdapterId &&
          id === activeAdapterId &&
          isAddressEqual(activeAddress, address)
        )
      })
    )
  }

  isActiveWallet$(info: EIP6963ProviderInfo): Observable<boolean> {
    const id = adapterId(info)
    return this.currentActiveAdapter$.pipe(
      map((adapter) => {
        const activeAdapterId = adapter ? adapterId(adapter.data.getInfo()) : null
        return !!activeAdapterId && activeAdapterId === id
      })
    )
  }

  private getProviderDataAdapter() {
    return firstValueFrom(
      this.currentActiveAdapterData$.pipe(takeUntil(timer(0)), defaultIfEmpty(null))
    )
  }
}
