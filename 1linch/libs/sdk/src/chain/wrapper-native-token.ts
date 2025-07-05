import { ChainId, IToken } from '@1inch-community/models'
import { getWrapperNativeTokenAddress } from './contracts'
import { getChainById } from './viem-chain-map'

export function getWrapperNativeToken(chainId: ChainId): IToken {
  const chain = getChainById(chainId)
  return {
    chainId,
    symbol: `W${chain.nativeCurrency.symbol}`,
    name: `W${chain.nativeCurrency.symbol}`,
    decimals: chain.nativeCurrency.decimals,
    address: getWrapperNativeTokenAddress(chainId),
    isSupportCrossChain: true,
    isInternalWrapToken: true,
  }
}

export function getSymbolFromWrapToken(token: IToken) {
  if (token.isInternalWrapToken) {
    return token.symbol.slice(1)
  }
  return token.symbol
}
