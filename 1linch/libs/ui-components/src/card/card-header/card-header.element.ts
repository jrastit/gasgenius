import { appendClass, dispatchEvent } from '@1inch-community/core/lit-utils'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import '../../button'
import '../../icon'
import { cardHeaderStyle } from './card-header.style'

@customElement(CardHeaderElement.tahName)
export class CardHeaderElement extends LitElement {
  static tahName = 'inch-card-header' as const

  static override styles = cardHeaderStyle

  @property({ type: String, attribute: true }) headerText?: string
  @property({ type: String, attribute: true }) headerTextPosition: 'center' | 'left' = 'center'
  @property({ type: Boolean, attribute: true }) backButton = false
  @property({ type: Boolean, attribute: true }) closeButton = false
  @property({ type: Boolean, attribute: true }) separator = false
  @property({ type: Boolean, attribute: true }) mini = false

  private slotDirty: Record<string, boolean> = {}

  constructor() {
    super()
    this.slot = 'header'
  }

  protected override render() {
    appendClass(this, {
      separator: this.separator,
      mini: this.mini,
    })
    return html`
      <div class="card-header-container">
        <div class="position-container left-container">
          <slot @slotchange="${() => this.onSlotChange('left')}" name="left-container"></slot>
          ${this.getBackButton('left')} ${this.getHeader('left')}
        </div>
        <div class="position-container center-container">
          <slot @slotchange="${() => this.onSlotChange('center')}" name="center-container"></slot>
          ${this.getHeader('center')}
        </div>
        <div class="position-container right-container">
          <slot @slotchange="${() => this.onSlotChange('right')}" name="right-container"></slot>
          ${this.getCloseButton('right')}
        </div>
      </div>
    `
  }

  protected override firstUpdated() {
    appendClass(this, {
      'not-native-mode': this.parentElement?.localName !== 'inch-card',
    })
  }

  private getHeader(containerName: 'center' | 'left') {
    const isSlotDirty = this.slotDirty[containerName] ?? false
    const classes = {
      'card-header-title': true,
      [`card-header-title__${containerName}`]: true,
      'card-header-title__and-back': this.backButton,
    }
    return this.headerTextPosition === containerName && !isSlotDirty
      ? html` <span class="${classMap(classes)}">${this.headerText}</span> `
      : ''
  }

  private getBackButton(containerName: 'left' | 'center' | 'right') {
    const isSlotDirty = this.slotDirty[containerName] ?? false
    return this.backButton && !isSlotDirty
      ? html`
          <inch-button
            @click="${(event: Event) => dispatchEvent(this, 'backCard', null, event)}"
            size="l"
            type="tertiary-gray"
          >
            <inch-icon icon="arrowLeft24"></inch-icon>
          </inch-button>
        `
      : ''
  }

  private getCloseButton(containerName: 'left' | 'center' | 'right') {
    const isSlotDirty = this.slotDirty[containerName] ?? false
    return this.closeButton && !isSlotDirty
      ? html`
          <inch-button
            @click="${(event: Event) => dispatchEvent(this, 'closeCard', null, event)}"
            size="l"
            type="tertiary-gray"
          >
            <inch-icon icon="cross24"></inch-icon>
          </inch-button>
        `
      : ''
  }

  private onSlotChange(slotName: 'left' | 'center' | 'right') {
    this.slotDirty = { ...this.slotDirty, [slotName]: true }
    this.requestUpdate()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [CardHeaderElement.tahName]: CardHeaderElement
  }
}
