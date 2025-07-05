import { ChainId } from './chain-id'

export type ChainViewInfo = {
  name: string
  shortName: string
  iconName: string
  color: [string, string]
  priority?: number
}

export type ChainViewFull = {
  chainId: ChainId
} & ChainViewInfo
