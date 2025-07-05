import { VitePWAOptions } from 'vite-plugin-pwa'
import { manifest } from './manifest'

export default function vitePwaConfig(baseHref: string, isProduction: boolean = false) {
  return {
    registerType: 'autoUpdate',
    manifest: manifest(baseHref),
    devOptions: {
      enabled: !isProduction,
      disableRuntimeConfig: !isProduction,
    },
    workbox: {
      skipWaiting: true,
      clientsClaim: true,
      disableDevLogs: !isProduction,
      runtimeCaching: [
        {
          urlPattern: ({ url }: { url: URL }) =>
            url.origin !== self.location.origin && /\.(png|jpg|jpeg|svg|gif)$/.test(url.pathname),
          handler: 'CacheFirst',
          options: {
            cacheName: 'external-images',
            expiration: {
              maxEntries: 1500,
              maxAgeSeconds: 60 * 60 * 24 * 90, // 90 days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: ({ url }: { url: URL }) =>
            url.origin === self.location.origin && /\.(woff2)$/.test(url.pathname),
          handler: 'CacheFirst',
          options: {
            cacheName: 'fonts',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 360, // 360 days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: /.*\.svg-.*\.js(\?.*)?$/,
          handler: isProduction ? 'CacheFirst' : 'StaleWhileRevalidate',
          options: {
            cacheName: 'js-svg-templates',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: /^(?!.*\.svg-.*\.js$).*\.js(\?.*)?$/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'js-bundles',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
  } satisfies Partial<VitePWAOptions>
}
