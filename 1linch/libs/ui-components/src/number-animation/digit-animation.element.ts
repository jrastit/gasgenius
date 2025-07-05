import { appendStyle } from '@1inch-community/core/lit-utils'
import { css, html, LitElement, TemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { map } from 'lit/directives/map.js'
import { createRef, ref } from 'lit/directives/ref.js'
import { styleMap } from 'lit/directives/style-map.js'

const digitInitiation = '\n'
const digitList = [digitInitiation, ' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.']
const widthRecord: Record<string, number> = {
  ' ': 0.4,
}

const replaceMap: Record<string, TemplateResult> = {
  ' ': html`&nbsp;`,
  [digitInitiation]: html`&nbsp;`,
}

@customElement(DigitAnimationElement.tagName)
export class DigitAnimationElement extends LitElement {
  static tagName = 'inch-digit-animation' as const

  static override styles = css`
    :host {
      position: relative;
      overflow: hidden;
      display: inline-block;
      text-align: center;
    }

    .digit-list {
      display: flex;
      flex-direction: column;
      height: 1em;
      letter-spacing: 0;
    }

    .digit {
      display: block;
      height: 1em;
      width: fit-content;
      line-height: 1em;
      transition: color 0.1s;
    }
  `

  @property({ type: String, attribute: 'digit' }) nextDigit: string = digitInitiation

  private renderedDigit = digitInitiation

  private firstRender = true

  private readonly digitListRef = createRef<HTMLElement>()

  get stable() {
    return this.renderedDigit === this.nextDigit
  }

  render() {
    if (this.firstRender) {
      this.renderedDigit = this.nextDigit
      this.firstRender = false
    }
    if (this.stable) {
      const style = getSizeAndOffset(this.renderedDigit)
      return html`<span class="digit" style="${styleMap({ width: style.width })}"
        >${this.renderedDigit}</span
      >`
    }

    const style = getSizeAndOffset(this.renderedDigit)
    return html`
      <div ${ref(this.digitListRef)} class="digit-list" style="${styleMap(style)}">
        ${map(digitList, (digit: string, index) => {
          const style = getSizeAndOffset(digit)
          return html`<span id="${index}" class="digit" style="${styleMap({ width: style.width })}">
            ${replaceMap[digit] ?? digit}
          </span>`
        })}
      </div>
    `
  }

  protected async updated() {
    if (this.stable) return
    if (!this.digitListRef.value) return
    const list = this.digitListRef.value
    const fromStyle = getSizeAndOffset(this.renderedDigit)
    const nextStyle = getSizeAndOffset(this.nextDigit)
    const fromWidth = getElementWidth(list, this.renderedDigit)
    const nextWidth = getElementWidth(list, this.nextDigit)
    appendStyle(list, { width: fromWidth })
    await Promise.all([
      list
        .animate([{ width: fromWidth }, { width: nextWidth }], {
          duration: 100,
        })
        .finished.then(() => appendStyle(list, { width: nextWidth })),
      list.animate([{ transform: fromStyle.transform }, { transform: nextStyle.transform }], {
        duration: 500,
        easing: 'cubic-bezier(0.5, 1.3, 0.5, 1)',
      }).finished,
    ])
    appendStyle(list, { ...nextStyle })
    this.renderedDigit = this.nextDigit
    this.requestUpdate()
  }
}

function getSizeAndOffset(digit: string) {
  if (!digitList.includes(digit)) {
    throw new Error(`digit ${digit} not exist`)
  }
  const index = digitList.indexOf(digit)
  return {
    transform: `translateY(-${index}em)`,
    width: widthRecord[digit] ? `${widthRecord[digit]}ch` : undefined,
  }
}

function getElementWidth(list: HTMLElement, digit: string) {
  if (!digitList.includes(digit)) {
    throw new Error(`digit ${digit} not exist`)
  }
  const index = digitList.indexOf(digit)
  if (widthRecord[digit]) {
    return `${widthRecord[digit]}ch`
  }
  const element = list.children[index]
  if (!element) {
    throw new Error(`digit element ${digit} not exist`)
  }
  return element.getBoundingClientRect().width + 'px'
}

declare global {
  interface HTMLElementTagNameMap {
    [DigitAnimationElement.tagName]: DigitAnimationElement
  }
}
