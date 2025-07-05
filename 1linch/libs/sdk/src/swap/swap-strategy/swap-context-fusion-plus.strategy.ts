import { BigFloat } from '@1inch-community/core/math'
import {
  EmptyResult,
  FusionPlusQuoteReceiveDto,
  IAmountDataSource,
  IBigFloat,
  IOrderRepository,
  ISwapContextStrategy,
  ISwapContextStrategyDataSnapshot,
  IToken,
  ITokenTransferRequirementResolver,
  ITransferRequirementResolver,
  IWallet,
  IWrapNativeTokenResolver,
  OptionValueType,
  OrderStatus,
  Pair,
  Rate,
  RateSource,
  ResolverActions,
  ResolverStep,
  StrategyOptionType,
  SwapOrderStatus,
  SwapSettings,
  SwapSnapshot,
} from '@1inch-community/models'
import {
  OrderStatus as FusionOrderStatus,
  HashLock,
  OrderStatusResponse,
  QuoteParams,
  ReadyToAcceptSecretFills,
  SDK,
  SupportedChains,
} from '@1inch/cross-chain-sdk'
import type { Address, Hash, Hex } from 'viem'
import {
  getChainById,
  getOneInchRouterV6ContractAddress,
  getWrapperNativeToken,
  getWrapperNativeTokenAddress,
  isNativeToken,
} from '../../chain'
import {
  FusionPlusQuoteMapper,
  OneInchCrossChainSDK,
  OneInchSdkPermit2Converter,
} from '../../one-inch-dev-portal'
import { SingResult } from '../transfer-requirement'

interface Secret {
  hash: string
  secret: string
}

export class SwapContextFusionPlusStrategy
  implements ISwapContextStrategy<FusionPlusQuoteReceiveDto>
{
  readonly name: string = 'FusionPlus'

  private static supportChainIds = new Set<number>(SupportedChains.map((item) => item))

  constructor(
    private readonly crossChainSDK: OneInchCrossChainSDK,
    private readonly wallet: IWallet,
    private readonly orderRepository: IOrderRepository,
    private readonly amountDataSource: IAmountDataSource,
    private readonly settings: SwapSettings,
    private readonly tokenTransferRequirementsResolver: ITokenTransferRequirementResolver,
    private readonly wrapNativeTokenResolver: IWrapNativeTokenResolver,
    private readonly permit2RequirementResolver?: ITransferRequirementResolver<string, EmptyResult>
  ) {}

  async supportSwap(pair: Pair, address: Address | null): Promise<boolean> {
    return (
      address !== null &&
      pair.source.chainId !== pair.destination.chainId &&
      SwapContextFusionPlusStrategy.supportChainIds.has(pair.source.chainId) &&
      SwapContextFusionPlusStrategy.supportChainIds.has(pair.destination.chainId)
    )
  }

  async swap(swapSnapshot: SwapSnapshot<FusionPlusQuoteReceiveDto>): Promise<Hash> {
    const { walletAddress, rawResponseData, sourceToken, destinationToken } = swapSnapshot
    const sdk = await this.crossChainSDK.getInstance()

    if (!walletAddress) {
      throw new Error('')
    }

    const quote = FusionPlusQuoteMapper.toDomain(rawResponseData)

    if (!quote.quoteId) {
      throw new Error('quoter has not returned quoteId')
    }

    const preset = quote.recommendedPreset
    const presetConfig = quote.presets[preset]!
    const secretsCount = presetConfig.secretsCount
    const [hashLock, secrets] = this.generateSecrets(secretsCount)
    const secretHashes = secrets.map((item) => item.hash)

    const { hash, quoteId, order } = await sdk.createOrder(quote, {
      walletAddress,
      hashLock,
      preset,
      // source, - we want to set some source aka NameOfService
      secretHashes,
      permit: rawResponseData.params.permit,
      isPermit2: rawResponseData.params.isPermit2,
    })

    await sdk.submitOrder(sourceToken.chainId.valueOf(), order, quoteId, secretHashes)

    await this.orderRepository.saveOrder({
      hash: hash as Hash,
      srcTokenAddress: sourceToken.address,
      srcTokenChainId: sourceToken.chainId,
      dstTokenAddress: destinationToken.address,
      dstTokenChainId: destinationToken.chainId,
      strategyName: this.name,
      account: walletAddress,
    })

    this.finalizeEscrowSecretsProcess(sdk, hash, secrets).catch((e) => console.warn(e))

    return hash as Hash
  }

  async prepareSwap(
    swapSnapshot: SwapSnapshot<FusionPlusQuoteReceiveDto>
  ): Promise<ResolverActions> {
    const { sourceToken, destinationToken, walletAddress, sourceTokenAmount } = swapSnapshot
    const isSupportExchange = await this.supportSwap(
      {
        source: sourceToken,
        destination: destinationToken,
      },
      walletAddress
    )

    if (!walletAddress) {
      throw new Error('connect wallet before')
    }

    if (!isSupportExchange) {
      throw new Error(`Strategy ${this.name} not support exchange by presented pair/chain`)
    }

    const requirements = await this.tokenTransferRequirementsResolver.provideRequirements(
      walletAddress,
      sourceToken,
      sourceTokenAmount
    )

    if (
      getWrapperNativeTokenAddress(sourceToken.chainId) === sourceToken.address &&
      sourceToken.isInternalWrapToken
    ) {
      const wrapStep: ResolverStep<string, EmptyResult> = {
        alias: 'Wrap',
        wait: async () => {
          await this.wrapNativeTokenResolver.wrap(sourceToken.chainId, sourceTokenAmount)
          return {}
        },
      }

      return [wrapStep, ...requirements]
    }

    return requirements
  }

  async getDataSnapshot(
    pair: Pair,
    amount: IBigFloat,
    walletAddress: Address | null,
    finalize?: boolean
  ): Promise<ISwapContextStrategyDataSnapshot<FusionPlusQuoteReceiveDto>> {
    const sdk = await this.crossChainSDK.getInstance()
    let srcToken = pair.source
    const srcTokenAmount = amount
    const dstToken = pair.destination

    const srcChainId = srcToken?.chainId
    const dstChainId = dstToken?.chainId

    if (walletAddress === null || srcTokenAmount.isZero()) {
      throw new Error('')
    }

    const isSupportExchange = await this.supportSwap(
      {
        source: srcToken,
        destination: dstToken,
      },
      walletAddress
    )

    if (!isSupportExchange) {
      throw new Error(`Strategy ${this.name} not support exchange by presented pair/chain`)
    }

    const balance = await this.amountDataSource.getMaxAmount()

    if (srcTokenAmount.dividedBy(balance).isNegative()) {
      throw new Error('')
    }

    if (isNativeToken(srcToken.address)) {
      srcToken = getWrapperNativeToken(srcChainId)
    }

    const permit2Sig = await this.checkPermit2Requirements(srcToken, walletAddress, srcTokenAmount)

    const params: QuoteParams = {
      srcChainId: srcChainId.valueOf(),
      dstChainId: dstChainId.valueOf(),
      srcTokenAddress: srcToken.address,
      dstTokenAddress: dstToken.address,
      amount: srcTokenAmount.toWei(srcToken.decimals).toString(),
      enableEstimate: finalize,
      walletAddress: walletAddress.toString(),
      permit: permit2Sig,
      isPermit2: !!permit2Sig,
    }

    const quote = await sdk.getQuote(params)
    const preset = quote.recommendedPreset
    const presetConfig = quote.getPreset(preset)

    const marketPrice = BigFloat.fromBigInt(quote.dstTokenAmount, dstToken.decimals)

    const rate = marketPrice.dividedBy(srcTokenAmount)
    const revertedRate = srcTokenAmount.dividedBy(marketPrice)

    const rateData: Rate = {
      source: RateSource.fusionPlus,
      rate,
      revertedRate,
      isReverted: false,
      sourceToken: srcToken,
      destinationToken: dstToken,
    }

    const slippageSettings = this.settings.slippage
    let minReceive = BigFloat.fromBigInt(presetConfig.auctionEndAmount, dstToken.decimals)
    if (slippageSettings.value !== null) {
      const [slippage] = slippageSettings.value
      const percentAmount = BigFloat.from(slippage).times(marketPrice).dividedBy(BigFloat.from(100))
      minReceive = marketPrice.minus(percentAmount)
    }

    const options: Partial<OptionValueType> = {
      [StrategyOptionType.RATE]: rateData,
      [StrategyOptionType.SLIPPAGE]: quote.slippage,
      [StrategyOptionType.AUCTION_TIME]: Number(presetConfig.auctionDuration),
      [StrategyOptionType.MIN_RECEIVE]: minReceive,
      [StrategyOptionType.NETWORK_FEE]: BigFloat.zero(),
    }

    return {
      walletAddress,
      sourceToken: srcToken,
      destinationToken: dstToken,
      sourceTokenAmount: srcTokenAmount,
      destinationTokenAmount: marketPrice,
      options,
      rate: rateData,
      strategyName: this.name,
      rawResponseData: FusionPlusQuoteMapper.toDto(params, quote),
    }
  }

  async getOrderStatus(orderHash: Hash): Promise<SwapOrderStatus> {
    const sdk = await this.crossChainSDK.getInstance()
    try {
      const order = await this.orderRepository.getOrder(orderHash)
      if (order === null) {
        throw new Error('Order not found')
      }
      const result = await sdk.getOrderStatus(orderHash)
      const convertStatus = (status: FusionOrderStatus): OrderStatus => {
        switch (status) {
          case FusionOrderStatus.Pending:
            return OrderStatus.Pending

          case FusionOrderStatus.Refunded:
            return OrderStatus.Executed

          case FusionOrderStatus.Expired:
            return OrderStatus.Expired

          case FusionOrderStatus.Cancelled:
            return OrderStatus.Cancelled

          default:
            return OrderStatus.Failed
        }
      }

      return {
        status: convertStatus(result.status),
        makerTraits: result.order.makerTraits,
        fromTokenChainId: order.srcTokenChainId,
        toTokenChainId: order.dstTokenChainId,
        fromTokenAddress: order.srcTokenAddress,
        toTokenAddress: order.dstTokenAddress,
        takingAmount: BigInt(result.order.takingAmount),
        makingAmount: BigInt(result.order.makingAmount),
        auctionDuration: result.auctionDuration,
        auctionStartDate: result.auctionStartDate,
      }
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  async cancelOrder(orderHash: Hash): Promise<Hash | null> {
    const orderData = await this.orderRepository.getOrder(orderHash)

    if (!orderData || orderData.strategyName !== this.name) {
      return null
    }

    const sdk = await this.crossChainSDK.getInstance()

    try {
      const order = await sdk.getOrderStatus(orderHash)

      if (!order || order.status === OrderStatus.Cancelled || order.cancelTx) {
        throw new Error('Order not found or already cancelled')
      }

      const calldata = await sdk.buildCancelOrderCallData(orderHash)
      const routerAddress = getOneInchRouterV6ContractAddress(orderData.srcTokenChainId)
      const currentChain = await this.wallet.data.getWalletChainId()
      const walletAddress = await this.wallet.data.getActiveAddress()

      if (currentChain !== orderData.srcTokenChainId || walletAddress !== orderData.account) {
        throw new Error('Change wallet or network')
      }

      const hash = await this.wallet.sendTransaction({
        chain: getChainById(currentChain),
        to: routerAddress,
        account: walletAddress,
        data: calldata as Hex,
      })

      await this.orderRepository.deleteOrder(orderHash)
      return hash
    } catch (e) {
      console.warn(e)
    }
    return null
  }

  private async finalizeEscrowSecretsProcess(sdk: SDK, orderHash: string, secrets: Secret[]) {
    let secretsToShareResponse: ReadyToAcceptSecretFills | undefined
    let statusResponse: OrderStatusResponse | undefined

    while (true) {
      try {
        secretsToShareResponse = await sdk.getReadyToAcceptSecretFills(orderHash)
      } catch (e) {
        secretsToShareResponse = undefined
        console.warn(e)
      }

      try {
        statusResponse = await sdk.getOrderStatus(orderHash)
      } catch (e) {
        statusResponse = undefined
        console.warn(e)
      }

      const status = statusResponse?.status

      if (status === OrderStatus.Executed) {
        break
      }

      if (
        status === OrderStatus.Expired ||
        status === OrderStatus.Refunded ||
        status === OrderStatus.Cancelled
      ) {
        throw new Error(`Order break by ${status} reason`)
      }

      if (!secretsToShareResponse || secretsToShareResponse.fills.length === 0) {
        await new Promise((resolve) => setTimeout(() => resolve(undefined), 1000))
        continue
      }

      for (const { idx } of secretsToShareResponse.fills) {
        await sdk.submitSecret(orderHash, secrets[idx].secret)
      }
    }
  }

  private generateSecrets(secretsCount: number): [HashLock, Secret[]] {
    const secrets = this.generateRawSecrets(secretsCount)
    const hashLock =
      secrets.length === 1
        ? HashLock.forSingleFill(secrets[0])
        : HashLock.forMultipleFills(HashLock.getMerkleLeaves(secrets))

    return [
      hashLock,
      secrets.map<Secret>((secret) => ({
        secret,
        hash: HashLock.hashSecret(secret),
      })),
    ]
  }

  private generateRawSecrets(count: number): string[] {
    return Array.from({ length: count }, () => {
      const randomBuffer = new Uint8Array(32)
      crypto.getRandomValues(randomBuffer)

      return (
        '0x' +
        Array.from(randomBuffer)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
      )
    })
  }

  private async checkPermit2Requirements(
    sourceToken: IToken,
    walletAddress: Address,
    sourceTokenAmount: IBigFloat
  ): Promise<string | undefined> {
    try {
      const resolverProvidedValue = await this.permit2RequirementResolver?.requirementProvided(
        walletAddress,
        sourceToken,
        sourceTokenAmount
      )

      if (resolverProvidedValue && resolverProvidedValue instanceof SingResult) {
        return OneInchSdkPermit2Converter(
          walletAddress,
          resolverProvidedValue.permit,
          resolverProvidedValue.signature
        )
      }
    } catch (e) {
      console.warn(e)
    }
  }
}
