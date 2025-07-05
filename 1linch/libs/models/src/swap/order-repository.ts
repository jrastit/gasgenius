import { Address, Hash } from 'viem'
import { ChainId } from '../chain'

export interface OrderData {
  hash: Hash
  srcTokenAddress: Address
  srcTokenChainId: ChainId
  dstTokenAddress: Address
  dstTokenChainId: ChainId
  strategyName: string
  account: Address
}

export interface IOrderRepository {
  saveOrder(order: OrderData): Promise<void>
  getOrder(orderHash: Hash): Promise<OrderData | null>
  deleteOrder(orderHash: Hash): Promise<void>
}
