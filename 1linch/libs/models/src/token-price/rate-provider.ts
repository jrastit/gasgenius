import type { Observable } from 'rxjs'
import type { InitializingEntity } from '../base'
import type { ChainId } from '../chain'
import type { IToken } from '../token'
import type { Rate } from './rate'

export interface ITokenRateProvider extends InitializingEntity {
  getOnChainRate(
    chainId: ChainId,
    sourceToken: IToken,
    destinationToken: IToken
  ): Promise<Rate | null>
  listenOnChainRate(
    chainId: ChainId,
    sourceToken: IToken,
    destinationToken: IToken
  ): Observable<Rate | null>
}
