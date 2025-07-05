import { ApplicationContext } from '@1inch-community/core/application-context'
import {
  EmbeddedBootstrapConfig,
  IAmountDataSource,
  IEnvironment,
  SwapSettings,
} from '@1inch-community/models'
import { GlobalEmbeddedContextElement } from './global-embedded-context.element'

export async function bootstrapApplicationContext(config: EmbeddedBootstrapConfig) {
  const env: IEnvironment = {
    production: true,
    oneInchDevPortalHost: '',
    walletConnectProjectId: '',
  }
  const embeddedGlobalContext = document.createElement(GlobalEmbeddedContextElement.tagName)

  const GlobalApplicationContext = new ApplicationContext(
    {
      walletFactory: () =>
        import('@1inch-community/sdk/wallet').then(
          (m) => new m.ConnectWalletEmbeddedController(config)
        ),
      tokenControllerFactory: () =>
        import('@1inch-community/sdk/tokens').then((m) => new m.TokenController()),
      notificationsManagerFactory: () =>
        import('@1inch-community/widgets/notifications').then((m) => new m.NotificationsManager()),
      i18nManagerFactory: () =>
        import('@1inch-community/core/lit-utils').then(
          (m) => new m.I18nEmbeddedManager(config.locale, embeddedGlobalContext)
        ),
      themesManagerFactory: () =>
        import('@1inch-community/core/theme').then((m) => new m.ThemeEmbeddedManager()),
      storageManagerFactory: () => import('@1inch-community/core/storage').then((m) => m.storage),
      tokenRateProviderFactory: () =>
        import('@1inch-community/sdk/tokens').then((m) => m.buildDefaultTokenRateProvider()),
      apiFactory: () =>
        import('@1inch-community/sdk/one-inch-dev-portal').then(
          (m) => new m.OneInchDevPortalCrossChainPublicProxyAdapter()
        ),
      loggerFactory: () =>
        import('@1inch-community/core/sentry').then((m) => new m.SentryController()),
      turnstileFactory: () =>
        import('@1inch-community/core/turnstile').then((m) => new m.TurnstileController()),
      onChainFactory: () =>
        import('@1inch-community/sdk/chain').then((m) => new m.OnChainManager()),
      settingsFactory: () =>
        import('@1inch-community/core/settings').then((m) => new m.SettingsEmbeddedManager(config)),
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
          // permit2TransferResolver
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
    },
    true
  )
  await GlobalApplicationContext.init()
  await embeddedGlobalContext.setContext(GlobalApplicationContext)
  return [embeddedGlobalContext, GlobalApplicationContext] as const
}
