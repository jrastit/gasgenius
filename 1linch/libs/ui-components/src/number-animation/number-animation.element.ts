import { asyncFrame, asyncTimeout } from '@1inch-community/core/async'
import { appendClass, subscribe } from '@1inch-community/core/lit-utils'
import { css, html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import { when } from 'lit/directives/when.js'
import { concatMap, debounceTime, from, Subject } from 'rxjs'
import '../text-animate'
import './digit-animation.element'

@customElement(NumberAnimationElement.tagName)
export class NumberAnimationElement extends LitElement {
  static tagName = 'inch-number-animation' as const

  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      height: 1em;
      color: inherit;
    }

    :host(:dir(rtl)) {
      flex-direction: row-reverse;
    }

    :host(.up) {
      color: #00c853;
    }

    :host(.down) {
      color: #d50000;
    }

    .symbol {
      height: 1em;
      line-height: 1em;
      transition: color 0.1s;
    }
  `

  @property({ type: String, attribute: true }) prefixSymbol?: string
  @property({ type: String, attribute: true }) postfixSymbol?: string
  @property({ type: Boolean, attribute: true }) showColorIndicator = false

  @property({ type: String, attribute: false })
  set value(value: string) {
    if (this.renderValue === value) return
    if (this.renderValue.length === 0) {
      this.renderValue = value
      return
    }
    this.transition$.next(value)
  }

  @state() renderValue = ''

  private readonly transition$ = new Subject<string>()

  connectedCallback() {
    super.connectedCallback()
    subscribe(
      this,
      [
        this.transition$.pipe(
          debounceTime(300),
          concatMap((value) => from(this.transition(value)))
        ),
      ],
      { requestUpdate: false }
    )
  }

  render() {
    const list = this.renderValue.split('')
    return html`
      ${when(this.prefixSymbol, () => html`<span class="symbol">${this.prefixSymbol}</span>`)}
      ${repeat(
        list,
        (digit) => html`<inch-digit-animation digit="${digit}"></inch-digit-animation>`
      )}
      ${when(
        this.postfixSymbol,
        () => html`&nbsp;<inch-text-animate text="${this.postfixSymbol}"></inch-text-animate>`
      )}
    `
  }

  private async transition(value: string) {
    const renderValueNumber = parseFloat(this.renderValue.replace(' ', ''))
    const nextValueNumber = parseFloat(value.replace(' ', ''))
    const delta = Math.abs(value.length - this.renderValue.length) + 1
    const stubString = new Array(delta).fill('').join('\n')
    if (this.renderValue.length && value.length > this.renderValue.length) {
      this.renderValue = this.renderValue + stubString
    }
    if (this.renderValue.length && value.length < this.renderValue.length) {
      this.renderValue = value + stubString
    }
    if (this.renderValue.length && delta > 1) {
      await asyncFrame(10)
    }
    this.renderValue = value
    if (!this.showColorIndicator) return
    appendClass(this, {
      up: renderValueNumber < nextValueNumber,
      down: renderValueNumber > nextValueNumber,
    })
    await asyncTimeout(500)
    appendClass(this, {
      up: false,
      down: false,
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [NumberAnimationElement.tagName]: NumberAnimationElement
  }
}
