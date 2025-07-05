import {
  EmptyResult,
  IBigFloat,
  IToken,
  ITokenTransferRequirementResolver,
  ITransferRequirementResolver,
  ResolverActions,
} from '@1inch-community/models'
import type { Address } from 'viem'

export class TokenTransferRequirementResolver implements ITokenTransferRequirementResolver {
  constructor(
    private readonly providers: ITransferRequirementResolver<string, EmptyResult>[],
    private readonly fallbackResolver?: ITransferRequirementResolver<string, EmptyResult>
  ) {}

  async provideRequirements(
    walletAddress: Address,
    token: IToken,
    amount: IBigFloat
  ): Promise<ResolverActions> {
    const fallback = await this.getFallbackProvidedRequirement(walletAddress, token, amount)

    if (fallback) {
      return fallback
    }

    for (const provider of this.providers) {
      try {
        return await provider.provideRequirements(walletAddress, token, amount)
      } catch (e) {
        console.warn(e)
      }
    }

    throw new Error('No supported providers')
  }

  private async getFallbackProvidedRequirement(
    walletAddress: Address,
    token: IToken,
    amount: IBigFloat
  ): Promise<ResolverActions | null> {
    const fallbackResult =
      this.fallbackResolver &&
      (await this.fallbackResolver.requirementProvided(walletAddress, token, amount))

    if (fallbackResult) {
      return []
    }

    return null
  }
}
