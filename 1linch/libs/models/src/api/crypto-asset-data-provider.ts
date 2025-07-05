import type { Address } from 'viem'
import { InitializingEntity } from '../base'
import { ChainId } from '../chain'
import { GasPriceDto, ITokenV2Dto } from '../dto'
import { IProxyClient } from './proxy-client'
import { ProxyResultBalance, ProxyResultTokenPrice } from './proxy-result'

export interface ICryptoAssetDataProvider extends InitializingEntity {
  getBalances(chainIds: ChainId[], walletAddresses: Address[]): Promise<ProxyResultBalance>
  getTokenPrice(chainIds: ChainId[]): Promise<ProxyResultTokenPrice>
  getTokenList(): Promise<ITokenV2Dto[]>
  getGasPrice(chainId: ChainId): Promise<GasPriceDto | null>
  getProxyClient(): IProxyClient
}
