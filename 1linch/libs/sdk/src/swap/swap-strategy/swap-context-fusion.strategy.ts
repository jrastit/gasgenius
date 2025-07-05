import { BigFloat } from '@1inch-community/core/math'
import {
  EmptyResult,
  FusionQuoteReceiveDto,
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
  Address as FusionAddress,
  OrderStatus as FusionOrderStatus,
  FusionSDK,
  NetworkEnum,
  OrderParams,
  OrderStatusResponse,
  QuoteParams,
} from '@1inch/fusion-sdk'
import type { Address, Hash, Hex } from 'viem'
import {
  getChainById,
  getOneInchRouterV6ContractAddress,
  getWrapperNativeToken,
  getWrapperNativeTokenAddress,
  isNativeToken,
} from '../../chain'
import {
  FusionQuoteMapper,
  OneInchSdkPermit2Converter,
  OneInchSingleChainSDK,
} from '../../one-inch-dev-portal'
import { SingResult } from '../transfer-requirement'

export class SwapContextFusionStrategy
  implements ISwapContextStrategy<FusionQuoteReceiveDto | null>
{
  readonly name: string = 'Fusion'

  constructor(
    private readonly chainSdk: OneInchSingleChainSDK,
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
      pair.destination.chainId === pair.source.chainId &&
      NetworkEnum[pair.source.chainId] !== undefined
    )
  }

  async swap(swapSnapshot: SwapSnapshot<FusionQuoteReceiveDto>): Promise<Hash> {
    const { sourceToken, destinationToken, sourceTokenAmount, rawResponseData, walletAddress } =
      swapSnapshot

    if (walletAddress === null) {
      throw new Error('Wallet not connected')
    }

    if (!rawResponseData) {
      throw new Error('')
    }

    const sdk = await this.chainSdk.getInstance(swapSnapshot.sourceToken.chainId)
    const quote = FusionQuoteMapper.toDomain(rawResponseData)

    if (!quote.quoteId) {
      throw new Error('quoter has not returned quoteId')
    }

    const orderParams: OrderParams = {
      walletAddress,
      fromTokenAddress: sourceToken.address,
      toTokenAddress: destinationToken.address,
      amount: sourceTokenAmount.toString(),
      preset: rawResponseData.response.recommended_preset,
    }

    const order = await quote.createFusionOrder({
      receiver: orderParams.receiver ? new FusionAddress(orderParams.receiver) : undefined,
      preset: orderParams.preset,
      nonce: orderParams.nonce,
      allowPartialFills: orderParams.allowPartialFills,
      allowMultipleFills: orderParams.allowMultipleFills,
      orderExpirationDelay: orderParams.orderExpirationDelay,
      network: swapSnapshot.sourceToken.chainId.valueOf(),
    })

    const info = await sdk.submitOrder(order, quote.quoteId)

    await this.orderRepository.saveOrder({
      hash: info.orderHash as Hash,
      srcTokenAddress: sourceToken.address,
      srcTokenChainId: sourceToken.chainId,
      dstTokenAddress: destinationToken.address,
      dstTokenChainId: destinationToken.chainId,
      strategyName: this.name,
      account: walletAddress,
    })

    this.checkOrderStatus(sdk, info.orderHash).catch((e) => console.warn(e))

    return info.orderHash as Hash
  }

  async prepareSwap(swapSnapshot: SwapSnapshot<FusionQuoteReceiveDto>): Promise<ResolverActions> {
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
    sourceTokenAmount: IBigFloat,
    walletAddress: Address | null,
    finalize?: boolean
  ): Promise<ISwapContextStrategyDataSnapshot<FusionQuoteReceiveDto>> {
    let sourceToken = pair.source
    const destinationToken = pair.destination
    const chainId = sourceToken.chainId

    if (sourceTokenAmount.isZero() || !walletAddress) {
      throw new Error('')
    }

    const isSupportExchange = await this.supportSwap(pair, walletAddress)

    if (!isSupportExchange) {
      throw new Error(`Strategy ${this.name} not support exchange by presented pair/chain`)
    }

    const sdk = await this.chainSdk.getInstance(chainId)
    const balance = await this.amountDataSource.getMaxAmount()

    if (balance.isLessThan(sourceTokenAmount)) {
      throw new Error('')
    }

    if (isNativeToken(sourceToken.address)) {
      sourceToken = getWrapperNativeToken(chainId)
    }

    const permit2Sig = await this.checkPermit2Requirements(
      sourceToken,
      walletAddress,
      sourceTokenAmount
    )

    const quoteParams: QuoteParams = {
      walletAddress: walletAddress.toString(),
      fromTokenAddress: sourceToken.address,
      toTokenAddress: destinationToken.address,
      amount: sourceTokenAmount.toWei(sourceToken.decimals).toString(),
      permit: permit2Sig,
      isPermit2: !!permit2Sig,
      enableEstimate: finalize,
    }

    const quote = await sdk.getQuote(quoteParams)

    if (quote === null) {
      throw new Error('')
    }
    const recommendedPreset = quote.recommendedPreset
    const preset = quote.getPreset(recommendedPreset)
    const autoSlippage = quote.slippage

    const marketPrice = BigFloat.fromBigInt(BigInt(quote.toTokenAmount), destinationToken.decimals)

    const rate = marketPrice.dividedBy(sourceTokenAmount)
    const revertedRate = sourceTokenAmount.dividedBy(marketPrice)

    const rateData: Rate = {
      source: RateSource.fusion,
      rate,
      revertedRate,
      isReverted: false,
      sourceToken: sourceToken,
      destinationToken: destinationToken,
    }

    const slippageSettings = this.settings.slippage
    let minReceive = BigFloat.fromBigInt(preset.auctionEndAmount, destinationToken.decimals)

    if (slippageSettings.value !== null) {
      const [slippage] = slippageSettings.value
      const percentAmount = BigFloat.from(slippage).times(marketPrice).dividedBy(BigFloat.from(100))
      minReceive = marketPrice.minus(percentAmount)
    }

    const options: Partial<OptionValueType> = {
      [StrategyOptionType.RATE]: rateData,
      [StrategyOptionType.SLIPPAGE]: autoSlippage,
      [StrategyOptionType.AUCTION_TIME]: Number(preset.auctionDuration),
      [StrategyOptionType.MIN_RECEIVE]: minReceive,
      [StrategyOptionType.NETWORK_FEE]: BigFloat.zero(),
    }

    return {
      walletAddress,
      sourceToken,
      destinationToken,
      sourceTokenAmount,
      destinationTokenAmount: marketPrice,
      options,
      rate: rateData,
      strategyName: this.name,
      rawResponseData: FusionQuoteMapper.toDto(quoteParams, quote),
    }
  }

  async getOrderStatus(orderHash: Hash): Promise<SwapOrderStatus> {
    const order = await this.orderRepository.getOrder(orderHash)
    if (order === null) {
      throw new Error('Order not found')
    }
    const sdk = await this.chainSdk.getInstance(order.dstTokenChainId)
    try {
      const result = await sdk.getOrderStatus(orderHash)
      const convertStatus = (status: FusionOrderStatus): OrderStatus => {
        switch (status) {
          case FusionOrderStatus.Pending:
          case FusionOrderStatus.PartiallyFilled:
            return OrderStatus.Pending

          case FusionOrderStatus.Filled:
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

    const sdk = await this.chainSdk.getInstance(orderData.srcTokenChainId)

    try {
      const order = await sdk.getOrderStatus(orderHash)

      if (order.status === FusionOrderStatus.Cancelled || order.cancelTx) {
        throw new Error('Order already cancelled')
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

  private async checkOrderStatus(sdk: FusionSDK, orderHash: string): Promise<void> {
    let statusResponse: OrderStatusResponse | undefined

    while (true) {
      try {
        statusResponse = await sdk.getOrderStatus(orderHash)
      } catch (e) {
        statusResponse = undefined
        console.warn(e)
      }

      if (
        !statusResponse ||
        statusResponse.status === FusionOrderStatus.Pending ||
        statusResponse.status === FusionOrderStatus.PartiallyFilled
      ) {
        await new Promise((resolve) => setTimeout(() => resolve(undefined), 1000))
      } else if (statusResponse.status === FusionOrderStatus.Filled) {
        break
      } else {
        throw new Error(`Order break by ${statusResponse.status} reason`)
      }
    }
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
