import type { Address } from 'viem'
import type { ChainId } from '../chain'
import type { TokenRecordId } from '../database'

export type BaseQueryFilters = {
  symbol: string
  chainId: ChainId
  chainIds: ChainId[]
  tokenRecordId: TokenRecordId
  tokenNameSymbolAddressMatches: string
  tokensOnlyWithBalance: boolean
  tokenAddress: Address
  walletAddress: Address
}

export type QueryFilters<
  RequiredKeys extends keyof BaseQueryFilters = never,
  NullableKeys extends keyof BaseQueryFilters = never,
> = {
  [K in RequiredKeys]: BaseQueryFilters[K]
} & {
  [K in NullableKeys]: BaseQueryFilters[K] | null
}
