import type { Address } from 'viem'
import { ChainId } from '../chain'
import { TokenRecordId } from './token-record'

export type BalanceTokenRecordId = `${TokenRecordId}:${Address}`

export interface IBalancesTokenRecord {
  readonly id: BalanceTokenRecordId
  readonly tokenRecordId: TokenRecordId
  readonly chainId: ChainId
  readonly tokenAddress: Address
  readonly walletAddress: Address
  readonly amount: string
}
