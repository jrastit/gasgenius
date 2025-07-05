import { CacheActivePromise } from '@1inch-community/core/decorators'
import { lazyAppContext } from '@1inch-community/core/lazy'
import {
  ChainId,
  GasPriceDto,
  IApplicationContext,
  ICryptoAssetDataProvider,
  IProxyClient,
  ITokenV2Dto,
  ProxyResultBalance,
  ProxyResultBalanceItem,
  ProxyResultTokenPrice,
  ProxyResultTokenPriceItem,
} from '@1inch-community/models'
import { Address } from 'viem'
import { OneInchDevPortalCrossChainOnChainAdapter } from '../onchain'
import { PublicProxyClient } from './public-proxy-client'

export class OneInchDevPortalCrossChainPublicProxyAdapter implements ICryptoAssetDataProvider {
  private readonly context = lazyAppContext('OneInchDevPortalCrossChainPublicProxyAdapter')
  private readonly client = new PublicProxyClient()
  private readonly fallBackAdapter = new OneInchDevPortalCrossChainOnChainAdapter()

  async init(context: IApplicationContext): Promise<void> {
    this.context.set(context)
    await Promise.all([this.client.init(context), this.fallBackAdapter.init(context)])
  }

  @CacheActivePromise()
  async getBalances(chainIds: ChainId[], walletAddresses: Address[]): Promise<ProxyResultBalance> {
    const pending: Promise<ProxyResultBalanceItem>[] = []

    for (const chainId of chainIds) {
      for (const walletAddress of walletAddresses) {
        pending.push(
          this.client
            .get<Record<string, string>>(`/balance/v1.2/${chainId}/balances/${walletAddress}`)
            .then((response) => {
              return {
                id: [chainId, walletAddress].join(':'),
                result: response,
                error: null,
              } satisfies ProxyResultBalanceItem
            })
            .catch((error: Error) => {
              return {
                id: [chainId, walletAddress].join(':'),
                result: null,
                error: {
                  code: 0,
                  message: error.message,
                },
              } satisfies ProxyResultBalanceItem
            })
        )
      }
    }

    return await Promise.all(pending)
  }

  @CacheActivePromise()
  async getTokenList(): Promise<ITokenV2Dto[]> {
    const walletIsConnected = await this.walletIsConnected()
    if (!walletIsConnected) {
      return await this.fallBackAdapter.getTokenList()
    }
    try {
      return this.client.get('/token/v1.2/multi-chain')
    } catch {
      return await this.fallBackAdapter.getTokenList()
    }
  }

  @CacheActivePromise()
  async getTokenPrice(chainIds: ChainId[]): Promise<ProxyResultTokenPrice> {
    return Promise.all(
      chainIds.map(async (chainId) => {
        const result = await this.client.get<Record<Address, string>>(
          `/price/v1.1/${chainId}?currency=USD`
        )
        return {
          id: chainId.toString(),
          result,
          error: null,
        } satisfies ProxyResultTokenPriceItem
      })
    )
  }

  getGasPrice(): Promise<GasPriceDto | null> {
    throw new Error('Method not implemented.')
  }

  getProxyClient(): IProxyClient {
    return this.client
  }

  private walletIsConnected() {
    return this.context.value.wallet.data.isConnected()
  }
}
