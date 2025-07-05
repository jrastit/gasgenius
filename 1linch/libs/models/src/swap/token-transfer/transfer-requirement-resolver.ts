import { IBigFloat, IToken } from 'index'
import type { Address } from 'viem'

export type EmptyResult = object

export interface ResolverStep<S extends string, R extends EmptyResult> {
  alias: S
  wait: () => Promise<R>
}

export interface ITransferRequirementResolver<Step extends string, R extends EmptyResult> {
  requirementProvided(walletAddress: Address, token: IToken, amount: IBigFloat): Promise<R | null>

  provideRequirements(
    walletAddress: Address,
    token: IToken,
    amount: IBigFloat
  ): Promise<ResolverStep<Step, R>[]>
}
