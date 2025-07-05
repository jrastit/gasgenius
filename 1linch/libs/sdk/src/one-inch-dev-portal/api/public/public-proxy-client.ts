import { lazyAppContext } from '@1inch-community/core/lazy'
import { IApplicationContext, IProxyClient } from '@1inch-community/models'

export class PublicProxyClient implements IProxyClient {
  private readonly context = lazyAppContext('PublicProxyClient')

  get isAuth() {
    return true
  }

  get host() {
    return this.context.value.environment.get('oneInchDevPortalHost')
  }

  get token() {
    return this.context.value.environment.get('oneInchDevPortalToken')
  }

  async init(context: IApplicationContext) {
    this.context.set(context)
  }

  async get<T>(url: string): Promise<T> {
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

  private getRequestUrl(urlPath: string): URL {
    const url = new URL(urlPath, this.host)
    url.pathname = url.pathname.replace(/\/+/g, '/')

    return url
  }
}
