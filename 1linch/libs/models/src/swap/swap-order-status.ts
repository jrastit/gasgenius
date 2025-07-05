import type { Address } from 'viem'
import { ChainId } from '../chain'

export enum OrderStatus {
  Pending = 'pending',
  Executed = 'executed',
  Expired = 'expired',
  Cancelled = 'cancelled',
  Refunding = 'refunding',
  Refunded = 'refunded',
  Failed = 'failed',
}

export interface SwapOrderStatus {
  statusCode?: number
  status: OrderStatus
  makerTraits: string
  fromTokenChainId: ChainId
  fromTokenAddress: Address
  toTokenChainId: ChainId
  toTokenAddress: Address
  takingAmount: bigint
  makingAmount: bigint
  auctionDuration: number
  auctionStartDate: number
}
