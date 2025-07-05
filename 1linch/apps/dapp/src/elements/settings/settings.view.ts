import { dispatchEvent } from '@1inch-community/core/lit-utils'
import { AccentColors, IApplicationContext, Locale, MainColors } from '@1inch-community/models'
import '@1inch-community/ui-components/card'
import '@1inch-community/ui-components/icon'
import { SceneController } from '@1inch-community/ui-components/scene'
import '@1inch-community/ui-components/segmented-control'
import type { SegmentedControlItem } from '@1inch-community/ui-components/segmented-control'
import { html, LitElement } from 'lit'
import { classMap } from 'lit/directives/class-map.js'

export function getMainSettingsView(scene: SceneController<string, string>, element: LitElement) {
  return html`
    <div class="main-settings-container">
      <inch-card-header
        backButton
        headerText="Settings"
        @backCard="${() => dispatchEvent(element, 'closeSettings', null)}"
      ></inch-card-header>
      <div class="settings-view-container">
        ${getMainSettingsViewItem(scene, 'image24', 'Personalization', 'personalization')}
        ${getMainSettingsViewItem(scene, 'globe24', 'Localization', 'localization')}
      </div>
    </div>
  `
}

const primaryColor: SegmentedControlItem[] = [
  { value: AccentColors.community, label: 'community' },
  { value: AccentColors.violet, label: 'violet' },
  { value: AccentColors.random, label: 'random' },
  { value: AccentColors.rainbow, label: 'rainbow' },
]

const themes = [
  { value: MainColors.systemSync, label: 'Automatic', icon: 'command24' },
  { value: MainColors.dark, label: 'Dark', icon: 'moon24' },
  { value: MainColors.light, label: 'light', icon: 'sun24' },
]

export function getPersonalizationSettingsView(
  scene: SceneController<string, string>,
  applicationContext: IApplicationContext,
  element: LitElement
) {
  return html`
    <div class="main-settings-container">
      <inch-card-header
        backButton
        headerText="Personalization"
        @backCard="${() => scene.back()}"
      ></inch-card-header>
      <div class="settings-view-container">
        <div class="theme-container">
          ${themes.map((item) => {
            const classes = {
              'theme-item': true,
              'theme-item-select': item.value === applicationContext.theme.getActiveMainColor(),
            }
            return html`
              <div
                @click="${async (event: MouseEvent) => {
                  await applicationContext.theme.onChangeMainColor(item.value, event)
                  element.requestUpdate()
                }}"
                class="${classMap(classes)}"
              >
                <inch-icon icon="${item.icon}"></inch-icon>
                <span>${item.label}</span>
              </div>
            `
          })}
        </div>
        <div class="segmented-control-container">
          <span class="segmented-control-label">Primary color</span>
          <inch-segmented-control
            .items="${primaryColor}"
            .select="${primaryColor.find(
              (item) => item.value === applicationContext.theme.getActiveBrandColor()
            )}"
            @change="${(event: CustomEvent) =>
              applicationContext.theme.onChangeBrandColor(event.detail.value)}"
          ></inch-segmented-control>
        </div>
      </div>
    </div>
  `
}

export function getLocalizationSettingsView(
  scene: SceneController<string, string>,
  applicationContext: IApplicationContext
) {
  return html`
    <div class="main-settings-container">
      <inch-card-header
        backButton
        headerText="Language"
        @backCard="${() => scene.back()}"
      ></inch-card-header>
      <div class="settings-view-container">
        ${getLocalizationSettingsViewItem('English', Locale.en, applicationContext)}
        ${getLocalizationSettingsViewItem('العربية', Locale.ar, applicationContext)}
        ${getLocalizationSettingsViewItem('Deutsch', Locale.de, applicationContext)}
        ${getLocalizationSettingsViewItem('français', Locale.fr, applicationContext)}
        ${getLocalizationSettingsViewItem('Español', Locale.es, applicationContext)}
      </div>
    </div>
  `
}

function getMainSettingsViewItem(
  scene: SceneController<string, string>,
  iconName: string,
  nameView: string,
  nextScene: string
) {
  return html`
    <div class="settings-view-item" @click="${() => scene.nextTo(nextScene)}">
      <inch-icon icon="${iconName}"></inch-icon>
      <span>${nameView}</span>
    </div>
  `
}

function getLocalizationSettingsViewItem(
  nameView: string,
  code: Locale,
  applicationContext: IApplicationContext
) {
  return html`
    <div class="settings-view-item" @click="${() => applicationContext.i18n.changeLocale(code)}">
      <span>${nameView}</span>
    </div>
  `
}
