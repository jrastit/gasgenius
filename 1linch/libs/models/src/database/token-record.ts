import type { Address } from 'viem'
import { ChainId } from '../chain'
import { IToken } from '../token'

export type TokenRecordId = `${ChainId}:${Address}`

export interface ITokenRecord extends IToken {
  readonly id: TokenRecordId
  readonly tags: string[]
  readonly eip2612: boolean | null
  readonly priority: number
  readonly logoURL: string
}
