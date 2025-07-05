import { ChainId } from '@1inch-community/models'

export function isChainId(chainId: any): chainId is ChainId {
  return ChainId[chainId] !== undefined
}

export function requireChainId(chainId: any): void | never {
  if (!isChainId(chainId)) throw new Error(`chain ${chainId} not supported`)
}

export function parseChainId(chainIdStr: string): ChainId {
  const chainId = parseInt(chainIdStr, 10)
  if (!isChainId(chainId)) {
    throw new Error(`chain ${chainId} not supported`)
  }
  return chainId
}
