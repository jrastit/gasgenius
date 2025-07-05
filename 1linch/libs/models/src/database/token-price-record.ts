import { ChainId } from '../chain'
import { TokenRecordId } from './token-record'

export type TokenPriceRecordId = TokenRecordId

export interface ITokenPriceRecord {
  readonly id: TokenPriceRecordId
  readonly tokenRecordId: TokenRecordId
  readonly chainId: ChainId
  readonly price: string
}
