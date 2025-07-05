import { lazyAppContextConsumer } from '@1inch-community/core/lazy'
import { getMobileMatchMediaAndSubscribe } from '@1inch-community/core/lit-utils'
import { Locale } from '@1inch-community/models'
import { SceneController, shiftAnimation } from '@1inch-community/ui-components/scene'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { settingsStyle } from './settings.style'
import {
  getLocalizationSettingsView,
  getMainSettingsView,
  getPersonalizationSettingsView,
} from './settings.view'

const localeCount = Object.keys(Locale).length
const localizationHeight = 44 + 8 + localeCount * 64

@customElement(Settings.tagName)
export class Settings extends LitElement {
  static readonly tagName = 'inch-settings'

  static override styles = settingsStyle

  private readonly mobileMedia = getMobileMatchMediaAndSubscribe(this)

  private readonly applicationContext = lazyAppContextConsumer(this)

  private readonly scene = new SceneController(
    'main',
    {
      main: {
        minWidth: this.getWidth(),
        maxWidth: this.getWidth(),
        maxHeight: 180,
        minHeight: 180,
      },
      personalization: {
        minWidth: this.getWidth(),
        maxWidth: this.getWidth(),
        maxHeight: 240,
        minHeight: 240,
      },
      localization: {
        minWidth: this.getWidth(),
        maxWidth: this.getWidth(),
        maxHeight: localizationHeight,
        minHeight: localizationHeight,
      },
    },
    shiftAnimation()
  )

  protected render() {
    return html`
      <div class="settings-scene-container">
        ${this.scene.render({
          main: () => getMainSettingsView(this.scene, this),
          personalization: () =>
            getPersonalizationSettingsView(this.scene, this.applicationContext.value, this),
          localization: () =>
            getLocalizationSettingsView(this.scene, this.applicationContext.value),
        })}
      </div>
    `
  }

  private getWidth() {
    if (this.mobileMedia.matches) return window.innerWidth - 16
    return 556
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'inch-settings': Settings
  }
}
