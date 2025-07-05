import { Hash } from 'viem'
import { IBigFloat } from '../../big-float'
import { ChainId } from '../../chain'

export interface IWrapNativeTokenResolver {
  canWrap(chainId: ChainId, amount: IBigFloat): Promise<boolean>
  wrap(chainId: ChainId, amount: IBigFloat): Promise<Hash>
  estimate(chainId: ChainId, amount: IBigFloat): Promise<IBigFloat>
}
