import { IApplicationContext, ILogger } from '@1inch-community/models'
import * as Sentry from '@sentry/browser'

export class SentryController implements ILogger {
  async init(context: IApplicationContext): Promise<void> {
    const production = context.environment.get('production')
    if (!production) return
    if (!Sentry.isInitialized()) {
      Sentry.init({
        dsn: 'https://8380a0d8cfa4e34cc5d742141c1b926f@o4506434492628992.ingest.us.sentry.io/4507944504852480',
        integrations: [Sentry.replayIntegration()],
        replaysOnErrorSampleRate: 1.0,
      })
    }

    context.wallet.data.activeAddress$.subscribe((address) => {
      Sentry.setTag('activeAddress', address)
      this.updateActiveWallet(context)
    })
    context.wallet.data.chainId$.subscribe((chainId) => {
      Sentry.setTag('activeChainId', chainId)
      this.updateActiveWallet(context)
    })
  }

  error(error: unknown) {
    Sentry.captureException(error)
  }

  private updateActiveWallet(context: IApplicationContext) {
    if (context.wallet.connectedWalletInfo === null) {
      Sentry.setTag('activeWallet', null)
      return
    }
    const { name, walletId, uuid, rdns } = context.wallet.connectedWalletInfo
    Sentry.setTag('activeWallet', [name, walletId, uuid, rdns].join(':'))
  }
}
