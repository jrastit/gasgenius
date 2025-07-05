import { ApplicationContext } from '@1inch-community/core/application-context'
import { IAmountDataSource, IEnvironment, SwapSettings } from '@1inch-community/models'

let GlobalApplicationContext: ApplicationContext

export async function bootstrapApplicationContext(env: IEnvironment) {
  GlobalApplicationContext = new ApplicationContext({
    walletFactory: () =>
      import('@1inch-community/sdk/wallet').then((m) => new m.WalletController()),
    tokenControllerFactory: () =>
      import('@1inch-community/sdk/tokens').then((m) => new m.TokenController()),
    notificationsManagerFactory: () =>
      import('@1inch-community/widgets/notifications').then((m) => new m.NotificationsManager()),
    i18nManagerFactory: () =>
      import('@1inch-community/core/lit-utils').then((m) => new m.I18nManager()),
    themesManagerFactory: () =>
      import('@1inch-community/core/theme').then((m) => new m.ThemeManager()),
    storageManagerFactory: () => import('@1inch-community/core/storage').then((m) => m.storage),
    tokenRateProviderFactory: () =>
      import('@1inch-community/sdk/tokens').then((m) => m.buildDefaultTokenRateProvider()),
    apiFactory: () =>
      import('@1inch-community/sdk/one-inch-dev-portal').then(
        (m) => new m.OneInchDevPortalCrossChainPrivateProxyAdapter()
      ),
    loggerFactory: () =>
      import('@1inch-community/core/sentry').then((m) => new m.SentryController()),
    turnstileFactory: () =>
      import('@1inch-community/core/turnstile').then((m) => new m.TurnstileController()),
    onChainFactory: () => import('@1inch-community/sdk/chain').then((m) => new m.OnChainManager()),
    settingsFactory: () =>
      import('@1inch-community/core/settings').then((m) => new m.SettingsManager()),
    animationsFactory: () =>
      import('@1inch-community/core/animations').then((m) => new m.AnimationsManager()),
    environmentFactory: () =>
      import('@1inch-community/core/environment').then((m) => new m.EnvironmentController(env)),
    overlayFactory: () =>
      import('@1inch-community/ui-components/overlay').then(
        (m) => new m.OverlayController('#app-root')
      ),
    swapContextFactory: async (context) => {
      const swapModule = await import('@1inch-community/sdk/swap')

      const settings: SwapSettings = {
        slippage: context.settings.getSetting('slippage'),
        auctionTime: context.settings.getSetting('auctionTime'),
      }
      const pairHolder = new swapModule.PairHolder(context)
      const amountDataSource: IAmountDataSource = new swapModule.AmountDataSourceImpl(
        pairHolder,
        context.api,
        context.wallet,
        context.tokenStorage,
        context.onChain
      )

      const oneInchApproveTransferResolver = new swapModule.OneInchApproveTransferResolver(
        context.onChain,
        context.wallet
      )
      // todo return it when dev portal will support permit2 fully
      // const permit2TransferResolver = new swapModule.Permit2TransferResolver(context.onChain, context.wallet)

      const tokenTransferRequirementsResolver = new swapModule.TokenTransferRequirementResolver(
        [
          // permit2TransferResolver,
          oneInchApproveTransferResolver,
        ],
        oneInchApproveTransferResolver
      )

      const orderRepository = new swapModule.OrderRepositoryImpl()
      const portalSdk = await import('@1inch-community/sdk/one-inch-dev-portal')

      const nativeWrapper = new swapModule.WrapNativeTokenResolverImpl(
        context.onChain,
        context.wallet,
        context.api
      )

      const swapStrategies = swapModule.SwapStrategyFactory.createDefault(
        new portalSdk.OneInchCrossChainSDK(context),
        new portalSdk.OneInchSingleChainSDK(context),
        context.wallet,
        context.tokenRateProvider,
        orderRepository,
        amountDataSource,
        settings,
        nativeWrapper,
        tokenTransferRequirementsResolver
        // permit2TransferResolver,
      )

      const swapContext = new swapModule.SwapContext(
        context.wallet,
        context.onChain,
        settings,
        pairHolder,
        amountDataSource,
        swapStrategies,
        orderRepository
      )

      swapContext.init()
      return swapContext
    },
  })
  await GlobalApplicationContext.init()
}

export function getContext(): ApplicationContext {
  if (!GlobalApplicationContext) throw new Error('ApplicationContext not bootstrapped')
  return GlobalApplicationContext
}
