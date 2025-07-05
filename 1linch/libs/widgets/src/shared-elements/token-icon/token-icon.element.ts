import { lazyAppContextConsumer } from '@1inch-community/core/lazy'
import { ChainId } from '@1inch-community/models'
import { chainViewConfig } from '@1inch-community/sdk/chain'
import '@1inch-community/ui-components/icon'
import '@1inch-community/ui-components/loaders'
import { Task } from '@lit/task'
import { html, LitElement, TemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'
import type { Address } from 'viem'
import { tokenIconStyle } from './token-icon.style'

@customElement(TokenIconElement.tagName)
export class TokenIconElement extends LitElement {
  static tagName = 'inch-token-icon' as const

  static override styles = [tokenIconStyle]

  @property({ type: String, attribute: true }) symbol?: string
  @property({ type: String, attribute: true }) address?: Address
  @property({ type: Number, attribute: true }) chainId?: ChainId
  @property({ type: Number, attribute: true }) size = 24
  @property({ type: Boolean, attribute: true }) hideChainIcon = false

  private readonly applicationContext = lazyAppContextConsumer(this)

  private readonly task = new Task(this, {
    task: async ([symbol, address, chainId]) => {
      const img = await this.iconLoader(chainId, symbol, address)
      img.width = this.size
      img.height = this.size
      img.ondragstart = () => false
      return img
    },
    args: () => [this.symbol, this.address, this.chainId] as const,
  })

  protected override render() {
    return this.task.render({
      error: () => this.renderLoaderOrIcon(),
      pending: () => this.renderLoaderOrIcon(),
      complete: () => this.renderLoaderOrIcon(),
    })
  }

  protected override updated() {
    this.style.width = `${this.size}px`
    this.style.height = `${this.size}px`
  }

  private renderLoaderOrIcon() {
    let template: TemplateResult
    if (!this.task.value) {
      template = this.loaderTemplate(this.task.status === 1)
    } else {
      template = html`${this.task.value}`
    }

    return appendChainIcon(template, this.hideChainIcon, this.size, this.chainId)
  }

  private async iconLoader(
    chainId?: ChainId,
    symbol?: string,
    address?: Address
  ): Promise<HTMLImageElement> {
    const result = await this.loadFromDatabase(chainId, symbol, address)
    if (result === null) {
      throw new Error('token icon not fount')
    }
    return result
  }

  private async loadFromDatabase(
    chainId?: ChainId,
    symbol?: string,
    address?: Address
  ): Promise<HTMLImageElement | null> {
    const logoURL: string[] = []

    if (chainId && address) {
      const url = await this.applicationContext.value.tokenStorage.getTokenLogoURL(chainId, address)
      if (url) {
        logoURL.push(url)
      }
    }

    if (logoURL.length === 0 && symbol) {
      const urls = await this.applicationContext.value.tokenStorage.getTokenLogoURLsBySymbol(symbol)
      if (urls) {
        logoURL.push(...new Set(urls))
      }
    }
    if (logoURL.length === 0) {
      return null
    }

    const loader = (url: string) =>
      new Promise<HTMLImageElement | null>((resolve) => {
        const img = new Image()
        img.onerror = () => resolve(null)
        img.onload = () => resolve(img)
        img.src = url
      })

    for (const url of logoURL) {
      const img = await loader(url)
      if (img) return img
    }
    return null
  }

  private loaderTemplate(showLoader?: boolean) {
    const { size, symbol } = this
    const style = {
      fontSize: `${size < 40 ? 13 : 16}px`,
    }
    return html`
      <inch-loader-spinner size="${size}" .showLoader="${showLoader}">
        <span style="${styleMap(style)}">${symbol?.slice(0, size < 40 ? 1 : 2) ?? ''}</span>
      </inch-loader-spinner>
    `
  }
}

function appendChainIcon(
  view: TemplateResult,
  hideChainIcon: boolean,
  size: number,
  chainId?: ChainId
) {
  if (!chainId || hideChainIcon) return view
  const chainSize = size / 2.5
  const offset = 2
  const maskImageSize = chainSize / 2 + offset
  const maskImageX = size - chainSize + maskImageSize - offset
  const maskImageY = size - chainSize + maskImageSize + offset
  const style = {
    '--mask-image-size': `${maskImageSize}px`,
    '--mask-image-x': `${maskImageX}px`,
    '--mask-image-y': `${maskImageY}px`,
  }
  return html`
    <div class="wrap-chain" style="${styleMap(style)}">
      ${view}
      <inch-icon
        class="chain-view"
        width="${chainSize}"
        height="${chainSize}"
        icon="${chainViewConfig[chainId].iconName}"
      ></inch-icon>
    </div>
  `
}

declare global {
  interface HTMLElementTagNameMap {
    [TokenIconElement.tagName]: TokenIconElement
  }
}
