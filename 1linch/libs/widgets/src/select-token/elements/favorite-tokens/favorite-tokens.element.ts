import { lazyAppContextConsumer, lazyConsumer } from '@1inch-community/core/lazy'
import {
  animationMap,
  appendClass,
  appendStyle,
  dispatchEvent,
  observe,
  subscribe,
} from '@1inch-community/core/lit-utils'
import { IToken } from '@1inch-community/models'
import { buildTokenIdByToken } from '@1inch-community/sdk/tokens'
import '@1inch-community/ui-components/button'
import '@1inch-community/ui-components/icon'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { createRef, ref } from 'lit/directives/ref.js'
import { BehaviorSubject, defer, fromEvent, map, shareReplay, tap } from 'rxjs'
import '../../../shared-elements/token-list'
import { selectTokenContext } from '../../context'
import { FavoriteTokensAnimationMapController } from './favorite-tokens-animation-map.controller'
import { favoriteTokensStyles } from './favorite-tokens.styles'

@customElement(FavoriteTokensElement.tagName)
export class FavoriteTokensElement extends LitElement {
  static tagName = 'inch-favorite-tokens' as const

  static override styles = [favoriteTokensStyles]

  private readonly context = lazyConsumer(this, { context: selectTokenContext })
  private readonly applicationContext = lazyAppContextConsumer(this)

  readonly editAllMode$ = new BehaviorSubject(false)

  readonly scrollContainerRef = createRef<HTMLElement>()

  private readonly favoriteTokensAnimationMapController = new FavoriteTokensAnimationMapController(
    (token: IToken, event: UIEvent) => this.onRemoveFavoriteToken(token, event),
    (token: IToken) => this.onSelectToken(token),
    () => this.onEditAllToggle()
  )

  private readonly favoriteTokenList$ = defer(() =>
    this.applicationContext.value.tokenStorage.liveQuery(() =>
      this.applicationContext.value.tokenStorage.getAllFavoriteTokens()
    )
  )

  private readonly favoriteTokensView$ = this.favoriteTokenList$.pipe(
    map((tokens, index) => {
      appendClass(this, {
        empty: tokens.length === 0,
        'transition-host': index > 0,
      })
      appendStyle(this, {
        height: `${tokens.length === 0 ? 16 : 60}px`,
      })
      return html`
        <div ${ref(this.scrollContainerRef)} class="favorite-container-scroll">
          <div class="favorite-container">
            ${animationMap(tokens, this.favoriteTokensAnimationMapController)}
          </div>
        </div>
      `
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  protected override firstUpdated() {
    subscribe(
      this,
      [
        this.editAllMode$.pipe(
          tap((state) => {
            appendClass(this, {
              'remove-favorite-token-show': state,
            })
          })
        ),
        fromEvent<WheelEvent>(this, 'wheel').pipe(
          tap((event) => {
            if (!this.scrollContainerRef.value) return
            const element = this.scrollContainerRef.value
            element.scrollLeft += event.deltaY
          })
        ),
      ],
      { requestUpdate: false }
    )
  }

  protected override render() {
    return html`${observe(this.favoriteTokensView$)}`
  }

  private onSelectToken(token: IToken) {
    this.context.value.onSelectToken(token)
    dispatchEvent(this, 'backCard', null)
  }

  private onEditAllToggle() {
    this.editAllMode$.next(!this.editAllMode$.value)
  }

  async onRemoveFavoriteToken(token: IToken, event: UIEvent) {
    event.stopPropagation()
    event.preventDefault()
    const id = buildTokenIdByToken(token)
    await this.applicationContext.value.tokenStorage.changeFavoriteToken(id, false)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'inch-favorite-tokens': FavoriteTokensElement
  }
}
