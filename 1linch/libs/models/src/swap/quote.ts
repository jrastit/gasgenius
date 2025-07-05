export interface IQuote {
  toTokenAmount: string
  recommendedPresetName: string
  presets: Record<string, { auctionEndAmount: string; auctionDuration: number }>
  autoSlippage: number
}
