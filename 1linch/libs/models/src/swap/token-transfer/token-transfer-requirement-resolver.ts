import type { Address } from 'viem'
import { IBigFloat } from '../../big-float'
import { IToken } from '../../token'
import { EmptyResult, ResolverStep } from './transfer-requirement-resolver'

export type ResolverActions = ResolverStep<string, EmptyResult>[]

export interface ITokenTransferRequirementResolver {
  provideRequirements(
    walletAddress: Address,
    token: IToken,
    amount: IBigFloat
  ): Promise<ResolverActions>
}
