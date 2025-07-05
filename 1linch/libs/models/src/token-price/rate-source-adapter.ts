import { InitializingEntity } from '../base'
import { ChainId } from '../chain'
import { IToken } from '../token'
import { Rate } from './rate'

export interface ITokenRateSourceAdapter extends InitializingEntity {
  getRate(chainId: ChainId, sourceToken: IToken, destinationToken: IToken): Promise<Rate | null>
  isSupportedChain(chainId: ChainId): boolean
}
