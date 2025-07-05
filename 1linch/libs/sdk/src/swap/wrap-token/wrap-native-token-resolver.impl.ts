import { BigFloat } from '@1inch-community/core/math'
import {
  ChainId,
  IBigFloat,
  ICryptoAssetDataProvider,
  IOnChain,
  IWallet,
  IWrapNativeTokenResolver,
} from '@1inch-community/models'
import { encodeFunctionData, Hash, parseAbi, WriteContractParameters } from 'viem'
import { BlockTimeCache, getWrapperNativeToken } from '../../chain'

const ERC20_WRAP_TOKEN_ABI = parseAbi(['function deposit() public payable'])

export class WrapNativeTokenResolverImpl implements IWrapNativeTokenResolver {
  private readonly estimateCache = new BlockTimeCache<string, string>()
  private readonly DEPOSIT_CACHE_KEY = 'deposit-estimate'

  constructor(
    private readonly onChain: IOnChain,
    private readonly wallet: IWallet,
    private readonly api: ICryptoAssetDataProvider
  ) {}

  async canWrap(chainId: ChainId, amount: IBigFloat): Promise<boolean> {
    try {
      if (amount.isZero() || amount.isNegative()) {
        return false
      }

      await this.estimate(chainId, amount)
      return true
    } catch (e) {
      console.warn('Cannot wrap native token:', e)
      return false
    }
  }

  async wrap(chainId: ChainId, amount: IBigFloat): Promise<Hash> {
    if (amount.isZero() || amount.isNegative()) {
      throw new Error('amount must be more than 0')
    }

    const walletAddress = await this.wallet.data.getActiveAddress()

    if (!walletAddress) {
      throw new Error('Connect wallet before')
    }

    const canWrapToken = await this.canWrap(chainId, amount)
    if (!canWrapToken) {
      throw new Error('Cannot wrap native token')
    }

    const nativeToken = getWrapperNativeToken(chainId)
    const amountBigInt = amount.toWei(nativeToken.decimals)

    const wcp: WriteContractParameters = {
      account: walletAddress,
      chain: undefined,
      abi: ERC20_WRAP_TOKEN_ABI,
      address: nativeToken.address,
      functionName: 'deposit',
      args: [],
      value: amountBigInt,
    }

    const hash = await this.wallet.writeContract(wcp)
    await this.onChain.waitTransaction(chainId, hash)

    return hash
  }

  public async estimate(chainId: ChainId, amount: IBigFloat): Promise<IBigFloat> {
    const nativeToken = getWrapperNativeToken(chainId)
    const existedEstimate = this.estimateCache.get(chainId, this.DEPOSIT_CACHE_KEY)

    if (existedEstimate !== null) {
      return BigFloat.fromBigInt(BigInt(existedEstimate), nativeToken.decimals)
    }

    await this.checkCurrentWalletNetwork(chainId)

    const amountBigInt = amount.toWei(nativeToken.decimals)
    const walletAddress = await this.wallet.data.getActiveAddress()
    const client = await this.onChain.getClient(chainId)

    if (!walletAddress) {
      throw new Error('Connect wallet before')
    }

    const result = await client.estimateGas({
      account: walletAddress,
      to: nativeToken.address,
      value: amountBigInt,
      data: encodeFunctionData({
        abi: ERC20_WRAP_TOKEN_ABI,
        functionName: 'deposit',
        args: [],
      }),
    })

    const gasPrice = await this.api.getGasPrice(chainId)
    if (!gasPrice) {
      throw new Error('gas price unknown')
    }

    const gasUnits = BigFloat.fromBigInt(result, 18)
    const amountTxFee = gasUnits.times(
      BigFloat.from(gasPrice.high.maxFeePerGas).plus(
        BigFloat.from(gasPrice.high.maxPriorityFeePerGas)
      )
    )

    this.estimateCache.set(
      chainId,
      this.DEPOSIT_CACHE_KEY,
      amountTxFee.toWei(nativeToken.decimals).toString()
    )

    return amountTxFee
  }

  private async checkCurrentWalletNetwork(chainId: ChainId): Promise<void> {
    const walletChain = await this.wallet.data.getWalletChainId()

    if (chainId !== walletChain) {
      throw new Error(`Change wallet chain to ${chainId} before`)
    }
  }
}
