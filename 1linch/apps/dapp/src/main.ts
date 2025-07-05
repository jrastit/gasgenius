import { bootstrapApplication } from '@1inch-community/integration-layer/application'

declare const __PRODUCTION__: boolean
declare const __APP_VERSION__: string
declare const __DEV_PORTAL_HOST__: string
declare const __WALLET_CONNECT_PROJECT_ID__: string
declare const __CLOUDFLARE_TURNSTILE_SITE_KEY__: string

bootstrapApplication(() => import('./app.element'), {
  production: __PRODUCTION__,
  oneInchDevPortalHost: __DEV_PORTAL_HOST__,
  walletConnectProjectId: __WALLET_CONNECT_PROJECT_ID__,
  appVersion: __APP_VERSION__,
  cloudflareTurnstileSiteKey: __CLOUDFLARE_TURNSTILE_SITE_KEY__,
}).catch(console.error)

import('virtual:pwa-register').then(({ registerSW }) => {
  registerSW({
    onRegisteredSW: (_: string, registration: ServiceWorkerRegistration | undefined): void => {
      console.warn('worker updated')
      registration?.update()
    },
    onNeedRefresh: () => console.warn('update ready'),
    onOfflineReady: () => console.warn('offline ready'),
  })
})
