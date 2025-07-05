import { IApplicationContext, ITurnstileController } from '@1inch-community/models'
import { CacheActivePromise } from '../decorators'
import { lazyAppContext } from '../lazy'
import { appendStyle } from '../lit-utils'

const CALLBACK_NAME = '__turnstile_callback__'

const CONTAINER_ID = 'turnstile-container'

const MAX_RETRY_COUNT = 4

export interface TurnstileOptions {
  sitekey: string
  action?: string
  cData?: string
  callback?: (token: string) => void
  retry?: string
  theme?: 'light' | 'dark' | 'auto'
  tabindex?: number
  'refresh-expired'?: 'auto' | 'manual' | 'never'
  'retry-interval'?: string
  'error-callback'?: (err: string) => void
  'expired-callback'?: () => void
  'before-interactive-callback'?: () => void
  'after-interactive-callback'?: () => void
}

declare global {
  interface Window {
    [CALLBACK_NAME]: () => void
    turnstile?: {
      render: (idOrContainer: string | HTMLElement, options: TurnstileOptions) => string
      reset: (widgetIdOrContainer: string | HTMLElement) => void
      getResponse: (widgetIdOrContainer: string | HTMLElement) => string | undefined
      remove: (widgetIdOrContainer: string | HTMLElement) => void
    }
  }
}

export class TurnstileController implements ITurnstileController {
  private readonly context = lazyAppContext('TurnstileController')
  private script: HTMLScriptElement | null = null

  async init(context: IApplicationContext): Promise<void> {
    this.context.set(context)
  }

  @CacheActivePromise()
  async getToken(): Promise<string> {
    await this.initScript()
    const container = this.renderContainer()
    return await this.renderToken(container)
  }

  private async initScript(): Promise<void> {
    if (this.script) return
    return await new Promise((resolve) => {
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.async = true
      script.defer = true
      script.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=${CALLBACK_NAME}`

      Reflect.set(window, CALLBACK_NAME, resolve)
      document.head.appendChild(script)
    })
  }

  private renderContainer(): HTMLDivElement {
    const container = document.createElement('div')
    appendStyle(container, {
      position: 'absolute',
      zIndex: '-1',
      top: '-1000px',
      left: '-1000px',
    })
    container.id = CONTAINER_ID
    document.body.appendChild(container)
    return container
  }

  private async renderToken(container: HTMLDivElement): Promise<string> {
    const siteKey = this.context.value.environment.get('cloudflareTurnstileSiteKey') ?? null
    if (!siteKey) throw new Error('TurnstileController.renderToken Error: siteKey is not defined')
    return await new Promise((resolve, reject) => {
      if (!window.turnstile)
        throw new Error('TurnstileController.renderToken Error: window.turnstile is defined')
      let retryCount = 0

      const errorHandler = (err: string) => {
        if (retryCount >= MAX_RETRY_COUNT || !isSupportRetryError(err)) {
          reject(err)
          return
        }
        window.turnstile!.reset(`#${CONTAINER_ID}`)
        retryCount++
      }

      const callback = (token: string) => {
        try {
          window.turnstile!.remove(`#${CONTAINER_ID}`)
        } catch (error) {
          console.error(error)
        }
        resolve(token)
      }

      window.turnstile.render(container, {
        sitekey: siteKey,
        callback,
        'error-callback': errorHandler,
      })
    })
  }
}

const TurnstileRetry: string[] = ['crashed', 'undefined_error', 'challenge_failed']

// https://developers.cloudflare.com/turnstile/troubleshooting/client-side-errors/error-codes/#error-code-300-and-600
const TurnstileRetryCode: number[] = [102, 103, 104, 106, 300, 600]

function isSupportRetryError(error: string): boolean {
  if (TurnstileRetry.includes(error)) {
    return true
  }
  const errorCore = parseInt(error.slice(0, 3), 10)
  if (isNaN(errorCore)) return false
  return TurnstileRetryCode.includes(errorCore)
}
