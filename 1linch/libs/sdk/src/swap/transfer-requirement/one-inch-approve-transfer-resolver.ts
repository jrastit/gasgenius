import {
  ChainId,
  EmptyResult,
  IBigFloat,
  IOnChain,
  IToken,
  ITransferRequirementResolver,
  IWallet,
  ResolverStep,
} from '@1inch-community/models'
import { Address, encodeFunctionData, maxUint160, parseAbi, WriteContractParameters } from 'viem'
import { getChainById, getOneInchRouterV6ContractAddress } from '../../chain'

const ERC20_ABI = parseAbi([
  'function allowance(address owner, address spender) public view returns (uint256)',
  'function approve(address _spender, uint256 _value) public returns (bool success)',
])

type StepResultMap = {
  Approve: EmptyResult
  ApproveTransactionAwait: EmptyResult
}

type StepName = keyof StepResultMap
type StepResult<S extends StepName> = StepResultMap[S]

export class OneInchApproveTransferResolver
  implements ITransferRequirementResolver<StepName, StepResult<StepName>>
{
  constructor(
    private readonly onChainService: IOnChain,
    private readonly wallet: IWallet
  ) {}

  async requirementProvided(
    walletAddress: Address,
    token: IToken,
    amount: IBigFloat
  ): Promise<StepResult<StepName> | null> {
    const amountValue = amount.toWei(token.decimals)

    if (
      amountValue > 0n &&
      (await this.checkAllowance(token.chainId, walletAddress, token, amountValue))
    ) {
      return {}
    }
    return null
  }

  async provideRequirements(
    walletAddress: Address,
    token: IToken,
    amount: IBigFloat
  ): Promise<ResolverStep<StepName, StepResult<StepName>>[]> {
    const amountValue = amount.toWei(token.decimals)
    const chainId = token.chainId

    const alreadyApproved = await this.requirementProvided(walletAddress, token, amount)

    if (alreadyApproved) {
      return []
    }

    await this.canPerformApprove(chainId, walletAddress, token.address, amountValue)

    return [
      {
        alias: 'Approve',
        wait: () => this.approveTokenStep(chainId, walletAddress, token, maxUint160),
      },
    ]
  }

  private async checkAllowance(
    chainId: ChainId,
    walletAddress: Address,
    token: IToken,
    amount: bigint
  ): Promise<boolean> {
    try {
      const router = getOneInchRouterV6ContractAddress(chainId)
      const allowed = await this.onChainService.getAllowance(
        chainId,
        token.address,
        walletAddress,
        router
      )

      return allowed.toWei(token.decimals) >= amount
    } catch (e) {
      console.warn(e)
      return false
    }
  }

  private async canPerformApprove(
    chainId: ChainId,
    walletAddress: Address,
    tokenAddress: Address,
    amount: bigint
  ): Promise<void> {
    const router = getOneInchRouterV6ContractAddress(chainId)
    const client = await this.onChainService.getClient(chainId)

    try {
      await client.estimateGas({
        account: walletAddress,
        to: tokenAddress,
        data: encodeFunctionData({
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [router, amount],
        }),
      })
    } catch (error) {
      console.warn(error)
      throw new Error('Gas estimation failed for approve, transaction would revert')
    }
  }

  private async approveTokenStep(
    chainId: ChainId,
    walletAddress: Address,
    token: IToken,
    amount: bigint
  ): Promise<EmptyResult> {
    const router = getOneInchRouterV6ContractAddress(chainId)

    const wcp: WriteContractParameters = {
      account: walletAddress,
      chain: getChainById(chainId),
      abi: ERC20_ABI,
      address: token.address,
      functionName: 'approve',
      args: [router, amount],
    }

    await this.checkCurrentWalletNetwork(chainId)

    const hash = await this.wallet.writeContract(wcp)
    await this.onChainService.waitTransaction(chainId, hash)

    const currentAllowance = await this.onChainService.getAllowance(
      chainId,
      token.address,
      walletAddress,
      router
    )

    if (currentAllowance.toWei(token.decimals) <= amount / 2n) {
      throw new Error('Failed to approve token')
    }

    return {}
  }

  private async checkCurrentWalletNetwork(chainId: ChainId): Promise<void> {
    const walletChain = await this.wallet.data.getWalletChainId()

    if (chainId !== walletChain) {
      throw new Error(`Change wallet chain to ${chainId} before`)
    }
  }
}
