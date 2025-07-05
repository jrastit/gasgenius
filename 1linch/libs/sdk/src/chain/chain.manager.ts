import { CacheActivePromise } from '@1inch-community/core/decorators'
import { lazyAppContext } from '@1inch-community/core/lazy'
import { BigFloat } from '@1inch-community/core/math'
import { ChainId, IApplicationContext, IBigFloat, IOnChain } from '@1inch-community/models'
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  firstValueFrom,
  from,
  fromEvent,
  map,
  merge,
  Observable,
  of,
  shareReplay,
  startWith,
  switchMap,
  take,
  timer,
} from 'rxjs'
import {
  Address,
  Block,
  BlockTag,
  createPublicClient,
  Hash,
  parseAbi,
  PublicClient,
  Transaction,
  type WriteContractParameters,
} from 'viem'
import { buildTokenId } from '../tokens'
import { averageBlockTime } from './average-block-time'
import { BlockTimeCache } from './block-time-cache'
import { getWrapperNativeTokenAddress } from './contracts'
import { isNativeToken } from './is-native-token'
import { WebFallbackTransportController } from './transport/web-fallback-transport.controller'
import { getChainById } from './viem-chain-map'

interface ClientRecord {
  client: PublicClient
  transportController: WebFallbackTransportController
}

const abi = parseAbi([
  'function allowance(address owner, address spender) public view returns (uint256)',
  'function approve(address _spender, uint256 _value) public returns (bool success)',
  'function deposit() public payable',
])

export class OnChainManager implements IOnChain {
  private readonly context = lazyAppContext('OnChainManager')
  private readonly clientMap = new Map<ChainId, ClientRecord>()
  private readonly blockEmitterMap = new Map<ChainId, Observable<Block>>()
  private readonly chainTickEmitterMap = new Map<ChainId, Observable<void>>()
  private readonly allowanceCache = new BlockTimeCache<string, IBigFloat>()

  get crossChainEmitter() {
    return this.getChainTickEmitter(ChainId.eth)
  }

  async init(context: IApplicationContext): Promise<void> {
    this.context.set(context)
  }

  getBlockEmitter(chainId: ChainId): Observable<Block> {
    if (this.blockEmitterMap.has(chainId)) {
      return this.blockEmitterMap.get(chainId)!
    }
    return this.buildBlockEmitter(chainId)
  }

  getChainTickEmitter(chainId: ChainId): Observable<void> {
    if (this.chainTickEmitterMap.has(chainId)) {
      return this.chainTickEmitterMap.get(chainId)!
    }
    return this.chainTickEmitterEmitter(chainId)
  }

  @CacheActivePromise()
  async getClient(chainId: ChainId): Promise<PublicClient> {
    if (this.clientMap.has(chainId)) {
      return this.clientMap.get(chainId)!.client
    }
    return await this.buildClient(chainId)
  }

  @CacheActivePromise()
  async estimateWrapNativeToken(chainId: ChainId, value: IBigFloat): Promise<IBigFloat> {
    const client = await this.getClient(chainId)
    const address = getWrapperNativeTokenAddress(chainId)
    const result = await client.estimateContractGas({
      abi,
      address,
      value: value.toWei(18),
      functionName: 'deposit',
    })
    return BigFloat.fromBigInt(result, 18)
  }

  @CacheActivePromise()
  async simulateWrapNativeToken(
    chainId: ChainId,
    value: IBigFloat
  ): Promise<WriteContractParameters> {
    const client = await this.getClient(chainId)
    const address = getWrapperNativeTokenAddress(chainId)
    const result = await client.simulateContract({
      abi,
      address,
      value: value.toWei(18),
      functionName: 'deposit',
    })
    return result.request as WriteContractParameters
  }

  @CacheActivePromise()
  async waitTransaction(
    chainId: ChainId,
    hash: Hash,
    blockTag: BlockTag = 'latest'
  ): Promise<Transaction> {
    const client = await this.getClient(chainId)
    const stream = this.getBlockEmitter(chainId).pipe(
      switchMap(async () => {
        try {
          const tx = await client.getTransaction({ hash, blockTag } as any)
          if (tx.blockNumber) {
            return tx
          }
          return null
        } catch {
          return null
        }
      }),
      filter((tx) => tx !== null),
      take(1)
    )
    return firstValueFrom(stream)
  }

  @CacheActivePromise()
  async getAllowance(
    chainId: ChainId,
    tokenAddress: Address,
    owner: Address,
    spender: Address
  ): Promise<BigFloat> {
    if (isNativeToken(tokenAddress)) {
      return BigFloat.uint(256)
    }
    const id = [chainId, tokenAddress, owner, spender].join(':')
    const cachedValue = this.allowanceCache.get(chainId, id)
    if (cachedValue !== null) {
      return cachedValue
    }
    const tokenRecordId = buildTokenId(chainId, tokenAddress)
    const token = await this.context.value.tokenStorage.getTokenById({ tokenRecordId })
    if (!token) return BigFloat.zero()
    const client = await this.getClient(chainId)
    const result = await client.readContract({
      abi,
      functionName: 'allowance',
      args: [owner, spender],
      address: tokenAddress,
    })
    const allowance = BigFloat.fromBigInt(result, token.decimals)
    this.allowanceCache.set(chainId, id, allowance)
    return allowance
  }

  @CacheActivePromise()
  async simulateApprove(
    chainId: ChainId,
    tokenAddress: Address,
    owner: Address,
    spender: Address,
    value: IBigFloat
  ): Promise<WriteContractParameters> {
    if (isNativeToken(tokenAddress)) {
      throw new Error('Native token in not supported approve')
    }
    const tokenRecordId = buildTokenId(chainId, tokenAddress)
    const token = await this.context.value.tokenStorage.getTokenById({ tokenRecordId })
    if (!token) throw new Error('Token not found')
    const client = await this.getClient(chainId)
    const result = await client.simulateContract({
      abi,
      account: owner,
      functionName: 'approve',
      args: [spender, value.toWei(token.decimals)],
      address: tokenAddress,
    })
    return result.request
  }

  private async buildClient(chainId: ChainId): Promise<PublicClient> {
    if (!this.context) throw new Error('No context provided')
    const chain = getChainById(chainId)
    const transportController = new WebFallbackTransportController(chain)
    await transportController.init(this.context.value)
    const client = createPublicClient({ chain, transport: transportController.createTransport() })
    this.clientMap.set(chainId, { client, transportController })
    return client
  }

  private buildBlockEmitter(chainId: ChainId) {
    const updateTime$ = buildUpdateTime(chainId)
    const client$ = from(this.getClient(chainId))
    const block$ = combineLatest([client$, updateTime$]).pipe(
      switchMap(([client, time]) => blockListener(client, time)),
      distinctUntilChanged((b1: Block, b2: Block) => b1.number === b2.number),
      shareReplay({ bufferSize: 1, refCount: true })
    )
    this.blockEmitterMap.set(chainId, block$)
    return block$
  }

  private chainTickEmitterEmitter(chainId: ChainId): Observable<void> {
    const tick$ = buildUpdateTime(chainId).pipe(
      switchMap((time) => {
        if (time === null) return of(void 0)
        return timer(0, time).pipe(map(() => void 0))
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    )
    this.chainTickEmitterMap.set(chainId, tick$)
    return tick$
  }
}

function buildUpdateTime(chainId: ChainId): Observable<number | null> {
  return combineLatest([
    isWindowVisibleAndFocused$().pipe(map((state) => (state ? averageBlockTime[chainId] : null))),
    sleepOnMousemove$().pipe(map((state) => (state ? 30 * 1000 : null))),
  ]).pipe(map(([time1, time2]) => time1 ?? time2))
}

function isWindowVisibleAndFocused$(): Observable<boolean> {
  let isFirst = true
  return merge(
    fromEvent(window, 'focus'),
    fromEvent(window, 'blur'),
    fromEvent(document, 'visibilitychange')
  ).pipe(
    startWith(null),
    map(() => {
      if (isFirst) {
        isFirst = false
        return true
      }
      return isWindowVisibleAndFocused()
    }),
    distinctUntilChanged()
  )
}

function isWindowVisibleAndFocused(): boolean {
  const isFocused = document.hasFocus()
  const isVisible = document.visibilityState === 'visible'
  return isFocused && isVisible
}

function blockListener(client: PublicClient, time: number | null): Observable<Block> {
  if (time === null) {
    return from(client.getBlock())
  }

  return timer(0, time).pipe(switchMap(() => client.getBlock()))
}

function sleepOnMousemove$(): Observable<boolean> {
  return fromEvent(window, 'mousemove').pipe(
    startWith(null),
    switchMap(() =>
      timer(10 * 1000).pipe(
        map(() => true),
        startWith(false)
      )
    ),
    distinctUntilChanged()
  )
}
