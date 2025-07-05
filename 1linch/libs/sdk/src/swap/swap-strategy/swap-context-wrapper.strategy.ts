import { CacheActivePromise } from '@1inch-community/core/decorators'
import { BigFloat } from '@1inch-community/core/math'
import {
  IBigFloat,
  ISwapContextStrategy,
  ISwapContextStrategyDataSnapshot,
  IWrapNativeTokenResolver,
  OptionValueType,
  Pair,
  Rate,
  RateSource,
  ResolverActions,
  StrategyOptionType,
  SwapOrderStatus,
  SwapSnapshot,
} from '@1inch-community/models'
import { type Address, type Hash } from 'viem'
import { getWrapperNativeTokenAddress } from '../../chain'

export class SwapContextWrapperStrategy implements ISwapContextStrategy<unknown> {
  readonly name: string = 'NativeWrapper'

  constructor(private readonly nativeTokenResolver: IWrapNativeTokenResolver) {}

  async supportSwap(pair: Pair): Promise<boolean> {
    return (
      pair.source.chainId === pair.destination.chainId &&
      pair.source.isInternalWrapToken === true &&
      pair.destination.address === getWrapperNativeTokenAddress(pair.source.chainId)
    )
  }

  async swap(swapSnapshot: SwapSnapshot): Promise<Hash> {
    if (swapSnapshot.strategyName !== this.name) {
      throw new Error('wrong snapshot')
    }

    const { sourceToken, destinationTokenAmount } = swapSnapshot
    const canWrap = await this.nativeTokenResolver.canWrap(
      sourceToken.chainId,
      destinationTokenAmount
    )

    if (!canWrap) {
      throw new Error('Cannot wrap token')
    }

    return await this.nativeTokenResolver.wrap(sourceToken.chainId, destinationTokenAmount)
  }

  async prepareSwap(): Promise<ResolverActions> {
    return []
  }

  @CacheActivePromise()
  async estimateDeposit(chainId: number, amount: IBigFloat): Promise<IBigFloat | null> {
    try {
      return await this.nativeTokenResolver.estimate(chainId, amount)
    } catch (e) {
      console.warn(e)
      return null
    }
  }

  async getDataSnapshot(
    pair: Pair,
    amount: IBigFloat,
    walletAddress: Address | null
  ): Promise<ISwapContextStrategyDataSnapshot> {
    const { source: sourceToken, destination: destinationToken } = pair
    const isSupportExchange = await this.supportSwap(pair)

    if (!isSupportExchange) {
      throw new Error(`Strategy ${this.name} not support exchange by presented pair/chain`)
    }

    const rate = BigFloat.fromBigInt(1n, 0)

    const rateData: Rate = {
      source: RateSource.onChainDeposit,
      rate,
      revertedRate: rate,
      isReverted: false,
      sourceToken: sourceToken,
      destinationToken: destinationToken,
    }

    const networkFee = await this.estimateDeposit(pair.source.chainId, amount)

    const options: Partial<OptionValueType> = {
      [StrategyOptionType.RATE]: rateData,
      [StrategyOptionType.MIN_RECEIVE]: amount,
      [StrategyOptionType.NETWORK_FEE]: networkFee,
    }

    return {
      walletAddress,
      sourceToken,
      destinationToken,
      sourceTokenAmount: amount,
      destinationTokenAmount: amount,
      rate: rateData,
      options,
      strategyName: this.name,
      rawResponseData: null,
    }
  }

  async getOrderStatus(): Promise<SwapOrderStatus> {
    throw new Error('Not supported')
  }

  async cancelOrder(): Promise<Hash | null> {
    throw new Error('Not supported')
  }
}
