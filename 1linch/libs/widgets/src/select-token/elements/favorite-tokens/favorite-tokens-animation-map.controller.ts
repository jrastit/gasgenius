import { asyncFrame } from '@1inch-community/core/async'
import {
  AnimationMapController,
  AnimationMapDirection,
  appendStyle,
} from '@1inch-community/core/lit-utils'
import { IToken } from '@1inch-community/models'
import { html, TemplateResult } from 'lit'
import { when } from 'lit/directives/when.js'

const animationOptions = {
  duration: 200,
  easing: 'cubic-bezier(.2, .8, .2, 1)',
}

export class FavoriteTokensAnimationMapController
  implements AnimationMapController<IToken | null, void, void, HTMLElement | number | null>
{
  direction: AnimationMapDirection = 'horizontal'

  private renderElements: Map<number, HTMLElement> = new Map()
  private deleteElementsWidth: Map<number, number> = new Map()
  private moveElementsWidth: Map<string, number> = new Map()

  private readonly gap = 8

  constructor(
    private readonly onRemoveFavoriteToken: (token: IToken, event: UIEvent) => void,
    private readonly onSelectToken: (token: IToken) => void,
    private readonly onEditAllToggle: () => void
  ) {}

  onKeyExtractor(token: IToken | null): string {
    return token !== null ? 't' + token.chainId + token.address : 'edit'
  }

  onTemplateBuilder(token: IToken | null): TemplateResult {
    return when(
      token,
      (token) => html`
        <div class="favorite-token-item-container">
          <div
            class="remove-favorite-token"
            @click="${(event: UIEvent) => this.onRemoveFavoriteToken(token, event)}"
          >
            <inch-icon icon="cross8"></inch-icon>
          </div>
          <inch-button
            size="m"
            type="secondary"
            class="favorite-token-item"
            @click="${() => {
              this.onSelectToken(token)
            }}"
          >
            <inch-token-icon
              symbol="${token.symbol}"
              address="${token.address}"
              chainId="${token.chainId}"
            ></inch-token-icon>
            <span>${token.symbol}</span>
          </inch-button>
        </div>
      `,
      () => html`
        <inch-button
          size="l"
          type="secondary"
          class="favorite-token-item edit-favorite-token-list"
          @click="${() => this.onEditAllToggle()}"
        >
          <inch-icon icon="edit24"></inch-icon>
        </inch-button>
      `
    )
  }

  async onBeforeRemoveAnimateItem(element: HTMLElement): Promise<void> {
    await element.animate(
      [{ transform: '' }, { transform: 'translateX(-50%) scale(.3)', opacity: 0 }],
      animationOptions
    ).finished
  }

  async onBeforeRenderAnimateItem(element: HTMLElement): Promise<void> {
    appendStyle(element, {
      transform: 'translateX(-100%)',
      opacity: '0',
    })
  }

  async onAfterRenderAnimateItem?(element: HTMLElement): Promise<void> {
    await element.animate(
      [
        { transform: 'translateX(-100%) scale(.3)', opacity: 0 },
        { transform: 'translateX(0) scale(1)', opacity: 1 },
      ],
      animationOptions
    ).finished
    appendStyle(element, {
      transform: '',
      opacity: '',
    })
  }

  async onBeforeMoveAnimationItem(
    element: HTMLElement,
    oldPosition: number,
    newPosition: number
  ): Promise<HTMLElement | number | null> {
    if (this.renderElements.has(oldPosition)) {
      return this.renderElements.get(oldPosition)!
    }
    const offset = this.getOffsetMoveByMoveElements(oldPosition, newPosition)

    if (oldPosition < newPosition) {
      appendStyle(element, {
        transform: `translateX(${offset}px)`,
      })
      return offset
    }

    await element.animate(
      [{ transform: `translateX(0)` }, { transform: `translateX(${offset}px)` }],
      animationOptions
    ).finished
    return null
  }

  async onAfterMoveAnimationItem(
    element: HTMLElement,
    renderElementOfOffset: HTMLElement | number | null
  ): Promise<void> {
    if (renderElementOfOffset === null) return
    let offset
    if (typeof renderElementOfOffset === 'number') {
      offset = renderElementOfOffset
    } else {
      await asyncFrame()
      offset = renderElementOfOffset.clientWidth * -1 - this.gap
    }
    await element.animate(
      [{ transform: `translateX(${offset}px)` }, { transform: `translateX(0)` }],
      animationOptions
    ).finished
    appendStyle(element, {
      transform: '',
    })
  }

  async onBeforeAnimation(
    container: HTMLElement,
    renderElements: Map<number, HTMLElement>,
    deleteElements: Map<number, HTMLElement>,
    moveElements: Map<[number, number], HTMLElement>
  ) {
    this.deleteElementsWidth.clear()
    this.renderElements.clear()
    this.moveElementsWidth.clear()
    deleteElements.forEach((element, index) => {
      this.deleteElementsWidth.set(index, element.clientWidth)
    })
    moveElements.forEach((element, index) => {
      this.moveElementsWidth.set(index.join(':'), element.clientWidth)
    })
    renderElements.forEach((element, index) => {
      this.renderElements.set(index, element)
    })
  }

  private getOffsetMoveByMoveElements(oldPosition: number, newPosition: number) {
    let offset = 0
    if (this.deleteElementsWidth.has(newPosition)) {
      offset = this.deleteElementsWidth.get(newPosition)!
    } else if (oldPosition > newPosition) {
      this.deleteElementsWidth.forEach((width, index) => {
        if (index > oldPosition) return
        offset = width
      })
    } else {
      offset = this.moveElementsWidth.get([oldPosition - 1, newPosition - 1].join(':')) ?? 0
    }
    return (offset + this.gap) * -1
  }
}
