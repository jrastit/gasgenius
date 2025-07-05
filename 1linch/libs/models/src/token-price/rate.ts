import type { IBigFloat } from '../big-float'
import type { IToken } from '../token'

export enum RateSource {
  onChain = 'onChain',
  fusion = 'fusion',
  fusionPlus = 'fusionPlus',
  onChainDeposit = 'onChainDeposit',
}

export type Rate = {
  source: RateSource
  isReverted: boolean
  rate: IBigFloat
  revertedRate: IBigFloat
  sourceToken: IToken
  destinationToken: IToken
}
