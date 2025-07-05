import type { Address } from 'viem'
import { ChainId } from '../chain'

export interface ITokenDto {
  chainId: number
  symbol: string
  name: string
  address: Address
  decimals: number
  logoURI: string
  tags: string[]
  isFoT?: boolean
  displayedSymbol?: string
  extensions?: { eip2612: boolean }
  providers?: string[]
}

export interface ITokenV2Dto {
  address: Address
  chainId: ChainId
  decimals: number
  symbol: string
  eip2612: boolean
  isFoT: boolean
  logoURI: string
  name: string
  providers: string[]
  tags: string[]
  displayedSymbol?: string
}
