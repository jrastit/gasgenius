import { asyncFrame } from '@1inch-community/core/async'
import { appendStyle } from '@1inch-community/core/lit-utils'
import { objectsDeepEqual } from '@1inch-community/core/utils'
import { html, LitElement, PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { DirectiveResult } from 'lit/directive.js'
import { createRef, ref } from 'lit/directives/ref.js'
import { when } from 'lit/directives/when.js'
import { textAnimateStyle } from './text-animate.style'

const animationConfig = {
  duration: 300,
  easing: 'cubic-bezier(0.5, 1.7, 0.5, 1)',
}

@customElement(TextAnimateElement.tagName)
export class TextAnimateElement extends LitElement {
  static readonly tagName = 'inch-text-animate' as const

  static override styles = textAnimateStyle

  @property({ type: Boolean, attribute: true }) disabledHostTransition = false
  @property({ type: String, attribute: true }) text?: string | DirectiveResult
  @state() private lastText?: string | DirectiveResult
  private transitionInProgress = false

  private readonly textRef = createRef<HTMLElement>()
  private readonly newTextRef = createRef<HTMLElement>()

  private get isTransitionState() {
    if (this.lastText === undefined) {
      return false
    }
    if (typeof this.text === 'string' || typeof this.lastText === 'string') {
      return !!this.lastText && this.text !== this.lastText
    }
    return !objectsDeepEqual(this.text, this.lastText)
  }

  private get textForRender() {
    return this.isTransitionState ? this.lastText : this.text
  }

  protected override willUpdate(changedProperties: PropertyValues) {
    super.willUpdate(changedProperties)
    if (changedProperties.has('text') && !this.transitionInProgress) {
      this.lastText = changedProperties.get('text')
    }
  }

  protected async updated(_changedProperties: PropertyValues) {
    super.updated(_changedProperties)
    if (this.isTransitionState) {
      this.transitionInProgress = true
      await asyncFrame()
      await this.transition()
      this.transitionInProgress = false
    }
  }

  render() {
    return html`
      ${when(
        this.isTransitionState,
        () => html`<span ${ref(this.newTextRef)} class="text new-text">${this.text}</span>`
      )}
      <span class="text" ${ref(this.textRef)}>${this.textForRender ?? html`&nbsp;`}</span>
    `
  }

  private async transition() {
    const textElement = this.textRef.value
    const newTextElement = this.newTextRef.value
    if (!textElement || !newTextElement) return
    const { height: oldHeight, width: oldWidth } = textElement.getBoundingClientRect()
    const { height, width } = newTextElement.getBoundingClientRect()
    const maxHeight = Math.max(oldHeight, height)
    const maxWidth = Math.max(oldWidth, width)
    appendStyle(this, {
      width: maxWidth + 'px',
      height: maxHeight + 'px',
    })
    await Promise.all([
      textElement.animate(
        [{ transform: 'translateY(0)' }, { transform: 'translateY(100%)' }],
        animationConfig
      ).finished,
      newTextElement.animate(
        [{ transform: 'translateY(-100%)' }, { transform: 'translateY(0)' }],
        animationConfig
      ).finished,
      this.disabledHostTransition
        ? Promise.resolve()
        : this.animate(
            [
              { width: `${oldWidth}px`, height: `${oldHeight}px` },
              { width: `${width}px`, height: `${height}px` },
            ],
            { ...animationConfig, easing: 'cubic-bezier(0.5, 1, 0.5, 1)' }
          ).finished,
    ])
    appendStyle(this, {
      width: '',
      height: '',
    })
    this.lastText = undefined
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TextAnimateElement.tagName]: TextAnimateElement
  }
}
