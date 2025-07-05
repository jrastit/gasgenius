import { IToken } from '@1inch-community/models'
import { isAddressEqual } from 'viem'

export function isTokensEqual(token1: IToken | null, token2: IToken | null): boolean {
  if (token1 === null && token1 === token2) {
    return true
  }
  if (token1 === null || token2 === null) {
    return false
  }
  const isAddressMatching = isAddressEqual(token1.address, token2.address)
  const isChainIdMatching = token1?.chainId === token2?.chainId

  return isAddressMatching && isChainIdMatching
}
