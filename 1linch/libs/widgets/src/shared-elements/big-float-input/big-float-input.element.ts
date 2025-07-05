import { appendClass, dispatchEvent, subscribe } from '@1inch-community/core/lit-utils'
import { BigFloat } from '@1inch-community/core/math'
import { IBigFloat } from '@1inch-community/models'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { fromEvent, tap } from 'rxjs'
import { bigFloatInputStyle } from './big-float-input.style'

@customElement(BigFloatInputElement.tagName)
export class BigFloatInputElement extends LitElement {
  static tagName = 'inch-big-float-input' as const

  static override styles = bigFloatInputStyle

  @property({ type: Object, attribute: false })
  set value(value: IBigFloat) {
    if (!(value instanceof BigFloat)) {
      return
    }
    if (!this._value.isEqualTo(value)) {
      this._value = value
      this.input.value = value.toFixedSmart(this.decimals)
    }
  }

  get value() {
    return this._value
  }

  @property({ type: Number, attribute: false }) decimals: number = 6
  @property({ type: Boolean, attribute: false }) disabled = false

  private _value = BigFloat.zero()
  private readonly input = document.createElement('input')

  firstUpdated() {
    appendClass(this.input, {
      input: true,
    })
    if (this.disabled) {
      this.input.setAttribute('disabled', '')
    }
    this.input.setAttribute('inputmode', 'decimal')
    this.input.setAttribute('autocomplete', 'off')
    this.input.setAttribute('placeholder', '0')
    subscribe(
      this,
      [
        fromEvent<KeyboardEvent>(this.input, 'keypress').pipe(
          tap((event) => this.keypressHandler(event))
        ),
        fromEvent<InputEvent>(this.input, 'input').pipe(tap((event) => this.inputHandler(event))),
      ],
      { requestUpdate: false }
    )
  }

  protected render() {
    return html`${this.input}`
  }

  private keypressHandler(event: KeyboardEvent) {
    const char = event.key
    const value = this.input.value

    if (char.match(/[^0-9.]/)) {
      event.preventDefault()
    }

    if (char === '.' && value.length > 0) {
      if (value.includes('.')) {
        event.preventDefault()
      }
      return
    }
  }

  private inputHandler(event: InputEvent) {
    const value = this.input.value
    const clearValue = value.replace(/ /g, '')

    if (clearValue === '') {
      dispatchEvent(this, 'change', BigFloat.zero())
      return
    }

    const [integerPart, decimalPart] = clearValue.split('.')
    const beforeDot = BigFloat.fromString(integerPart || '0')
    const formattedValue = beforeDot.toFixedSmart(this.decimals)
    const cursorPos = this.input.selectionStart ?? 0

    this.input.value = formattedValue + (decimalPart?.length >= 0 ? '.' + decimalPart : '')

    const [originalIntegerPart] = value.split('.')
    let changesDiff = formattedValue.length - originalIntegerPart.length

    if (cursorPos > 0 && cursorPos < formattedValue.length && changesDiff > 0) {
      if (event.inputType === 'deleteContentForward') {
        changesDiff = 1
      } else if (event.inputType === 'deleteContentBackward') {
        changesDiff = 0
      }
    }

    if (formattedValue !== originalIntegerPart) {
      this.input.selectionStart = Math.max(0, cursorPos + changesDiff)
      this.input.selectionEnd = this.input.selectionStart
    }

    const dust = BigFloat.fromString('0.' + (decimalPart || '0'))
    const bigFloat = BigFloat.fromString(integerPart || '0').plus(dust)

    if (!this.value.isEqualTo(bigFloat)) {
      this._value = bigFloat
      dispatchEvent(this, 'change', this.value)
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [BigFloatInputElement.tagName]: BigFloatInputElement
  }
}
