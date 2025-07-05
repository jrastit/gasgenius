import { IBigFloat } from '../big-float'
import { IToken } from './token'

export interface TokenSnapshot {
  readonly amount: IBigFloat
  readonly token: IToken
}
