export interface RawPlusQuoterRequest {
  readonly srcChain: number
  readonly dstChain: number
  readonly srcTokenAddress: string
  readonly dstTokenAddress: string
  readonly amount: string
  readonly walletAddress: string
  readonly enableEstimate: boolean
  readonly permit: string | undefined
  readonly fee: number | undefined
  readonly source: string
  readonly isPermit2: boolean
}

export interface RawPlusPresetData {
  auctionDuration: number
  startAuctionIn: number
  initialRateBump: number
  auctionStartAmount: string
  startAmount: string
  auctionEndAmount: string
  costInDstToken: string
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
  secretsCount: number
}

enum PresetEnum {
  fast = 'fast',
  medium = 'medium',
  slow = 'slow',
  custom = 'custom',
}

interface Cost {
  usd: {
    srcToken: string
    dstToken: string
  }
}

interface TimeLocksRaw {
  srcWithdrawal: number
  srcPublicWithdrawal: number
  srcCancellation: number
  srcPublicCancellation: number
  dstWithdrawal: number
  dstPublicWithdrawal: number
  dstCancellation: number
}

export interface RawPlusQuoterResponse {
  quoteId: string | null
  srcTokenAmount: string
  dstTokenAmount: string
  presets: {
    fast: RawPlusPresetData
    medium: RawPlusPresetData
    slow: RawPlusPresetData
    custom?: RawPlusPresetData
  }
  srcEscrowFactory: string
  dstEscrowFactory: string
  recommendedPreset: PresetEnum
  prices: Cost
  volume: Cost
  whitelist: string[]
  timeLocks: TimeLocksRaw
  srcSafetyDeposit: string
  dstSafetyDeposit: string
  autoK: number
}

export interface FusionPlusQuoteReceiveDto {
  params: RawPlusQuoterRequest
  response: RawPlusQuoterResponse
}
