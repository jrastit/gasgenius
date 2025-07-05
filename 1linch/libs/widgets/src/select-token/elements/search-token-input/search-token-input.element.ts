import { lazyConsumer } from '@1inch-community/core/lazy'
import { observe, subscribe, translate } from '@1inch-community/core/lit-utils'
import '@1inch-community/ui-components/icon'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { when } from 'lit/directives/when.js'
import { defer, map, of, tap } from 'rxjs'
import { tooltip } from '../../../shared-elements/tooltip'
import { selectTokenContext } from '../../context'
import { searchTokenInputStyle } from './search-token-input.style'

@customElement(SearchTokenInputElement.tagName)
export class SearchTokenInputElement extends LitElement {
  static tagName = 'inch-search-token-input' as const

  static override styles = searchTokenInputStyle

  @state() private isFocused = false
  @state() private searchInProgress = false

  private readonly context = lazyConsumer(this, { context: selectTokenContext })

  private readonly tokenListFlatView$ = defer(() => this.context.value.tokenListFlatView$)

  private readonly tokenListFlatViewToggleIcon$ = this.tokenListFlatView$.pipe(
    map((value) => (value ? 'alignJustify16' : 'alignRight16'))
  )

  private readonly tokenListFlatViewToggleTooltip$ = this.tokenListFlatView$.pipe(
    map((value) =>
      value
        ? html`${translate('inch-search-token-input.flat-list')}`
        : html`${translate('inch-search-token-input.group-by-chain-list')}`
    )
  )

  protected override render() {
    const classes = {
      'search-token-input-container': true,
      'search-token-input-container__focused': this.isFocused,
    }
    return html`
      <div class="${classMap(classes)}">
        <inch-icon icon="search24"></inch-icon>
        <input
          id="search"
          autofocus
          autocomplete="off"
          maxlength="40"
          @input="${(event: InputEvent) => this.onChange(event)}"
          @focus="${() => (this.isFocused = true)}"
          @blur="${() => (this.isFocused = false)}"
          placeholder="Search token by name or address"
          class="search-token-input"
        />
        ${when(
          this.searchInProgress,
          () => html`<span class="loader"></span>`,
          () => html``
        )}
        <inch-button
          ${tooltip(html`${observe(this.tokenListFlatViewToggleTooltip$)}`)}
          type="tertiary-gray"
          @click="${() => this.context.value.tokenListFlatViewToggle()}"
        >
          <inch-icon icon="${observe(this.tokenListFlatViewToggleIcon$)}"></inch-icon>
        </inch-button>
      </div>
    `
  }

  protected override async firstUpdated() {
    subscribe(
      this,
      [
        this.context.value.searchInProgress$.pipe(
          tap((state) => (this.searchInProgress = state))
        ) ?? of(),
      ],
      { requestUpdate: false }
    )
  }

  private onChange(event: InputEvent) {
    const value = (event.target as HTMLInputElement).value
    this.context.value.setSearchToken(value)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'inch-search-token-input': SearchTokenInputElement
  }
}
