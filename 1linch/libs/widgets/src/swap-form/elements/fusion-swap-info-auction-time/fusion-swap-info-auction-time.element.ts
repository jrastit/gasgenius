import { lazyAppContextConsumer } from '@1inch-community/core/lazy'
import {
  appendStyle,
  dispatchEvent,
  getMobileMatchMediaAndSubscribe,
  subscribe,
} from '@1inch-community/core/lit-utils'
import { SwapSettings } from '@1inch-community/models'
import '@1inch-community/ui-components/icon'
import '@1inch-community/ui-components/segmented-control'
import type { SegmentedControlItem } from '@1inch-community/ui-components/segmented-control'
import { Maskito } from '@maskito/core'
import { maskitoNumberOptionsGenerator } from '@maskito/kit'
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { fromEvent, tap } from 'rxjs'
import { fusionSwapInfoAuctionTimeStyle } from './fusion-swap-info-auction-time.style'

@customElement(FusionSwapInfoAuctionTimeElement.tagName)
export class FusionSwapInfoAuctionTimeElement extends LitElement {
  static tagName = 'inch-fusion-swap-info-auction-time' as const

  static override styles = fusionSwapInfoAuctionTimeStyle

  private readonly mobileMedia = getMobileMatchMediaAndSubscribe(this)

  @property({ type: Object }) settings?: SwapSettings['auctionTime']

  private readonly applicationContext = lazyAppContextConsumer(this)

  private readonly segmentsCustom = {
    label: 'Custom',
    value: 'custom',
    template: () => html`${this.customAuctionTimeInput}`,
  }

  private segments!: SegmentedControlItem[]

  private readonly postfix = 's'

  private readonly customAuctionTimeInput = document.createElement('input')

  override connectedCallback() {
    super.connectedCallback()
    this.updateSegments()
    this.buildMask()
    this.settings?.startChangingValue()
    this.customAuctionTimeInput.placeholder = 'Custom s'
    this.customAuctionTimeInput.inputMode = 'decimal'
    this.customAuctionTimeInput.autocomplete = 'off'
    appendStyle(this.customAuctionTimeInput, {
      backgroundColor: 'transparent',
      border: 'none',
      outline: 'none',
      padding: '0',
      color: 'var(--color-content-content-primary)',
      width: '80px',
      fontSize: '16px',
      textAlign: 'center',
    })
    this.updateSegments()
    subscribe(
      this,
      [
        fromEvent(this.customAuctionTimeInput, 'input').pipe(
          tap(() => {
            if (this.customAuctionTimeInput.value.length === 1) {
              this.customAuctionTimeInput.value = ''
            }
            const inputValue = this.getValue()
            this.settings?.setValue([inputValue, 'custom'])
          })
        ),
      ],
      { requestUpdate: false }
    )
  }

  protected override render() {
    appendStyle(this.customAuctionTimeInput, {
      fontSize: this.mobileMedia.matches ? '13px' : '16px',
    })
    return html`
      <div @click="${() => this.onBack()}" class="slippage-title">
        <inch-icon class="back-icon" icon="chevronDown16"></inch-icon>
        <span>Auction time</span>
      </div>
      <inch-segmented-control
        .items="${this.segments}"
        .select="${this.getStartSection()}"
        @change="${(event: CustomEvent) => this.onChange(event)}"
      ></inch-segmented-control>
    `
  }

  private buildMask() {
    return new Maskito(
      this.customAuctionTimeInput,
      maskitoNumberOptionsGenerator({
        max: 60 * 60 * 30,
        min: 60 * 3,
        postfix: this.postfix,
      })
    )
  }

  private onBack() {
    const value = this.settings?.value ?? null
    if (value && value[1] === 'custom' && (value[0] === null || isNaN(value[0]))) {
      this.settings?.resetValue()
    }
    this.settings?.endChangingValue()
    dispatchEvent(this, 'back', null)
  }

  private onChange({ detail }: CustomEvent) {
    const value = detail.value
    if (value === 'auto') {
      this.settings?.cleanValue()
      return
    }
    if (value === 'custom') {
      const inputValue = this.getValue()
      this.settings?.setValue([inputValue, 'custom'])
      return
    }
    this.settings?.setValue([detail.value, 'preset'])
  }

  private getStartSection(): SegmentedControlItem {
    if (!this.settings || this.settings.value === null) return this.segments[0]
    const [value, type] = this.settings.value
    if (type === 'custom') {
      if (isNaN(parseFloat(value.toString()))) return this.segments[0]
      this.customAuctionTimeInput.value = `${value}s`
      return this.segmentsCustom
    }
    if (type === 'preset') {
      const preset = this.segments.find((item) => item.value === value)
      if (!preset) return this.segments[0]
      return preset
    }
    throw new Error('Invalid auction time type')
  }

  private getValue() {
    const strValue = this.customAuctionTimeInput.value.replaceAll(' ', '').replace(this.postfix, '')
    return parseInt(strValue, 10)
  }

  private updateSegments() {
    this.segments = [
      { label: 'Auto', value: 'auto' },
      { label: '3m', value: 60 * 3 },
      { label: '5m', value: 60 * 5 },
      { label: '10m', value: 60 * 10 },
      { label: '30m', value: 60 * 30 },
      this.mobileMedia.matches || this.applicationContext.value.isEmbedded
        ? null
        : { label: '1H', value: 60 * 60 },
      this.mobileMedia.matches || this.applicationContext.value.isEmbedded
        ? null
        : { label: '2H', value: 60 * 60 * 2 },
      this.segmentsCustom,
    ].filter(Boolean) as SegmentedControlItem[]
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'inch-fusion-swap-info-auction-time': FusionSwapInfoAuctionTimeElement
  }
}
