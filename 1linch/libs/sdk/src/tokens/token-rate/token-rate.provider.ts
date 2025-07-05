import { CacheActivePromise } from '@1inch-community/core/decorators'
import { lazyAppContext } from '@1inch-community/core/lazy'
import {
  ChainId,
  IApplicationContext,
  IToken,
  ITokenRateProvider,
  ITokenRateSourceAdapter,
  Rate,
} from '@1inch-community/models'
import { Observable, startWith, switchMap } from 'rxjs'
import { BlockTimeCache, getWrapperNativeToken, isNativeToken } from '../../chain'
import { oneInchOracleAdapter } from './adapters/one-inch-oracle-adapter'

export class TokenRateProvider implements ITokenRateProvider {
  private readonly rateCache = new BlockTimeCache<string, Rate[]>()
  private readonly context = lazyAppContext('TokenRateProvider')

  constructor(private readonly onChainAdapters: ITokenRateSourceAdapter[]) {}

  async init(context: IApplicationContext): Promise<void> {
    this.context.set(context)
    await Promise.all(this.onChainAdapters.map((adapter) => adapter.init(context)))
  }

  @CacheActivePromise()
  async getOnChainRate(
    chainId: ChainId,
    sourceToken: IToken,
    destinationToken: IToken
  ): Promise<Rate | null> {
    const rate = await this.getOnChainRawRate(chainId, sourceToken, destinationToken)
    if (rate.length === 0) return null
    const getRateVale = (rate: Rate) => (rate.isReverted ? rate.revertedRate : rate.rate)
    let maxRate: Rate = rate[0]
    for (const item of rate) {
      if (getRateVale(item).isGreaterThan(getRateVale(maxRate))) {
        maxRate = item
      }
    }
    return maxRate
  }

  listenOnChainRate(
    chainId: ChainId,
    sourceToken: IToken,
    destinationToken: IToken
  ): Observable<Rate | null> {
    return this.context.value.onChain.getBlockEmitter(chainId).pipe(
      startWith(null),
      switchMap(() => this.getOnChainRate(chainId, sourceToken, destinationToken))
    )
  }

  private async getOnChainRawRate(
    chainId: ChainId,
    sourceToken: IToken,
    destinationToken: IToken
  ): Promise<Rate[]> {
    let _srcToken = sourceToken
    let _dstToken = destinationToken
    if (isNativeToken(sourceToken.address)) {
      const wToken: IToken = getWrapperNativeToken(chainId)
      if (!wToken) return []
      _srcToken = wToken
    }
    if (isNativeToken(destinationToken.address)) {
      const wToken = getWrapperNativeToken(chainId)
      if (!wToken) return []
      _dstToken = wToken
    }
    const id = [_srcToken.address, _dstToken.address].join(':')
    const cacheRateList = this.rateCache.get(chainId, id)
    if (cacheRateList !== null) {
      return cacheRateList
    }
    const sources = this.onChainAdapters.filter((source) => source.isSupportedChain(chainId))
    const rateResultList: (Rate | null)[] = await Promise.all(
      sources.map((source) => source.getRate(chainId, _srcToken, _dstToken))
    )
    const cleanRateList = rateResultList.filter((rate) => rate !== null) as Rate[]
    this.rateCache.set(chainId, id, cleanRateList)
    return cleanRateList
  }
}

export function buildDefaultTokenRateProvider() {
  return new TokenRateProvider([oneInchOracleAdapter])
}
