import {
  BalanceTokenRecordId,
  ChainId,
  IToken,
  TokenPriceRecordId,
  TokenRecordId,
} from '@1inch-community/models'
import { Address } from 'viem'

const separator = ':'

export function buildTokenId(chainId: ChainId, tokenAddress: Address): TokenRecordId {
  return `${chainId}${separator}${tokenAddress}`.toLowerCase() as TokenRecordId
}

export function buildTokenPriceId(chainId: ChainId, tokenAddress: Address): TokenPriceRecordId {
  return `${chainId}${separator}${tokenAddress}`.toLowerCase() as TokenPriceRecordId
}

export function buildBalanceId(
  chainId: ChainId,
  walletAddress: Address,
  tokenAddress: Address
): BalanceTokenRecordId {
  return `${chainId}${separator}${walletAddress}${separator}${tokenAddress}`.toLowerCase() as BalanceTokenRecordId
}

export function destructuringId<T extends string[]>(id: string): T {
  return id.split(separator) as T
}

export function buildTokenIdByToken(token: IToken): TokenRecordId {
  return buildTokenId(token.chainId, token.address)
}
