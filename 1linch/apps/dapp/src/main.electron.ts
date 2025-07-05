import { bootstrapApplication } from '@1inch-community/integration-layer/application'

declare const __APP_VERSION__: string
declare const __DEV_PORTAL_HOST__: string
declare const __WALLET_CONNECT_PROJECT_ID__: string
declare const __CLOUDFLARE_TURNSTILE_SITE_KEY__: string

bootstrapApplication(() => import('./app.element'), {
  oneInchDevPortalHost: __DEV_PORTAL_HOST__,
  walletConnectProjectId: __WALLET_CONNECT_PROJECT_ID__,
  appVersion: __APP_VERSION__,
  cloudflareTurnstileSiteKey: __CLOUDFLARE_TURNSTILE_SITE_KEY__,
}).catch(console.error)
