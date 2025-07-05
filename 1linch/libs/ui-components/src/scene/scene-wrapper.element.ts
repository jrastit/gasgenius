import { lazyProvider } from '@1inch-community/core/lazy'
import { css, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { SceneContext } from './scene-context'
import { sceneContext } from './scene-context.token'

@customElement(SceneWrapperElement.tagName)
export class SceneWrapperElement extends LitElement {
  static tagName = 'inch-scene-wrapper' as const

  static override styles = css`
    :host {
      background-color: var(--scene-background-color);
      will-change: transform;
      transform: translate3d(0, 0, 0);
      height: fit-content;
      max-height: 100%;
      box-sizing: border-box;
      position: relative;
      display: block;
      flex-grow: 1;
    }
  `

  private get contextValue(): SceneContext {
    return this.context.value as SceneContext
  }

  private context = lazyProvider(this, {
    context: sceneContext,
    initialValue: new SceneContext(),
  })

  animationInStart() {
    this.contextValue.animationInStartNext()
  }

  animationInEnd() {
    this.contextValue.animationInEndNext()
  }

  animationOutStart() {
    this.contextValue.animationOutStartNext()
  }

  animationOutEnd() {
    this.contextValue.animationOutEndNext()
  }

  protected override render() {
    return html`<slot></slot>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [SceneWrapperElement.tagName]: SceneWrapperElement
  }
}
