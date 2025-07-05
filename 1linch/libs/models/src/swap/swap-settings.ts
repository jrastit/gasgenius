import { ISettingController } from '../settings'

export interface SwapSettings {
  slippage: ISettingController<[number, 'custom' | 'preset']>
  auctionTime: ISettingController<[number, 'custom' | 'preset']>
}
