import {
  FusionQuoteReceiveDto,
  RawPresetData,
  RawQuoterRequest,
  RawQuoterResponse,
} from '@1inch-community/models'
import { Preset, PresetEnum, Quote, QuoteParams, QuoterRequest } from '@1inch/fusion-sdk'

interface QuoterRequestParams {
  fromTokenAddress: string
  toTokenAddress: string
  amount: string
  walletAddress: string
  enableEstimate?: boolean
  permit?: string
  integratorFee?: any
  source?: string
  isPermit2?: boolean
}

export class FusionQuoteMapper {
  public static toDomain(data: FusionQuoteReceiveDto): Quote {
    const requestParams: QuoterRequestParams = {
      fromTokenAddress: data.params.fromTokenAddress,
      toTokenAddress: data.params.toTokenAddress,
      amount: data.params.amount,
      walletAddress: data.params.walletAddress,
      enableEstimate: data.params.enableEstimate,
      permit: data.params.permit,
      integratorFee: data.params.integratorFee,
      source: data.params.source,
      isPermit2: data.params.isPermit2,
    }
    const request = QuoterRequest.new(requestParams)

    return new Quote(request, data.response)
  }

  public static toDto(quoteParams: QuoteParams, quote: Quote): FusionQuoteReceiveDto {
    const toJsonPreset = (preset: Preset): RawPresetData => {
      return {
        auctionDuration: Number(preset.auctionDuration),
        startAuctionIn: Number(preset.startAuctionIn),
        bankFee: preset.bankFee.toString(),
        initialRateBump: preset.initialRateBump,
        auctionStartAmount: preset.auctionStartAmount.toString(),
        auctionEndAmount: preset.auctionEndAmount.toString(),
        tokenFee: preset.tokenFee.toString(),
        points: preset.points,
        allowPartialFills: preset.allowPartialFills,
        allowMultipleFills: preset.allowMultipleFills,
        gasCost: {
          gasBumpEstimate: Number(preset.gasCostInfo.gasBumpEstimate),
          gasPriceEstimate: preset.gasCostInfo.gasPriceEstimate.toString(),
        },
        exclusiveResolver: preset.exclusiveResolver?.toString() ?? null,
      }
    }

    const response: RawQuoterResponse = {
      fromTokenAmount: quote.fromTokenAmount.toString(),
      presets: {
        fast: toJsonPreset(quote.getPreset(PresetEnum.fast)),
        medium: toJsonPreset(quote.getPreset(PresetEnum.medium)),
        slow: toJsonPreset(quote.getPreset(PresetEnum.slow)),
        custom: quote.presets[PresetEnum.custom]
          ? toJsonPreset(quote.getPreset(PresetEnum.custom))
          : undefined,
      },
      recommended_preset: quote.recommendedPreset,
      toTokenAmount: quote.toTokenAmount,
      prices: quote.prices,
      volume: quote.volume,
      settlementAddress: quote.settlementAddress.toString(),
      whitelist: quote.whitelist.map((item) => item.toString()),
      quoteId: quote.quoteId,
      autoK: quote.slippage,
      fee: {
        receiver: quote.resolverFeePreset.receiver.toString(),
        bps: Number(quote.resolverFeePreset.bps.value),
        whitelistDiscountPercent: Number(quote.resolverFeePreset.whitelistDiscountPercent.value),
      },
    }

    if (!quoteParams.walletAddress) {
      throw new Error('walletAddress must be presented')
    }

    const request: QuoterRequestParams = {
      fromTokenAddress: quoteParams.fromTokenAddress,
      toTokenAddress: quoteParams.toTokenAddress,
      amount: quoteParams.amount,
      walletAddress: quoteParams.walletAddress,
      enableEstimate: quoteParams.enableEstimate,
      permit: quoteParams.permit,
      integratorFee: quoteParams.integratorFee,
      source: quoteParams.source,
      isPermit2: quoteParams.isPermit2,
    }
    const quoterRequest = QuoterRequest.new(request)

    const params: RawQuoterRequest = {
      fromTokenAddress: quoterRequest.fromTokenAddress.toString(),
      toTokenAddress: quoterRequest.toTokenAddress.toString(),
      amount: quoterRequest.amount,
      walletAddress: quoterRequest.walletAddress.toString(),
      enableEstimate: quoterRequest.enableEstimate,
      permit: quoterRequest.permit,

      integratorFee: quoterRequest.integratorFee
        ? {
            receiver: quoterRequest.integratorFee.receiver.toString(),
            value: quoterRequest.integratorFee.value.value.toString(),
            share: quoterRequest.integratorFee.share.value.toString(),
          }
        : undefined,
      source: quoterRequest.source,
      isPermit2: quoterRequest.isPermit2,
    }

    return {
      params,
      response,
    }
  }
}
