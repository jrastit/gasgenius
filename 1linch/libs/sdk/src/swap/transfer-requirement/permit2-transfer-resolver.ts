import { LongTimeCache } from '@1inch-community/core/cache'
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
import {
  Address,
  encodeFunctionData,
  Hash,
  Hex,
  maxUint160,
  parseAbi,
  SignTypedDataParameters,
  WriteContractParameters,
} from 'viem'
import {
  getChainById,
  getOneInchRouterV6ContractAddress,
  PERMIT2_ABI,
  permit2ContractAddress,
  PermitSingle,
} from '../../chain'

const ERC20_ABI = parseAbi([
  'function allowance(address owner, address spender) public view returns (uint256)',
  'function approve(address _spender, uint256 _value) public returns (bool success)',
  'function balanceOf(address) view returns (uint256)',
])

interface Permit2Result {
  signature: Hash
  permitSingle: PermitSingle
  error?: string
}

interface Permit2Status {
  isTokenApprovedForPermit2: boolean
  isPermit2Approved: boolean
  isAmountSufficient: boolean
  hasEnoughBalance: boolean
  tokenAllowance: bigint
  permit2Allowance: bigint
  permit2Expiration: number
  isExpired: boolean
  nonce: number
}

export class SingResult implements EmptyResult {
  readonly signature: Hash
  readonly permit: PermitSingle

  constructor(signature: Hash, permit: PermitSingle) {
    this.signature = signature
    this.permit = permit
  }
}

type StepResultMap = {
  Approve: EmptyResult
  SignPermit: SingResult
}

type StepName = keyof StepResultMap
type StepResult<S extends StepName> = StepResultMap[S]

type CacheKey = string
type CachePermit = { permit: PermitSingle; signature: Hash; amount: bigint; expiration: number }

export class Permit2TransferResolver
  implements ITransferRequirementResolver<StepName, StepResult<StepName>>
{
  private readonly permit2SupportCache = new LongTimeCache<ChainId, boolean>(
    'permit2_chain_contract',
    1000_000_000
  )
  private readonly signatureCache = new LongTimeCache<CacheKey, string>('permit2_sig', 1000_000_000)

  private readonly DEFAULT_PERMIT_EXPIRATION_SEC = 30 * 24 * 60 * 60 // 30 days
  private readonly DEFAULT_SIG_DEADLINE_SEC = 60 * 60 // 1 hour
  private readonly MINIMUM_SIG_EXPIRATION_SEC = 10 * 60 // 10 minutes
  private readonly PERMIT2_APPROVE_AMOUNT = maxUint160

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
    const chainId = token.chainId

    const allowance = await this.checkPermitAllowance(chainId, walletAddress, token, amountValue)
    const cachedPermit = await this.getCachedPermit(
      chainId,
      walletAddress,
      token.address,
      amountValue
    )

    if (allowance && cachedPermit && amountValue > 0n) {
      return new SingResult(cachedPermit.signature, cachedPermit.permit)
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

    if (amountValue === 0n) {
      throw new Error('amount must be more than 0')
    }

    const isPermit2Supported = await this.supportPermit2ContractForChain(chainId)

    if (!isPermit2Supported) {
      throw new Error(`Permit2 is not supported for chain ${chainId}`)
    }

    const hasBalance = await this.hasEnoughTokenBalance(
      chainId,
      walletAddress,
      token.address,
      amountValue
    )

    if (!hasBalance) {
      throw new Error(`Insufficient token balance for ${token}`)
    }

    const permit2Status = await this.checkPermit2Status(
      chainId,
      walletAddress,
      token.address,
      amountValue
    )

    const steps: ResolverStep<StepName, StepResult<StepName>>[] = []

    if (!permit2Status.isTokenApprovedForPermit2) {
      steps.push({
        alias: 'Approve',
        wait: () => this.approveTokenStep(chainId, walletAddress, token, maxUint160),
      })
    }

    const permit2Amount = this.PERMIT2_APPROVE_AMOUNT

    const cached = await this.getCachedPermit(chainId, walletAddress, token.address, permit2Amount)

    if (cached) {
      return []
    }

    steps.push({
      alias: 'SignPermit',
      wait: () =>
        this.signPermit2Step(
          chainId,
          walletAddress,
          token.address,
          permit2Amount,
          permit2Status.nonce
        ),
    })

    return steps
  }

  private async approveTokenStep(
    chainId: ChainId,
    walletAddress: Address,
    token: IToken,
    amount: bigint
  ): Promise<EmptyResult> {
    const canApprove = await this.canPerformApprove(chainId, walletAddress, token, amount)

    if (!canApprove) {
      throw new Error('Cannot approve token for Permit2')
    }

    try {
      const approved = await this.approveTokenForPermit2(chainId, walletAddress, token, amount)

      if (!approved) {
        throw new Error('')
      }

      return {}
    } catch (e) {
      console.warn(e)
      throw new Error('Failed to approve token for Permit2')
    }
  }

  private async signPermit2Step(
    chainId: ChainId,
    walletAddress: Address,
    token: Address,
    amount: bigint,
    permit2Nonce: number
  ): Promise<SingResult> {
    const now = Math.floor(Date.now() / 1000)
    const expiration = now + this.DEFAULT_PERMIT_EXPIRATION_SEC
    const sigDeadline = BigInt(now + this.DEFAULT_SIG_DEADLINE_SEC)
    const spender = getOneInchRouterV6ContractAddress(chainId)

    try {
      const permit2Result = await this.createPermit2Signature(
        chainId,
        walletAddress,
        token,
        spender,
        amount,
        expiration,
        sigDeadline,
        permit2Nonce
      )

      if (!permit2Result.signature) {
        throw new Error('')
      }

      await this.setPermitToCache(
        chainId,
        walletAddress,
        token,
        Number(sigDeadline),
        amount,
        permit2Result
      )

      return new SingResult(permit2Result.signature, permit2Result.permitSingle)
    } catch (e) {
      console.warn(e)
      throw new Error(`Token approved for Permit2, but Permit2 signature failed for ${token}.`)
    }
  }

  private getPermit2ContractAddress(chainId: ChainId): Address {
    return permit2ContractAddress(chainId)
  }

  private async checkPermitAllowance(
    chainId: ChainId,
    walletAddress: Address,
    token: IToken,
    amount: bigint
  ): Promise<boolean> {
    try {
      const supportChain = await this.supportPermit2ContractForChain(chainId)

      if (!supportChain) {
        return false
      }

      const permit2Address = this.getPermit2ContractAddress(chainId)

      const allowed = await this.onChainService.getAllowance(
        chainId,
        token.address,
        walletAddress,
        permit2Address
      )

      return allowed.toWei(token.decimals) >= amount
    } catch (e) {
      console.warn(e)
      return false
    }
  }

  private async supportPermit2ContractForChain(chainId: ChainId): Promise<boolean> {
    const cachedResult = this.permit2SupportCache.get(chainId)

    if (cachedResult) {
      return cachedResult
    }

    try {
      const permit2Address = this.getPermit2ContractAddress(chainId)
      const client = await this.onChainService.getClient(chainId)
      const code = await client.getCode({
        address: permit2Address,
      })

      if (code === '0x' || code === '0x0') {
        this.permit2SupportCache.set(chainId, false)
        return false
      }

      try {
        await client.readContract({
          abi: PERMIT2_ABI,
          address: permit2Address,
          functionName: 'DOMAIN_SEPARATOR',
        })

        this.permit2SupportCache.set(chainId, true)
        return true
      } catch (e) {
        console.warn(e)
        this.permit2SupportCache.set(chainId, false)
        return false
      }
    } catch (error) {
      console.warn(error)
      this.permit2SupportCache.set(chainId, false)
      return false
    }
  }

  private async hasEnoughTokenBalance(
    chainId: ChainId,
    walletAddress: Address,
    tokenAddress: Address,
    amount: bigint
  ): Promise<boolean> {
    const client = await this.onChainService.getClient(chainId)

    const balance = await client.readContract({
      abi: ERC20_ABI,
      address: tokenAddress,
      functionName: 'balanceOf',
      args: [walletAddress],
    })

    return balance >= amount
  }

  private async checkPermit2Status(
    chainId: ChainId,
    walletAddress: Address,
    tokenAddress: Address,
    amount: bigint
  ): Promise<Permit2Status> {
    const permit2Address = this.getPermit2ContractAddress(chainId)
    const client = await this.onChainService.getClient(chainId)
    const oneInchRouter = getOneInchRouterV6ContractAddress(chainId)

    const tokenAllowance = await client.readContract({
      abi: ERC20_ABI,
      address: tokenAddress,
      functionName: 'allowance',
      args: [walletAddress, permit2Address],
    })

    const balance = await client.readContract({
      abi: ERC20_ABI,
      address: tokenAddress,
      functionName: 'balanceOf',
      args: [walletAddress],
    })

    const [permit2Allowance, permit2Expiration, nonce] = await client.readContract({
      abi: PERMIT2_ABI,
      address: permit2Address,
      functionName: 'allowance',
      args: [walletAddress, tokenAddress, oneInchRouter],
    })

    const currentTimestamp = Math.floor(Date.now() / 1000)
    const isExpired = permit2Expiration <= currentTimestamp

    return {
      isTokenApprovedForPermit2: tokenAllowance >= amount,
      isPermit2Approved: permit2Allowance >= amount,
      isAmountSufficient: tokenAllowance >= amount && permit2Allowance >= amount,
      hasEnoughBalance: balance >= amount,
      tokenAllowance,
      permit2Allowance,
      permit2Expiration,
      isExpired,
      nonce,
    }
  }

  private async canPerformApprove(
    chainId: ChainId,
    walletAddress: Address,
    token: IToken,
    amount: bigint
  ): Promise<boolean> {
    const permit2Address = this.getPermit2ContractAddress(chainId)
    const client = await this.onChainService.getClient(chainId)

    try {
      await client.estimateGas({
        account: walletAddress,
        to: token.address,
        data: encodeFunctionData({
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [permit2Address, amount],
        }),
      })

      return true
    } catch (error) {
      console.warn('Gas estimation failed for approve, transaction would revert:', error)
      return false
    }
  }

  private async approveTokenForPermit2(
    chainId: ChainId,
    walletAddress: Address,
    token: IToken,
    amount: bigint
  ): Promise<boolean> {
    const permit2Address = this.getPermit2ContractAddress(chainId)

    const wcp: WriteContractParameters = {
      account: walletAddress,
      chain: getChainById(chainId),
      abi: ERC20_ABI,
      address: token.address,
      functionName: 'approve',
      args: [permit2Address, amount],
    }

    await this.checkCurrentWalletNetwork(chainId)

    const hash = await this.wallet.writeContract(wcp)
    await this.onChainService.waitTransaction(chainId, hash)

    // it is necessary for the blockchain state to have time to update
    await new Promise((resolve) => setTimeout(() => resolve(undefined), 1000))

    const currentAllowance = await this.onChainService.getAllowance(
      chainId,
      token.address,
      walletAddress,
      permit2Address
    )

    return currentAllowance.toWei(token.decimals) >= amount / 2n
  }

  private async createPermit2Signature(
    chainId: ChainId,
    walletAddress: Address,
    tokenAddress: Address,
    spenderAddress: Address,
    amount: bigint,
    expiration: number,
    sigDeadline: bigint,
    nonce: number
  ): Promise<Permit2Result> {
    const permit2Address = this.getPermit2ContractAddress(chainId)

    const permitSingle: PermitSingle = {
      details: {
        token: tokenAddress,
        amount,
        expiration,
        nonce,
      },
      spender: spenderAddress,
      sigDeadline,
    }

    const signature = await this.signPermit2(walletAddress, permit2Address, chainId, permitSingle)

    if (!signature) {
      throw new Error('Failed to sign Permit2 data')
    }

    return {
      signature,
      permitSingle,
    }
  }

  private async signPermit2(
    account: Address,
    permit2Address: Address,
    chainId: ChainId,
    permitSingle: PermitSingle
  ): Promise<Hex> {
    const domain = {
      name: 'Permit2',
      chainId: chainId.valueOf(),
      verifyingContract: permit2Address,
    }

    const types = {
      PermitSingle: [
        { name: 'details', type: 'PermitDetails' },
        { name: 'spender', type: 'address' },
        { name: 'sigDeadline', type: 'uint256' },
      ],
      PermitDetails: [
        { name: 'token', type: 'address' },
        { name: 'amount', type: 'uint160' },
        { name: 'expiration', type: 'uint48' },
        { name: 'nonce', type: 'uint48' },
      ],
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
    }

    const signParams: SignTypedDataParameters = {
      account,
      domain,
      types,
      primaryType: 'PermitSingle' as const,
      message: permitSingle as any,
    }

    return await this.wallet.signTypedData(signParams)
  }

  private async getCachedPermit(
    chainId: ChainId,
    wallet: Address,
    token: Address,
    amount: bigint
  ): Promise<CachePermit | null> {
    const key = this.getCacheKey(chainId, wallet, token)
    const rawCache = this.signatureCache.get(key)
    const data = this.fromCachedValue(rawCache)
    const now = Math.floor(Date.now() / 1000)
    const valid =
      data && now <= data.expiration - this.MINIMUM_SIG_EXPIRATION_SEC && amount <= data.amount

    if (valid === false) {
      await this.setPermitToCache(chainId, wallet, token, 0, amount, null)
    }

    return valid ? data : null
  }

  private async setPermitToCache(
    chainId: ChainId,
    wallet: Address,
    token: Address,
    expiration: number,
    amount: bigint,
    permitResult: Permit2Result | null
  ): Promise<void> {
    const key = this.getCacheKey(chainId, wallet, token)

    if (permitResult === null) {
      this.signatureCache.delete(key)
    } else {
      this.signatureCache.set(
        key,
        this.toCacheValue({
          permit: permitResult.permitSingle,
          signature: permitResult.signature,
          amount,
          expiration,
        })
      )
    }
  }

  private getCacheKey(chainId: ChainId, wallet: Address, token: Address): string {
    return `${chainId}${wallet}${token}`
  }

  private toCacheValue(value: CachePermit): string {
    return JSON.stringify(value, (key: string, value: any) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  }

  private fromCachedValue(value: string | null | undefined): CachePermit | undefined {
    try {
      if (!value) {
        return
      }

      const rawJson = JSON.parse(value)

      return {
        permit: {
          details: {
            token: rawJson.permit.details.token,
            amount: BigInt(rawJson.permit.details.amount),
            expiration: rawJson.permit.details.expiration,
            nonce: rawJson.permit.details.nonce,
          },
          spender: rawJson.permit.spender,
          sigDeadline: BigInt(rawJson.permit.sigDeadline),
        },
        signature: rawJson.signature,
        amount: BigInt(rawJson.amount),
        expiration: rawJson.expiration,
      }
    } catch (e) {
      console.warn(e)
    }
    return
  }

  private async checkCurrentWalletNetwork(chainId: ChainId): Promise<void> {
    const walletChain = await this.wallet.data.getWalletChainId()

    if (chainId !== walletChain) {
      throw new Error(`Change wallet chain to ${chainId} before`)
    }
  }
}
