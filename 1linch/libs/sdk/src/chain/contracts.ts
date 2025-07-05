import { ChainId } from '@1inch-community/models'
import { Address } from 'viem'
import { requireChainId } from './is-chain-id'

export function getOneInchRouterV6ContractAddress(chainId: ChainId): Address {
  requireChainId(chainId)
  if (chainId === ChainId.zkSyncEra) {
    return '0x6fd4383cb451173d5f9304f041c7bcbf27d561ff'
  }
  return '0x111111125421ca6dc452d289314280a0f8842a65'
}

export function permit2ContractAddress(chainId: ChainId): Address {
  requireChainId(chainId)
  if (chainId === ChainId.zkSyncEra) {
    return '0x0000000000225e31D15943971F47aD3022F714Fa'
  }
  return '0x000000000022D473030F116dDEE9F6B43aC78BA3'
}

export function oneInchSpotPriceOracle(chainId: ChainId): Address {
  requireChainId(chainId)
  if (chainId === ChainId.zkSyncEra) {
    return '0xc9bB6e4FF7dEEa48e045CEd9C0ce016c7CFbD500'
  }
  return '0x00000000000D6FFc74A8feb35aF5827bf57f6786'
}

const wrapperNativeTokenMap: Readonly<Record<ChainId, Address>> = {
  [ChainId.eth]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  [ChainId.bnb]: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
  [ChainId.matic]: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
  [ChainId.op]: '0x4200000000000000000000000000000000000006',
  [ChainId.arbitrum]: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
  [ChainId.gnosis]: '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d',
  [ChainId.avalanche]: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
  [ChainId.fantom]: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
  [ChainId.aurora]: '0xc9bdeed33cd01541e1eed10f90519d2c06fe3feb',
  [ChainId.klaytn]: '0xe4f05a66ec68b54a58b17c22107b02e0232cc817',
  [ChainId.zkSyncEra]: '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91',
}
export function getWrapperNativeTokenAddress(chainId: ChainId): Address {
  return wrapperNativeTokenMap[chainId]
}

const balanceHelper: Readonly<Record<ChainId, Address | null>> = {
  [ChainId.eth]: '0xd8756ea68a0590961e51c6f3efcada6d883507f7',
  [ChainId.bnb]: null,
  [ChainId.matic]: '0x59250e7e0ad582ea1230094eaca130eedaf92d54',
  [ChainId.op]: null,
  [ChainId.arbitrum]: null,
  [ChainId.gnosis]: null,
  [ChainId.avalanche]: null,
  [ChainId.fantom]: null,
  [ChainId.aurora]: null,
  [ChainId.klaytn]: null,
  [ChainId.zkSyncEra]: null,
}
export function getBalanceHelperAddress(chainId: ChainId): Address | null {
  return balanceHelper[chainId]
}
