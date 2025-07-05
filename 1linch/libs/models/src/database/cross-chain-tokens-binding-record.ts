import { Address } from 'viem'
import { ChainId } from '../chain'
import { TokenRecordId } from './token-record'

export interface ICrossChainTokensBindingRecord {
  symbol: string
  priority: number
  supportedChainIds: ChainId[]
  tokenNames: string[]
  tokenAddresses: Address[]
  tokenRecordIds: TokenRecordId[]
}
