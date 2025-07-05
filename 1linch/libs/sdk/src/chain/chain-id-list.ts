import { ChainId } from '@1inch-community/models'

export function getChainIdList(): ChainId[] {
  return Object.values(ChainId).filter((item) => typeof item === 'number') as ChainId[]
}
