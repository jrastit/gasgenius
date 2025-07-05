import { CacheActivePromise, Schedule } from '@1inch-community/core/decorators'
import { lazyAppContext } from '@1inch-community/core/lazy'
import {
  ChainId,
  GasPriceDto,
  IApplicationContext,
  ICryptoAssetDataProvider,
  IProxyClient,
  ITokenV2Dto,
  ProxyResultBalance,
  ProxyResultTokenPrice,
} from '@1inch-community/models'
import { Address } from 'viem'
import { BlockTimeCache } from '../../../chain'
import { OneInchDevPortalCrossChainOnChainAdapter } from '../onchain'
import { PrivateProxyClient } from './private-proxy-client'

function ScheduleAccumulator<A extends [ChainId[], Address[]]>(acc: A | null, value: A) {
  const chainIds = value[0]
  const accWalletAddresses = acc?.[1] ?? []
  const walletAddresses: Address[] = new Set([...accWalletAddresses, ...value[1]])
    .values()
    .toArray()
  return [chainIds, walletAddresses] as A
}

export class OneInchDevPortalCrossChainPrivateProxyAdapter implements ICryptoAssetDataProvider {
  private readonly context = lazyAppContext('OneInchDevPortalCrossChainPublicProxyAdapter')
  private readonly client = new PrivateProxyClient()
  private readonly fallBackAdapter = new OneInchDevPortalCrossChainOnChainAdapter()
  private readonly gasPriceCache = new BlockTimeCache<'gas_price', GasPriceDto>()

  async init(context: IApplicationContext): Promise<void> {
    this.context.set(context)
    await Promise.all([this.client.init(context), this.fallBackAdapter.init(context)])
  }

  @CacheActivePromise()
  @Schedule(50, ScheduleAccumulator)
  async getBalances(chainIds: ChainId[], walletAddresses: Address[]): Promise<ProxyResultBalance> {
    return await this.client.post<ProxyResultBalance>('/proxy/balance', {
      chain_ids: chainIds.map((chainId) => chainId.toString()),
      addresses: walletAddresses,
    })
  }

  @CacheActivePromise()
  async getTokenList(): Promise<ITokenV2Dto[]> {
    const walletIsConnected = await this.walletIsConnected()
    if (!walletIsConnected) {
      return await this.fallBackAdapter.getTokenList()
    }
    try {
      return this.client.get('/proxy/token-list')
    } catch {
      return await this.fallBackAdapter.getTokenList()
    }
  }

  @CacheActivePromise()
  async getTokenPrice(): Promise<ProxyResultTokenPrice> {
    return this.client.get('/proxy/token-price')
  }

  @CacheActivePromise()
  async getGasPrice(chainId: ChainId): Promise<GasPriceDto | null> {
    let result = this.gasPriceCache.get(chainId, 'gas_price')
    if (result !== null) return result
    result = await this.client.get<GasPriceDto>(`/proxy/direct/gas-price/v1.5/${chainId.valueOf()}`)
    this.gasPriceCache.set(chainId, 'gas_price', result)
    return result
  }

  getProxyClient(): IProxyClient {
    return this.client
  }

  private walletIsConnected() {
    return this.context.value.wallet.data.isConnected()
  }
}
