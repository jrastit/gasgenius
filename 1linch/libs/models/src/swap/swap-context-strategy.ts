import { type Address, Hash } from 'viem'
import { IBigFloat } from '../big-float'
import { IToken } from '../token'
import { Rate } from '../token-price'
import { Pair } from './swap-context'
import { SwapOrderStatus } from './swap-order-status'
import { SwapSnapshot } from './swap-snapshot'
import { ResolverActions } from './token-transfer'

export interface ISwapContextStrategy<SwapData> {
  readonly name: string
  supportSwap(pair: Pair, walletAddress: Address | null): Promise<boolean>
  getDataSnapshot(
    pair: Pair,
    amount: IBigFloat,
    walletAddress: Address | null,
    finalize?: boolean | undefined
  ): Promise<ISwapContextStrategyDataSnapshot>
  swap(swapSnapshot: SwapSnapshot<SwapData>): Promise<Hash>
  prepareSwap(swapSnapshot: SwapSnapshot<SwapData>): Promise<ResolverActions>
  getOrderStatus(orderHash: Hash): Promise<SwapOrderStatus>
  cancelOrder(orderHash: Hash): Promise<Hash | null>
}

export enum StrategyOptionType {
  SLIPPAGE = 'SLIPPAGE',
  AUCTION_TIME = 'AUCTION_TIME',
  NETWORK_FEE = 'NETWORK_FEE',
  MIN_RECEIVE = 'MIN_RECEIVE',
  RATE = 'RATE',
}

export type OptionValueType = {
  [StrategyOptionType.RATE]: Rate
  [StrategyOptionType.SLIPPAGE]: number
  [StrategyOptionType.AUCTION_TIME]: number
  [StrategyOptionType.NETWORK_FEE]: IBigFloat | null
  [StrategyOptionType.MIN_RECEIVE]: IBigFloat
}

export interface ISwapContextStrategyDataSnapshot<T = unknown> {
  walletAddress: Address | null
  sourceToken: IToken
  destinationToken: IToken
  sourceTokenAmount: IBigFloat
  destinationTokenAmount: IBigFloat
  options: Partial<OptionValueType>
  rate: Rate
  strategyName: string
  rawResponseData: T
}
