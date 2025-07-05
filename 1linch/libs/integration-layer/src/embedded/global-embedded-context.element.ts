import {
  ApplicationContextToken,
  EmbeddedConfigToken,
} from '@1inch-community/core/application-context'
import { lazyProvider } from '@1inch-community/core/lazy'
import { fontStyle, mainColorMap, makeColorSchema } from '@1inch-community/core/theme'
import {
  ColorHex,
  EmbeddedBootstrapConfig,
  IApplicationContext,
  IGlobalEmbeddedContextElement,
  MainColors,
} from '@1inch-community/models'
import { SwapContextToken } from '@1inch-community/sdk/swap'
import { adoptStyles, CSSResult, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

const contextHolder = new WeakMap<LitElement, IApplicationContext>()

@customElement(GlobalEmbeddedContextElement.tagName)
export class GlobalEmbeddedContextElement
  extends LitElement
  implements IGlobalEmbeddedContextElement
{
  static readonly tagName = 'global-embedded-context' as const

  private readonly config = lazyProvider(this, { context: EmbeddedConfigToken })

  private styles: Map<string, CSSResult> = new Map()

  private isRendered = false

  connectedCallback() {
    super.connectedCallback()
    this.isRendered = true
    this.updateStyles()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.isRendered = false
  }

  async setConfig(config: EmbeddedBootstrapConfig) {
    this.config.set(config)
    await Promise.all([
      this.setThemePrimaryColor(config.primaryColor),
      this.setThemeType(config.themeType),
      this.setFounts(),
    ])
    this.updateStyles()
  }

  async setContext(context: IApplicationContext) {
    contextHolder.set(this, context)
    const swapContext = await context.makeSwapContext()
    lazyProvider(this, { context: ApplicationContextToken, initialValue: context })
    lazyProvider(this, { context: SwapContextToken, initialValue: swapContext })
  }

  protected render() {
    return html` <slot></slot>`
  }

  async setThemePrimaryColor(primaryColor: ColorHex) {
    const color = makeColorSchema(primaryColor, ':host')
    this.styles.set('primary-color', color)
    this.updateStyles()
  }

  async setThemeType(themeType: 'dark' | 'light') {
    const themeName = themeType === 'dark' ? MainColors.dark : MainColors.light
    const color = await mainColorMap[themeName](':host')
    this.styles.set('theme-color', color)
    this.updateStyles()
  }

  private async setFounts() {
    this.styles.set('fonts', fontStyle(':host'))
  }

  private updateStyles() {
    if (!this.isRendered) return
    if (!this.shadowRoot) throw new Error('')
    const elementStyles = GlobalEmbeddedContextElement.finalizeStyles([...this.styles.values()])
    adoptStyles(this.shadowRoot, elementStyles)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [GlobalEmbeddedContextElement.tagName]: GlobalEmbeddedContextElement
  }
}
