import { ChainId, ChainViewFull, ChainViewInfo } from '@1inch-community/models'
import { isL2Chain } from './layer2-chain'

export const chainViewConfig: Record<ChainId, ChainViewInfo> = {
  [ChainId.eth]: {
    name: 'Ethereum',
    shortName: 'Ethereum',
    iconName: 'eth24',
    color: ['#627EEA', '#A3B9FD'],
  },
  [ChainId.arbitrum]: {
    name: 'Arbitrum',
    shortName: 'Arbitrum',
    iconName: 'arbitrum24',
    color: ['#2C374B', '#28A0F0'],
  },
  [ChainId.op]: {
    name: 'Optimism',
    shortName: 'Optimism',
    iconName: 'op24',
    color: ['#FF0420', '#FF758C'],
  },
  [ChainId.zkSyncEra]: {
    name: 'zkSync Era',
    shortName: 'zkSync',
    iconName: 'zkSyncEra24',
    color: ['#8C8DFC', '#C8C8FE'],
  },
  [ChainId.bnb]: {
    name: 'BNB Smart Chain',
    shortName: 'BNB Chain',
    iconName: 'bnb24',
    priority: 1,
    color: ['#F3BA2F', '#FFDD7A'],
  },
  [ChainId.matic]: {
    name: 'Polygon',
    shortName: 'Polygon',
    iconName: 'matic24',
    priority: 1,
    color: ['#8247E5', '#C49BFF'],
  },
  [ChainId.gnosis]: {
    name: 'Gnosis',
    shortName: 'Gnosis',
    iconName: 'gnosis24',
    color: ['#04795B', '#4DC5A3'],
  },
  [ChainId.avalanche]: {
    name: 'Avalanche',
    shortName: 'Avalanche',
    iconName: 'avalanche24',
    color: ['#E84142', '#FF8A7C'],
  },
  [ChainId.fantom]: {
    name: 'Fantom',
    shortName: 'Fantom',
    iconName: 'fantom24',
    color: ['#1969FF', '#77AFFF'],
  },
  [ChainId.aurora]: {
    name: 'Aurora',
    shortName: 'Aurora',
    iconName: 'aurora24',
    color: ['#70D44B', '#B8F59E'],
  },
  [ChainId.klaytn]: {
    name: 'Kaia',
    shortName: 'Kaia',
    iconName: 'klaytn24',
    color: ['#BFF009', '#263003'],
  },
}

export const chainList: ChainViewFull[] = Object.keys(chainViewConfig)
  .map((chainId) => ({ ...(chainViewConfig as any)[chainId], chainId: Number(chainId) }))
  .sort((info1: ChainViewFull, info2: ChainViewFull) => {
    if (info1.chainId == ChainId.eth) return -1
    if (info2.chainId == ChainId.eth) return 1
    if (isL2Chain(info1.chainId)) return -1
    if (isL2Chain(info2.chainId)) return 1

    return (info2.priority ?? 0) - (info1.priority ?? 0)
  })
