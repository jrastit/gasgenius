import { ChainId } from '@1inch-community/models'
import { Address } from 'viem'
import { getChainById } from './viem-chain-map'

export const getWalletExplorerUrl = (chainId: ChainId, address: Address): string | null => {
  const explorerUrl = getChainById(chainId)?.blockExplorers?.default.url

  return explorerUrl ? new URL(`address/${address}`, explorerUrl).toString() : null
}
