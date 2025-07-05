import { BigFloat } from '@1inch-community/core/math'
import {
  IAmountDataSource,
  IBigFloat,
  ICryptoAssetDataProvider,
  IOnChain,
  ITokenStorage,
  IWallet,
} from '@1inch-community/models'
import { isNativeToken } from '../chain'
import { buildTokenIdByToken } from '../tokens'
import { PairHolder } from './pair-holder'

export class AmountDataSourceImpl implements IAmountDataSource {
  constructor(
    private readonly pairHolder: PairHolder,
    private readonly oneInchApiAdapter: ICryptoAssetDataProvider,
    private readonly wallet: IWallet,
    private readonly tokenStorage: ITokenStorage,
    private readonly onChain: IOnChain
  ) {}

  public async getMaxAmount(): Promise<IBigFloat> {
    const snapshot = this.pairHolder.getSnapshot('source')
    const sourceToken = snapshot.token
    const connectedWalletAddress = await this.wallet.data.getActiveAddress()
    if (!sourceToken || !connectedWalletAddress) return BigFloat.zero()
    let amount = await this.tokenStorage.getTokenBalanceById({
      tokenRecordId: buildTokenIdByToken(sourceToken),
      walletAddress: connectedWalletAddress,
    })
    if (isNativeToken(sourceToken.address)) {
      const chainId = sourceToken.chainId
      const [gasUnits, gasPriceDTO] = await Promise.all([
        this.onChain.estimateWrapNativeToken(chainId, amount),
        this.oneInchApiAdapter.getGasPrice(chainId),
      ])
      if (!gasPriceDTO) return BigFloat.zero()
      const gasPrice = gasPriceDTO.high
      const fee = gasUnits.times(
        BigFloat.from(gasPrice.maxFeePerGas).plus(BigFloat.from(gasPrice.maxPriorityFeePerGas))
      )
      amount = amount.minus(fee)
      if (amount.isNegative()) {
        amount = BigFloat.zero()
      }
    }
    return amount
  }
}
