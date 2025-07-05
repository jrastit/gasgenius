import { lazyConsumer } from '@1inch-community/core/lazy'
import { LitCustomEvent, observe, subscribe, translate } from '@1inch-community/core/lit-utils'
import { ChainId, TokenType } from '@1inch-community/models'
import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { defer, tap } from 'rxjs'
import '../../../chain-selector'
import { tooltip } from '../../../shared-elements/tooltip'
import { selectTokenContext } from '../../context'
import '../favorite-tokens'
import '../search-token-input'
import { selectTokenHeaderStyle } from './select-token-header.style'

@customElement(SelectTokenHeaderElement.tagName)
export class SelectTokenHeaderElement extends LitElement {
  static tagName = 'inch-select-token-header' as const

  static override styles = selectTokenHeaderStyle

  @property({ type: String }) tokenType?: TokenType

  private readonly selectTokenContext = lazyConsumer(this, { context: selectTokenContext })

  private readonly chainListView$ = defer(() => this.selectTokenContext.value.chainListView$)

  private readonly disabledChainSelector$ = defer(
    () => this.selectTokenContext.value.isSupportCrossChain$
  ).pipe(tap((state) => (this.disabledChainSelector = !state)))

  @state() private disabledChainSelector = false

  protected firstUpdated() {
    subscribe(this, [this.disabledChainSelector$])
  }

  protected render() {
    return html`
      <div style="margin-left: 1px; margin-right: 1px; pointer-events: auto;">
        <inch-card-header backButton>
          <inch-chain-selector
            ${tooltip({
              text: html`${translate('inch-select-token-header.chain-selector-tooltip')}`,
              disabled: !this.disabledChainSelector,
            })}
            slot="center-container"
            disabled="${ifDefined(this.disabledChainSelector ? true : undefined)}"
            .selectedChainIdList="${observe(this.chainListView$)}"
            @changeSelectedChainIdList="${(event: LitCustomEvent<ChainId[]>) =>
              this.selectTokenContext.value.onChangeChainFilter(event.detail.value)}"
          ></inch-chain-selector>
        </inch-card-header>
        <inch-search-token-input></inch-search-token-input>
        <inch-favorite-tokens></inch-favorite-tokens>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [SelectTokenHeaderElement.tagName]: SelectTokenHeaderElement
  }
}
