import { CacheActivePromise } from '@1inch-community/core/decorators'
import { lazyAppContext } from '@1inch-community/core/lazy'
import { IApplicationContext, IProxyClient } from '@1inch-community/models'

type AuthData = {
  token: string
  expiration_time: number
}

export class PrivateProxyClient implements IProxyClient {
  private token: string | null = null
  private expirationTime: number | null = null
  private context = lazyAppContext('PrivateProxyClient')

  get isAuth() {
    return !!this.expirationTime && this.expirationTime > Date.now()
  }

  get host() {
    return this.context.value.environment.get('oneInchDevPortalHost')
  }

  async init(context: IApplicationContext) {
    this.context.set(context)
    this.expirationTime =
      this.context.value.storage.get('private-proxy-client-expiration-time', Number) ?? null
    this.token = this.context.value.storage.get('private-proxy-client-token', String) ?? null
  }

  async get<T>(url: string): Promise<T> {
    await this.auth()
    const response = await fetch(this.getRequestUrl(url), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
    })
    return await response.json()
  }

  async post<T, Body = unknown>(url: string, body: Body): Promise<T> {
    await this.auth()
    const response = await fetch(this.getRequestUrl(url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(body),
    })

    try {
      return await response.json()
    } catch {
      return undefined as T
    }
  }

  @CacheActivePromise()
  private async auth() {
    if (this.isAuth) return
    const turnstileToken = await this.context.value.turnstile.getToken()
    const response = await fetch(this.getRequestUrl('/auth'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: turnstileToken,
      }),
    })
    const { token, expiration_time } = (await response.json()) as AuthData
    this.token = token
    this.expirationTime = expiration_time * 1000 - 2000
    this.context.value.storage.set('private-proxy-client-token', this.token)
    this.context.value.storage.set('private-proxy-client-expiration-time', this.expirationTime)
    console.warn('auth complete')
  }

  private getRequestUrl(urlPath: string): URL {
    const url = new URL(urlPath, this.host)
    url.pathname = url.pathname.replace(/\/+/g, '/')

    return url
  }
}
