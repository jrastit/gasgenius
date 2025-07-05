import { lazyConsumer } from '@1inch-community/core/lazy'
import {
  appendClass,
  LitCustomEvent,
  observe,
  subscribe,
  translate,
} from '@1inch-community/core/lit-utils'
import { BigFloat } from '@1inch-community/core/math'
import { IBigFloat, TokenType } from '@1inch-community/models'
import { SwapContextToken } from '@1inch-community/sdk/swap'
import { buildTokenIdByToken } from '@1inch-community/sdk/tokens'
import '@1inch-community/ui-components/button'
import '@1inch-community/ui-components/icon'
import '@1inch-community/ui-components/loaders'
import '@1inch-community/ui-components/number-animation'
import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { when } from 'lit/directives/when.js'
import { defer, map, shareReplay, tap } from 'rxjs'
import '../../../shared-elements/balance-view'
import '../../../shared-elements/big-float-input'
import '../../../shared-elements/fiat-amount-view'
import './elements'
import { inputStyle } from './input.style'

@customElement(InputElement.tagName)
export class InputElement extends LitElement {
  static tagName = 'inch-swap-form-input'

  static override styles = inputStyle

  @property({ type: Boolean, attribute: true }) disabled = false
  @property({ type: String, attribute: true }) tokenType?: TokenType

  @state() focused = false
  @state() isLoading = false

  private readonly context = lazyConsumer(this, { context: SwapContextToken, subscribe: true })

  private readonly isLoading$ = defer(() => this.context.value.loading$)
  private readonly token$ = defer(() => this.context.value.getTokenByType(this.tokenType!))
  private readonly amount$ = defer(() => this.context.value.getTokenAmountByType(this.tokenType!))
  private readonly amountString$ = this.amount$.pipe(
    map((amount) => amount?.toFixedSmart(2) ?? '0'),
    shareReplay({ bufferSize: 1, refCount: true })
  )
  private readonly walletAddress$ = defer(() => this.context.value.connectedWalletAddress$)
  private readonly tokenId$ = this.token$.pipe(map((token) => token && buildTokenIdByToken(token)))
  private readonly symbol$ = defer(() => this.token$.pipe(map((token) => token?.symbol)))
  private readonly name$ = defer(() => this.token$.pipe(map((token) => token?.name)))
  private readonly decimals$ = defer(() => this.token$.pipe(map((token) => token?.decimals)))

  protected firstUpdated() {
    subscribe(this, [this.isLoading$.pipe(tap((state) => (this.isLoading = state)))], {
      requestUpdate: false,
    })
  }

  render() {
    appendClass(this, {
      disabled: this.disabled,
      focus: this.focused,
    })
    const title =
      this.tokenType === 'source'
        ? 'widgets.swap-form.input.title.you_pay'
        : 'widgets.swap-form.input.title.you_receive'
    return html`
      <span class="title">${translate(title)}</span>
      <inch-token-select-button
        class="token-icon"
        tokenType="${this.tokenType}"
        .token="${observe(this.token$)}"
      ></inch-token-select-button>
      <span class="token-name">${observe(this.name$)}&nbsp;</span>
      <inch-token-balance-and-max-button
        class="balance"
        .tokenType="${this.tokenType}"
        .symbol="${observe(this.symbol$)}"
        .tokenId="${observe(this.tokenId$)}"
        .walletAddress="${observe(this.walletAddress$)}"
      ></inch-token-balance-and-max-button>
      ${when(
        this.tokenType === 'source',
        () => html`
          <inch-big-float-input
            class="input real-input"
            .disabled="${this.disabled}"
            .value="${observe(this.amount$, BigFloat.zero())}"
            .decimals="${observe(this.decimals$, 6)}"
            @change="${(event: LitCustomEvent<IBigFloat>) => {
              const amount = event.detail.value
              this.context.value.setTokenAmountByType(this.tokenType!, amount)
            }}"
          ></inch-big-float-input>
        `,
        () => html`
          <inch-loader-skeleton-mask
            class="input"
            .showLoader="${observe(this.isLoading$, false)}"
            .text="${observe(this.amountString$)}"
          >
            <inch-number-animation .value="${observe(this.amountString$)}"></inch-number-animation>
          </inch-loader-skeleton-mask>
        `
      )}
      <inch-fiat-amount-view
        class="fiat-balance"
        .amount="${observe(this.amount$, BigFloat.zero())}"
        .tokenId="${observe(this.tokenId$)}"
      ></inch-fiat-amount-view>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'inch-swap-form-input': InputElement
  }
}
