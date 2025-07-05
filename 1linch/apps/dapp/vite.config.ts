import dotenv from 'dotenv'
import * as process from 'node:process'
import path from 'path'
import { defineConfig, UserConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import { ngrok } from 'vite-plugin-ngrok'
import preload from 'vite-plugin-preload'
import { VitePWA } from 'vite-plugin-pwa'
import { version } from '../../package.json'
import vitePwaConfig from './vite-pwa.config'

const envPath = path.dirname(path.dirname(__dirname))
dotenv.config({
  path: path.join(envPath, '.env'),
})

export default defineConfig(({ mode }) => {
  const isProduction = process.env['DAPP_IS_PRODUCTION']
    ? process.env['DAPP_IS_PRODUCTION'] === 'true'
    : mode === 'production'

  const electronBundle = process.env['ELECTRON_BUNDLE'] === 'true'
  const outDir = electronBundle
    ? path.join(path.dirname(__dirname), 'electron-dapp', 'out', 'render')
    : path.join('dist', 'dapp')

  const baseHref = process.env['BASE_HREF'] ?? (electronBundle ? './' : '/')
  const ngrokToken = process.env['NGROK_AUTH_TOKEN_IN_HERE']
  const cloudFlareTurnstileKey = JSON.stringify(process.env.CLOUDFLARE_TURNSTILE_SITE_KEY)

  console.log('mode is ', isProduction ? 'production' : 'development')
  console.log('dApp version ', version)
  console.log('baseHref', baseHref)
  console.log('CLOUDFLARE_TURNSTILE_SITE_KEY', cloudFlareTurnstileKey)
  if (electronBundle) {
    console.log('Build Electron bundle')
  }

  return {
    appType: 'spa',
    base: baseHref,
    root: __dirname,

    define: {
      global: {},
      'process.env': JSON.stringify({}),
      __PRODUCTION__: JSON.stringify(isProduction),
      __APP_VERSION__: JSON.stringify(version),
      __DEV_PORTAL_HOST__: JSON.stringify(process.env.ONE_INCH_DEV_PORTAL_HOST),
      __WALLET_CONNECT_PROJECT_ID__: JSON.stringify(process.env.WALLET_CONNECT_PROJECT_ID),
      __CLOUDFLARE_TURNSTILE_SITE_KEY__: cloudFlareTurnstileKey,
    },

    resolve: {
      alias: {
        assert: 'assert',
        util: 'util',
        process: 'process',
      },
    },

    server: {
      port: 4200,
      host: '0.0.0.0',
    },

    preview: {
      port: 4300,
      host: '0.0.0.0',
    },

    optimizeDeps: {
      include: ['tslib'],
      force: true,
    },

    plugins: [
      ngrokToken ? ngrok(ngrokToken) : undefined,
      electronBundle ? undefined : VitePWA(vitePwaConfig(baseHref, isProduction)),
      electronBundle ? undefined : preload({ mode: 'prefetch' }),
      createHtmlPlugin({
        inject: {
          data: {
            baseHref,
          },
        },
      }),
    ].filter(Boolean),

    build: {
      outDir: outDir,
      chunkSizeWarningLimit: 700,
      reportCompressedSize: true,
      sourcemap: true,
      terserOptions: {
        format: {
          comments: false,
        },
        compress: isProduction,
      },
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, electronBundle ? 'index.electron.html' : 'index.html'),
        },
      },
    },
    esbuild: { legalComments: 'none' },
  } satisfies UserConfig
})
