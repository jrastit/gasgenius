import {
  EmptyResult,
  IAmountDataSource,
  IOrderRepository,
  ISwapContextStrategy,
  ITokenRateProvider,
  ITokenTransferRequirementResolver,
  ITransferRequirementResolver,
  IWallet,
  IWrapNativeTokenResolver,
  SwapSettings,
} from '@1inch-community/models'
import { OneInchCrossChainSDK, OneInchSingleChainSDK } from '../../one-inch-dev-portal'
import { SwapContextFusionPlusStrategy } from './swap-context-fusion-plus.strategy'
import { SwapContextFusionStrategy } from './swap-context-fusion.strategy'
import { SwapContextOnChainStrategy } from './swap-context-onchain.strategy'
import { SwapContextWrapperStrategy } from './swap-context-wrapper.strategy'

export class SwapStrategyFactory {
  public static createDefault(
    fusionCrossChainSdk: OneInchCrossChainSDK,
    fusionSingleChainSdk: OneInchSingleChainSDK,
    wallet: IWallet,
    rateProvider: ITokenRateProvider,
    orderRepository: IOrderRepository,
    amountDataSource: IAmountDataSource,
    swapSettings: SwapSettings,
    wrapResolver: IWrapNativeTokenResolver,
    tokenTransferRequirementsResolver: ITokenTransferRequirementResolver,
    permit2RequirementResolver?: ITransferRequirementResolver<string, EmptyResult>
  ): Map<string, ISwapContextStrategy<unknown>> {
    const onChainNativeSwap = new SwapContextWrapperStrategy(wrapResolver)
    const fusionPlus = new SwapContextFusionPlusStrategy(
      fusionCrossChainSdk,
      wallet,
      orderRepository,
      amountDataSource,
      swapSettings,
      tokenTransferRequirementsResolver,
      wrapResolver,
      permit2RequirementResolver
    )
    const fusion = new SwapContextFusionStrategy(
      fusionSingleChainSdk,
      wallet,
      orderRepository,
      amountDataSource,
      swapSettings,
      tokenTransferRequirementsResolver,
      wrapResolver,
      permit2RequirementResolver
    )
    const onChain = new SwapContextOnChainStrategy(rateProvider)

    return new Map<string, ISwapContextStrategy<unknown>>([
      [onChainNativeSwap.name, onChainNativeSwap],
      [fusionPlus.name, fusionPlus],
      [fusion.name, fusion],
      [onChain.name, onChain],
    ])
  }
}
