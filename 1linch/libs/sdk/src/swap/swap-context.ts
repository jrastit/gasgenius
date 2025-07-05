import { CacheActivePromise } from '@1inch-community/core/decorators'
import { BigFloat } from '@1inch-community/core/math'
import {
  IAmountDataSource,
  IBigFloat,
  IOnChain,
  IOrderRepository,
  ISwapContext,
  ISwapContextStrategy,
  ISwapContextStrategyDataSnapshot,
  IToken,
  IWallet,
  NullableValue,
  Pair,
  ResolverActions,
  SwapOrderStatus,
  SwapSettings,
  SwapSnapshot,
  TokenType,
} from '@1inch-community/models'
import {
  asyncScheduler,
  BehaviorSubject,
  debounceTime,
  defer,
  distinctUntilChanged,
  firstValueFrom,
  map,
  merge,
  Observable,
  shareReplay,
  startWith,
  Subject,
  subscribeOn,
  Subscription,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs'
import { Hash } from 'viem'
import { isTokensEqual } from '../tokens'
import { PairHolder } from './pair-holder'

export class SwapContext implements ISwapContext {
  private readonly subscription = new Subscription()

  readonly loading$ = new BehaviorSubject(false)

  readonly walletChainId$ = defer(() => this.wallet.data.chainId$).pipe(distinctUntilChanged())
  readonly connectedWalletAddress$ = defer(() => this.wallet.data.activeAddress$).pipe(
    distinctUntilChanged()
  )

  private readonly updateData$ = new Subject<void>()
  private readonly updateDataComplete$ = new Subject<void>()

  private readonly dataUpdateEmitter$: Observable<void> = merge(
    this.onChain.crossChainEmitter.pipe(debounceTime(1000)),
    this.connectedWalletAddress$,
    defer(() => this.pairHolder.streamSnapshot('source')),
    defer(() => this.pairHolder.streamSnapshot('destination')).pipe(
      map((snapshot) => snapshot.token),
      distinctUntilChanged(isTokensEqual)
    ),
    this.updateData$
  ).pipe(
    map(() => void 0),
    startWith(void 0),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  readonly dataSnapshot$: Observable<ISwapContextStrategyDataSnapshot | null> =
    this.dataUpdateEmitter$.pipe(
      withLatestFrom(this.connectedWalletAddress$),
      switchMap(() => {
        this.loading$.next(true)
        return this.getDataSnapshot()
      }),
      tap(() => {
        this.loading$.next(false)
        this.updateDataComplete$.next()
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    )

  readonly destinationTokenAmount$ = this.dataSnapshot$.pipe(
    map((snapshot) => snapshot?.destinationTokenAmount ?? BigFloat.zero())
  )

  constructor(
    private readonly wallet: IWallet,
    private readonly onChain: IOnChain,
    private readonly settings: SwapSettings,
    private readonly pairHolder: PairHolder,
    private readonly amountDataSource: IAmountDataSource,
    private readonly strategies: Map<string, ISwapContextStrategy<unknown>>,
    private readonly orderRepository: IOrderRepository
  ) {}

  init() {
    this.subscription.add(
      merge(
        this.destinationTokenAmount$.pipe(
          distinctUntilChanged(),
          tap((amount) => {
            this.setTokenAmountByType('destination', amount)
          }),
          subscribeOn(asyncScheduler)
        )
      ).subscribe()
    )
  }

  getSettingsController<V extends keyof SwapSettings>(name: V): SwapSettings[V] {
    const controller = this.settings[name]
    if (!controller) throw new Error('')
    return controller
  }

  destroy() {
    this.subscription.unsubscribe()
  }

  setPair(pair: NullableValue<Pair>): void {
    this.pairHolder.setPair(pair)
  }

  setToken(tokenType: TokenType, token: IToken) {
    this.pairHolder.setToken(token, tokenType)
  }

  switchPair() {
    this.pairHolder.switchPair()
  }

  async getSnapshot(finalize?: boolean): Promise<SwapSnapshot> {
    this.updateData$.next()
    await firstValueFrom(this.updateDataComplete$)
    const swapSnapshot = await (finalize
      ? this.getDataSnapshot(finalize)
      : firstValueFrom(this.dataSnapshot$))

    return swapSnapshot as SwapSnapshot
  }

  async swap(swapSnapshot: SwapSnapshot): Promise<Hash> {
    const strategy = this.strategies.get(swapSnapshot.strategyName)

    if (!strategy) {
      throw new Error('Strategy not supported')
    }

    return await strategy.swap(swapSnapshot)
  }

  async prepareSwap(swapSnapshot: SwapSnapshot): Promise<ResolverActions> {
    const strategy = this.strategies.get(swapSnapshot.strategyName)

    if (!strategy) {
      throw new Error('Strategy not supported')
    }

    return await strategy.prepareSwap(swapSnapshot)
  }

  async getMaxAmount(): Promise<IBigFloat> {
    return this.amountDataSource.getMaxAmount()
  }

  async setMaxAmount() {
    const amount = await this.getMaxAmount()
    this.setTokenAmountByType('source', amount)
  }

  getTokenByType(type: TokenType): Observable<IToken | null> {
    return this.pairHolder.streamSnapshot(type).pipe(
      map((snapshot) => snapshot.token),
      distinctUntilChanged()
    )
  }

  getTokenAmountByType(type: TokenType): Observable<IBigFloat | null> {
    return this.pairHolder.streamSnapshot(type).pipe(
      map((snapshot) => {
        return snapshot.amount
      }),
      distinctUntilChanged()
    )
  }

  getTokenRawAmountByType(type: TokenType): Observable<IBigFloat | null> {
    return this.pairHolder.streamSnapshot(type).pipe(
      map((snapshot) => snapshot.amount),
      distinctUntilChanged()
    )
  }

  setTokenAmountByType(type: TokenType, value: IBigFloat): void {
    this.pairHolder.setAmount(type, value)
  }

  async getOrderStatus(orderHash: Hash): Promise<SwapOrderStatus> {
    const strategy = await this.getStrategyByOrderHash(orderHash)

    return strategy.getOrderStatus(orderHash)
  }

  async cancelOrder(orderHash: Hash): Promise<Hash | null> {
    const strategy = await this.getStrategyByOrderHash(orderHash)

    return strategy.cancelOrder(orderHash)
  }

  private async getStrategyByOrderHash(orderHash: Hash): Promise<ISwapContextStrategy<unknown>> {
    const orderData = await this.orderRepository.getOrder(orderHash)

    if (!orderData) {
      throw new Error('Order not found')
    }

    const strategy = this.strategies.get(orderData.strategyName)

    if (!strategy) {
      throw new Error('Strategy not supported')
    }

    return strategy
  }

  @CacheActivePromise()
  private async getDataSnapshot(
    finalize?: boolean
  ): Promise<ISwapContextStrategyDataSnapshot | null> {
    const { token: source, amount } = this.pairHolder.getSnapshot(
      'source',
      /* convert native to wrapped */ true
    )
    const { token: destination } = this.pairHolder.getSnapshot('destination')
    const walletAddress = await this.wallet.data.getActiveAddress()

    if (!source || !destination || !amount) {
      return null
    }

    for (const strategy of this.strategies.values()) {
      try {
        return await strategy.getDataSnapshot(
          { source, destination },
          amount,
          walletAddress,
          finalize
        )
      } catch {
        /* ignore */
      }
    }

    return null
  }
}
