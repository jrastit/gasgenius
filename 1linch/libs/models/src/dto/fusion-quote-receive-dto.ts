enum PresetEnum {
  fast = 'fast',
  medium = 'medium',
  slow = 'slow',
  custom = 'custom',
}

interface Cost {
  usd: {
    fromToken: string
    toToken: string
  }
}

export interface RawPresetData {
  auctionDuration: number
  startAuctionIn: number
  bankFee: string
  initialRateBump: number
  auctionStartAmount: string
  auctionEndAmount: string
  tokenFee: string
  points: {
    delay: number
    coefficient: number
  }[]
  allowPartialFills: boolean
  allowMultipleFills: boolean
  gasCost: {
    gasBumpEstimate: number
    gasPriceEstimate: string
  }
  exclusiveResolver: string | null
}

export interface RawQuoterResponse {
  fromTokenAmount: string
  presets: {
    fast: RawPresetData
    medium: RawPresetData
    slow: RawPresetData
    custom?: RawPresetData
  }
  recommended_preset: PresetEnum
  toTokenAmount: string
  prices: Cost
  volume: Cost
  settlementAddress: string
  whitelist: string[]
  quoteId: string | null
  autoK: number
  fee: {
    receiver: string
    bps: number
    whitelistDiscountPercent: number
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface QuoterRequestParams {
  fromTokenAddress: string
  toTokenAddress: string
  amount: string
  walletAddress: string
  enableEstimate?: boolean
  permit?: string
  integratorFee?: {
    receiver: string
    value: unknown
    share: unknown
  }
  source?: string
  isPermit2?: boolean
}

export interface RawQuoterRequest {
  readonly fromTokenAddress: string
  readonly toTokenAddress: string
  readonly amount: string
  readonly walletAddress: string
  readonly enableEstimate: boolean
  readonly permit: string | undefined
  readonly integratorFee?: {
    receiver: string
    value: unknown
    share: unknown
  }
  readonly source: string
  readonly isPermit2: boolean
}

export interface FusionQuoteReceiveDto {
  params: RawQuoterRequest
  response: RawQuoterResponse
}
