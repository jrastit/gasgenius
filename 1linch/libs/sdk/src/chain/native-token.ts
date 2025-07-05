import { ChainId, IToken } from '@1inch-community/models'
import { nativeTokenAddress } from './is-native-token'
import { getChainById } from './viem-chain-map'

export function getNativeToken(chainId: ChainId): IToken {
  const chain = getChainById(chainId)
  return {
    chainId,
    symbol: chain.nativeCurrency.symbol,
    name: chain.nativeCurrency.symbol,
    decimals: chain.nativeCurrency.decimals,
    address: nativeTokenAddress,
    isSupportCrossChain: true,
  }
}
