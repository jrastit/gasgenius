import {
  FusionPlusQuoteReceiveDto,
  RawPlusQuoterRequest,
  RawPlusQuoterResponse,
} from '@1inch-community/models'
import {
  Preset,
  PresetData,
  PresetEnum,
  Quote,
  QuoteParams,
  QuoterRequest,
  QuoterRequestParams,
} from '@1inch/cross-chain-sdk'

export class FusionPlusQuoteMapper {
  public static toDomain(data: FusionPlusQuoteReceiveDto): Quote {
    const requestParams: QuoterRequestParams = {
      srcChain: data.params.srcChain,
      dstChain: data.params.dstChain,
      srcTokenAddress: data.params.srcTokenAddress,
      dstTokenAddress: data.params.dstTokenAddress,
      amount: data.params.amount,
      walletAddress: data.params.walletAddress,
      enableEstimate: data.params.enableEstimate,
      permit: data.params.permit,
      fee: data.params.fee,
      source: data.params.source,
      isPermit2: data.params.isPermit2,
    }

    const request = QuoterRequest.new(requestParams)

    return new Quote(request, data.response)
  }

  public static toDto(quoteParams: QuoteParams, quote: Quote): FusionPlusQuoteReceiveDto {
    const toJsonPreset = (preset: Preset): PresetData => {
      return {
        auctionDuration: Number(preset.auctionDuration),
        startAuctionIn: Number(preset.startAuctionIn),
        initialRateBump: preset.initialRateBump,
        auctionStartAmount: preset.auctionStartAmount.toString(),
        startAmount: preset.startAmount.toString(),
        auctionEndAmount: preset.auctionEndAmount.toString(),
        costInDstToken: preset.costInDstToken.toString(),
        points: preset.points,
        allowPartialFills: preset.allowPartialFills,
        allowMultipleFills: preset.allowMultipleFills,
        gasCost: {
          gasBumpEstimate: Number(preset.gasCostInfo.gasBumpEstimate),
          gasPriceEstimate: preset.gasCostInfo.gasPriceEstimate.toString(),
        },
        exclusiveResolver: preset.exclusiveResolver?.toString() ?? null,
        secretsCount: preset.secretsCount,
      }
    }

    const response: RawPlusQuoterResponse = {
      quoteId: quote.quoteId,
      srcTokenAmount: quote.srcTokenAmount.toString(),
      dstTokenAmount: quote.dstTokenAmount.toString(),
      presets: {
        fast: toJsonPreset(quote.getPreset(PresetEnum.fast)),
        medium: toJsonPreset(quote.getPreset(PresetEnum.medium)),
        slow: toJsonPreset(quote.getPreset(PresetEnum.slow)),
        custom: quote.presets[PresetEnum.custom]
          ? toJsonPreset(quote.getPreset(PresetEnum.custom))
          : undefined,
      },
      srcEscrowFactory: quote.srcEscrowFactory.toString(),
      dstEscrowFactory: quote.dstEscrowFactory.toString(),
      recommendedPreset: quote.recommendedPreset,
      prices: quote.prices,
      volume: quote.volume,
      whitelist: quote.whitelist.map(String),
      timeLocks: quote.timeLocks,
      srcSafetyDeposit: quote.srcSafetyDeposit.toString(),
      dstSafetyDeposit: quote.dstSafetyDeposit.toString(),
      autoK: quote.slippage,
    }

    if (!quoteParams.walletAddress) {
      throw new Error('walletAddress must be presented')
    }

    const request: QuoterRequestParams = {
      srcChain: quoteParams.srcChainId.valueOf(),
      dstChain: quoteParams.dstChainId.valueOf(),
      srcTokenAddress: quoteParams.srcTokenAddress,
      dstTokenAddress: quoteParams.dstTokenAddress,
      amount: quoteParams.amount,
      walletAddress: quoteParams.walletAddress,
      enableEstimate: quoteParams.enableEstimate,
      permit: quoteParams.permit,
      fee: quoteParams.takingFeeBps,
      source: quoteParams.source,
      isPermit2: quoteParams.isPermit2,
    }

    const quoterRequest = QuoterRequest.new(request)

    const params: RawPlusQuoterRequest = {
      srcChain: quoterRequest.srcChain.valueOf(),
      dstChain: quoterRequest.dstChain.valueOf(),
      srcTokenAddress: quoterRequest.srcTokenAddress.toString(),
      dstTokenAddress: quoterRequest.dstTokenAddress.toString(),
      amount: quoterRequest.amount.toString(),
      walletAddress: quoterRequest.walletAddress.toString(),
      enableEstimate: quoterRequest.enableEstimate,
      permit: quoterRequest.permit,
      fee: quoterRequest.fee,
      source: quoterRequest.source,
      isPermit2: quoterRequest.isPermit2,
    }

    return {
      params,
      response,
    }
  }
}
