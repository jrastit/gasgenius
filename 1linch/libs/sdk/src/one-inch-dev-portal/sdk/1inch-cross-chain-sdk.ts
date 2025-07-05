import { IApplicationContext, IProxyClient, IWallet } from '@1inch-community/models'
import type { EIP712TypedData, SDK } from '@1inch/cross-chain-sdk'
import { Address, isAddressEqual } from 'viem'

export class OneInchCrossChainSDK {
  private static instance: SDK

  constructor(private readonly appContext: IApplicationContext) {}

  async getInstance(): Promise<SDK> {
    if (!OneInchCrossChainSDK.instance) {
      OneInchCrossChainSDK.instance = await buildFusionPlusSDK(
        this.appContext.isEmbedded ? '/' : '/proxy/direct/fusion-plus',
        this.appContext.wallet,
        this.appContext.api.getProxyClient()
      )
    }

    return OneInchCrossChainSDK.instance
  }
}

async function buildFusionPlusSDK(
  host: string,
  walletController: IWallet,
  proxyClient: IProxyClient
) {
  const { SDK } = await import('@1inch/cross-chain-sdk')
  return new SDK({
    url: host,
    httpProvider: proxyClient,
    blockchainProvider: {
      signTypedData: async (
        walletAddress: Address,
        typedData: EIP712TypedData
      ): Promise<string> => {
        const activeWalletAddress = await walletController.data.getActiveAddress()
        if (!activeWalletAddress || !isAddressEqual(activeWalletAddress, walletAddress)) {
          throw new Error('')
        }
        return await walletController.signTypedData(typedData as any)
      },
      ethCall: async (): Promise<string> => {
        return ''
      },
    },
  })
}
