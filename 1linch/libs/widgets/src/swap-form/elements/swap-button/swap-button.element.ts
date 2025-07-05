import { CacheActivePromise } from '@1inch-community/core/decorators'
import { lazyAppContextConsumer, lazyConsumer } from '@1inch-community/core/lazy'
import { dispatchEvent, observe, translate } from '@1inch-community/core/lit-utils'
import { BigFloat } from '@1inch-community/core/math'
import { JsonParser } from '@1inch-community/core/storage'
import {
  ChainId,
  IBigFloat,
  IToken,
  Rate,
  RateSource,
  ResolverActions,
  TokenRecordId,
} from '@1inch-community/models'
import { getChainById, isChainId } from '@1inch-community/sdk/chain'
import { SwapContextToken } from '@1inch-community/sdk/swap'
import { buildTokenIdByToken, isTokensEqual } from '@1inch-community/sdk/tokens'
import '@1inch-community/ui-components/button'
import '@1inch-community/ui-components/text-animate'
import { textAnimateHover } from '@1inch-community/ui-components/text-animate'
import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { DirectiveResult } from 'lit/directive.js'
import { createRef, ref } from 'lit/directives/ref.js'
import {
  combineLatest,
  debounceTime,
  defer,
  distinctUntilChanged,
  firstValueFrom,
  map,
  merge,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs'
import { Address, isAddress } from 'viem'
import { swapButtonStyle } from './swap-button.style'

enum SwapButtonState {
  initialize,
  readyToSwap,
  readyToSwapLoading,
  needChangeChainInWallet,
  walletNotConnected,
  unselectedSourceToken,
  unselectedDestinationToken,
  zeroAmount,
  exceedingMaximumAmount,
  rateNotExist,
  checkAllowance,
  updateSwapData,

  wrap,
  approve,
  permit,
  wrapAndApprove,
  wrapAndPermit,
  approveAndPermit,
  wrapAndApproveAndPermit,

  waitingWrapTokenTransaction,
  waitingApproveTransaction,
  waitingSignPermit,
}

const showLoader = new Set([
  SwapButtonState.initialize,
  SwapButtonState.checkAllowance,
  SwapButtonState.updateSwapData,
  SwapButtonState.waitingApproveTransaction,
  SwapButtonState.waitingWrapTokenTransaction,
  SwapButtonState.readyToSwapLoading,
])

const prepareSwapStates = new Map<string, SwapButtonState>([
  ['Wrap', SwapButtonState.wrap],
  ['Approve', SwapButtonState.approve],
  ['SignPermit', SwapButtonState.permit],
  ['Wrap&Approve', SwapButtonState.wrapAndApprove],
  ['Wrap&SignPermit', SwapButtonState.wrapAndPermit],
  ['Approve&SignPermit', SwapButtonState.approveAndPermit],
  ['Wrap&Approve&SignPermit', SwapButtonState.wrapAndApproveAndPermit],
])

const waitPrepareSwapState = new Map<string, SwapButtonState>([
  ['Wrap', SwapButtonState.waitingWrapTokenTransaction],
  ['Approve', SwapButtonState.waitingApproveTransaction],
  ['SignPermit', SwapButtonState.waitingSignPermit],
])

let prepareSwapActions: ResolverActions | null
const alreadyPrepared = new Set<TokenRecordId>()

const skipCheck: ReadonlySet<SwapButtonState> = new Set([
  SwapButtonState.readyToSwap,
  SwapButtonState.checkAllowance,
  SwapButtonState.wrap,
  SwapButtonState.approve,
  SwapButtonState.permit,
  SwapButtonState.wrapAndApprove,
  SwapButtonState.wrapAndPermit,
  SwapButtonState.approveAndPermit,
  SwapButtonState.wrapAndApproveAndPermit,
  SwapButtonState.readyToSwapLoading,
  SwapButtonState.waitingWrapTokenTransaction,
  SwapButtonState.waitingApproveTransaction,
  SwapButtonState.waitingSignPermit,
])

const textRecord: Record<SwapButtonState, (params?: Record<string, string>) => DirectiveResult> = {
  [SwapButtonState.initialize]: () => translate('widgets.swap-form.swap-button.preparation'),
  [SwapButtonState.readyToSwap]: () => translate('widgets.swap-form.swap-button.confirm-swap'),
  [SwapButtonState.readyToSwapLoading]: () =>
    translate('widgets.swap-form.swap-button.confirm-swap'),
  [SwapButtonState.needChangeChainInWallet]: (params) =>
    translate('widgets.swap-form.swap-button.need-change-chain', params),
  [SwapButtonState.walletNotConnected]: () =>
    translate('widgets.swap-form.swap-button.connect-wallet'),
  [SwapButtonState.unselectedSourceToken]: () =>
    translate('widgets.swap-form.swap-button.select-source-token'),
  [SwapButtonState.unselectedDestinationToken]: () =>
    translate('widgets.swap-form.swap-button.select-destination-token'),
  [SwapButtonState.zeroAmount]: () =>
    translate('widgets.swap-form.swap-button.enter-amount-to-swap'),
  [SwapButtonState.exceedingMaximumAmount]: (params) =>
    translate('widgets.swap-form.swap-button.insufficient-balance', params),
  [SwapButtonState.rateNotExist]: () =>
    translate('widgets.swap-form.swap-button.no-liquidity-for-swap'),
  [SwapButtonState.checkAllowance]: () =>
    translate('widgets.swap-form.swap-button.check-allowance'),
  [SwapButtonState.updateSwapData]: () =>
    translate('widgets.swap-form.swap-button.update-swap-data'),

  [SwapButtonState.wrap]: () => translate('widgets.swap-form.swap-button.wrap-native-token'),
  [SwapButtonState.approve]: () => translate('widgets.swap-form.swap-button.approve'),
  [SwapButtonState.permit]: () => translate('widgets.swap-form.swap-button.sign'),
  [SwapButtonState.wrapAndApprove]: () => translate('widgets.swap-form.swap-button.wrap-approve'),
  [SwapButtonState.wrapAndPermit]: () => translate('widgets.swap-form.swap-button.wrap-sign'),
  [SwapButtonState.approveAndPermit]: () => translate('widgets.swap-form.swap-button.approve-sign'),
  [SwapButtonState.wrapAndApproveAndPermit]: () =>
    translate('widgets.swap-form.swap-button.wrap-approve-sign'),

  [SwapButtonState.waitingWrapTokenTransaction]: () =>
    translate('widgets.swap-form.swap-button.waiting-wrap-transaction'),
  [SwapButtonState.waitingApproveTransaction]: () =>
    translate('widgets.swap-form.swap-button.waiting-approve-transaction'),
  [SwapButtonState.waitingSignPermit]: () =>
    translate('widgets.swap-form.swap-button.waiting-sign-permit'),
}

const textHoverRecord: Partial<
  Record<SwapButtonState, (params?: Record<string, string>) => DirectiveResult>
> = {
  [SwapButtonState.exceedingMaximumAmount]: (params) =>
    translate('widgets.swap-form.swap-button.set-max', params),
  [SwapButtonState.needChangeChainInWallet]: (params) =>
    translate('widgets.swap-form.swap-button.need-change-chain-hover', params),
}

@customElement(SwapButtonElement.tagName)
export class SwapButtonElement extends LitElement {
  static tagName = 'inch-swap-button' as const

  static override styles = swapButtonStyle

  @property({ type: Boolean, attribute: false }) mobileView = false

  readonly context = lazyConsumer(this, { context: SwapContextToken })
  readonly applicationContext = lazyAppContextConsumer(this)

  @state() buttonState: SwapButtonState = SwapButtonState.initialize

  private readonly buttonRef = createRef<HTMLElement>()

  readonly updateView$ = new Subject<void>()
  private readonly connectedWalletAddress$ = defer(() => this.context.value.connectedWalletAddress$)

  private readonly sourceToken$ = defer(() => this.context.value.getTokenByType('source')).pipe(
    distinctUntilChanged((previous, current) => isTokensEqual(previous, current)),
    tap(() => this.setButtonState(SwapButtonState.initialize)),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  private readonly destinationToken$ = defer(() => this.context.value.getTokenByType('destination'))
  private readonly walletChainId$ = defer(() => this.context.value.walletChainId$)
  private readonly sourceTokenChainId$ = this.sourceToken$.pipe(
    map((token) => token?.chainId ?? null)
  )
  private readonly sourceTokenAmount$ = defer(() =>
    this.context.value.getTokenRawAmountByType('source').pipe(
      distinctUntilChanged((previous, current) => previous?.value === current?.value),
      tap(() => this.setButtonState(SwapButtonState.initialize))
    )
  )
  private readonly rate$ = defer(() =>
    this.context.value.dataSnapshot$.pipe(switchMap((snapshot) => of(snapshot?.rate ?? null)))
  )
  private readonly loading$ = defer(() => this.context.value.loading$)
  private readonly block$ = this.sourceTokenChainId$.pipe(
    switchMap((chainId) =>
      chainId && isChainId(chainId)
        ? this.applicationContext.value.onChain.getBlockEmitter(chainId)
        : []
    )
  )

  private readonly exceedingMaximumAmount$ = combineLatest([
    this.connectedWalletAddress$,
    this.sourceToken$,
    this.sourceTokenAmount$.pipe(startWith(BigFloat.zero())),
    merge(this.block$).pipe(startWith(null)),
  ]).pipe(
    switchMap(async ([wallet, sourceToken, amount]) => {
      if (!wallet || !sourceToken || amount?.isZero()) return false
      const balance = await this.context.value.getMaxAmount()
      if (balance.isZero()) return true
      return !amount || balance.isLessThan(amount)
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  private readonly buttonStatus$ = combineLatest([
    this.connectedWalletAddress$,
    this.sourceToken$,
    this.destinationToken$,
    this.exceedingMaximumAmount$,
    this.sourceTokenAmount$.pipe(startWith(BigFloat.zero())),
    this.walletChainId$,
    this.rate$.pipe(startWith(null)),
    this.loading$,
    // update status streams
    merge(this.block$, this.updateView$).pipe(startWith(null)),
  ]).pipe(
    debounceTime(500),
    switchMap((params, index) => {
      const [
        walletAddress,
        srcToken,
        dstToken,
        exceedingMaximumAmount,
        amount,
        chainId,
        rate,
        loading,
      ] = params

      if (skipCheck.has(this.buttonState)) {
        return of(this.buttonState)
      }

      return this.updateButtonState(
        index === 0,
        chainId,
        walletAddress,
        srcToken,
        dstToken,
        amount,
        rate,
        exceedingMaximumAmount,
        loading
      )
    }),
    map(() => this.buttonState),
    tap((state) => {
      this.applicationContext.value.storage.set('fusion_swap_button_state', state)
    }),
    startWith(this.buttonState),
    debounceTime(0),
    distinctUntilChanged(),
    shareReplay({ refCount: true, bufferSize: 1 })
  )

  private readonly buttonText$ = this.buttonStatus$.pipe(
    withLatestFrom(this.sourceToken$),
    map(([state, sourceToken]) => {
      const symbol = sourceToken?.symbol ?? ''
      const chainId = sourceToken?.chainId ?? ChainId.eth
      const chain = getChainById(chainId)
      const chainName = chain.name
      return textRecord[state]({ symbol, chainName })
    })
  )

  private readonly buttonHoverText$ = this.buttonStatus$.pipe(
    withLatestFrom(this.sourceToken$),
    map(([state, sourceToken]) => {
      const symbol = sourceToken?.symbol ?? ''
      const chainId = sourceToken?.chainId ?? ChainId.eth
      const chain = getChainById(chainId)
      const chainName = chain.name
      return textHoverRecord[state]?.({ symbol, chainName })
    })
  )

  private readonly buttonLoading$ = this.buttonStatus$.pipe(
    map((state) => {
      return showLoader.has(state)
    })
  )

  connectedCallback() {
    super.connectedCallback()
    const state =
      this.applicationContext.value.storage.get<SwapButtonState>(
        'fusion_swap_button_state',
        JsonParser
      ) ?? this.buttonState
    if (!skipCheck.has(state)) {
      this.setButtonState(SwapButtonState.initialize)
    }
  }

  protected override render() {
    const size = this.mobileView ? 'xl' : 'xxl'
    return html`
      <inch-button
        ${ref(this.buttonRef)}
        @click="${() => this.onClickSwapButton()}"
        .loader="${observe(this.buttonLoading$, false)}"
        type="secondary"
        size="${size}"
        fullSize
      >
        <inch-text-animate
          ${textAnimateHover({
            target: () => this.buttonRef.value,
            text$: this.buttonText$,
            hoverText$: this.buttonHoverText$,
          })}
          disabledHostTransition
        ></inch-text-animate>
      </inch-button>
    `
  }

  private async updateButtonState(
    isFirstCall: boolean,
    walletChainId: ChainId | null,
    walletAddress: Address | null,
    sourceToken: IToken | null,
    destinationToken: IToken | null,
    sourceTokenAmount: IBigFloat | null,
    rate: Rate | null,
    exceedingMaximumAmount: boolean,
    loading: boolean
  ) {
    const state = this.calculateButtonStateSimple(
      isFirstCall,
      walletChainId,
      walletAddress,
      sourceToken,
      destinationToken,
      sourceTokenAmount,
      rate,
      exceedingMaximumAmount,
      loading
    )

    this.setButtonState(state)

    if (state === SwapButtonState.checkAllowance && sourceToken) {
      await this.runPrepareSwapProcess(sourceToken)
    }
  }

  private async runPrepareSwapProcess(sourceToken: IToken): Promise<void> {
    if (alreadyPrepared.has(buildTokenIdByToken(sourceToken))) {
      this.setButtonState(SwapButtonState.readyToSwap)
      return
    }
    dispatchEvent(this, 'lockView', null)

    const context = this.context.value
    const snapshot = await context.getSnapshot()

    prepareSwapActions = null

    if (!snapshot) {
      throw new Error('snapshot must be presented')
    }

    prepareSwapActions = await this.context.value.prepareSwap(snapshot)

    if (prepareSwapActions.length === 0) {
      alreadyPrepared.add(buildTokenIdByToken(snapshot.sourceToken))
      this.setButtonState(SwapButtonState.readyToSwap)
    } else {
      const joinedActions = prepareSwapActions.map((action) => action.alias).join('&')
      const state = prepareSwapStates.get(joinedActions)

      if (!state) {
        throw new Error(`unknown actions state ${joinedActions}`)
      }
      this.setButtonState(state)
    }
  }

  private async executeActionsBeforeConfirmSwap(): Promise<void> {
    for (const action of prepareSwapActions || []) {
      const state = waitPrepareSwapState.get(action.alias)

      this.setButtonState(state ?? this.buttonState)

      await action.wait()
    }

    const sourceToken = await firstValueFrom(this.sourceToken$)

    if (sourceToken) {
      alreadyPrepared.delete(buildTokenIdByToken(sourceToken))
    }

    prepareSwapActions = null

    await this.navigateToConfirmSwap()
  }

  private calculateButtonStateSimple(
    isFirstCall: boolean,
    walletChainId: ChainId | null,
    walletAddress: Address | null,
    sourceToken: IToken | null,
    destinationToken: IToken | null,
    sourceTokenAmount: IBigFloat | null,
    rate: Rate | null,
    exceedingMaximumAmount: boolean,
    loading: boolean
  ): SwapButtonState {
    if (walletAddress === null || !isAddress(walletAddress)) {
      return SwapButtonState.walletNotConnected
    }
    if (sourceToken === null) {
      return SwapButtonState.unselectedSourceToken
    }
    if (destinationToken === null) {
      return SwapButtonState.unselectedDestinationToken
    }
    if (sourceTokenAmount === null || sourceTokenAmount.isZero()) {
      return SwapButtonState.zeroAmount
    }
    if (exceedingMaximumAmount) {
      return SwapButtonState.exceedingMaximumAmount
    }
    if (loading && (isFirstCall || rate === null)) {
      return SwapButtonState.updateSwapData
    }
    if (rate === null || rate.source === RateSource.onChain) {
      return SwapButtonState.rateNotExist
    }
    if (sourceToken.chainId !== walletChainId) {
      return SwapButtonState.needChangeChainInWallet
    }
    return SwapButtonState.checkAllowance
  }

  private setButtonState(state: SwapButtonState) {
    this.buttonState = state
    this.updateView$.next()
  }

  private async navigateToConfirmSwap(): Promise<void> {
    this.setButtonState(SwapButtonState.readyToSwapLoading)
    const snapshot = await this.context.value.getSnapshot(/* finalize */ true)

    if (snapshot) {
      dispatchEvent(this, 'confirmSwap', snapshot)
    }
  }

  private async changeWalletChain(): Promise<void> {
    const token = await firstValueFrom(this.context.value.getTokenByType('source'))
    const chainId = token?.chainId ?? ChainId.eth
    await this.applicationContext.value.wallet.changeChain(chainId)
  }

  private async connectWallet(): Promise<void> {
    dispatchEvent(this, 'connectWallet', null)
  }

  private async openSrcTokenSelector(): Promise<void> {
    dispatchEvent(this, 'openTokenSelector', 'source')
  }

  private async openDstTokenSelector(): Promise<void> {
    dispatchEvent(this, 'openTokenSelector', 'source')
  }

  private async setMaxAmount(): Promise<void> {
    await this.context.value.setMaxAmount()
  }

  @CacheActivePromise()
  private async onClickSwapButton() {
    try {
      switch (this.buttonState) {
        case SwapButtonState.readyToSwap:
          return await this.navigateToConfirmSwap()

        case SwapButtonState.needChangeChainInWallet:
          return await this.changeWalletChain()

        case SwapButtonState.walletNotConnected:
          return await this.connectWallet()

        case SwapButtonState.unselectedSourceToken:
          return await this.openSrcTokenSelector()

        case SwapButtonState.unselectedDestinationToken:
          return await this.openDstTokenSelector()

        case SwapButtonState.exceedingMaximumAmount:
          return await this.setMaxAmount()

        case SwapButtonState.wrap:
        case SwapButtonState.approve:
        case SwapButtonState.permit:
        case SwapButtonState.wrapAndApprove:
        case SwapButtonState.wrapAndPermit:
        case SwapButtonState.approveAndPermit:
        case SwapButtonState.wrapAndApproveAndPermit:
          return await this.executeActionsBeforeConfirmSwap()
        default:
      }
    } catch (e) {
      const sourceToken = await firstValueFrom(this.sourceToken$)

      if (sourceToken) {
        alreadyPrepared.delete(buildTokenIdByToken(sourceToken))
      }
      dispatchEvent(this, 'unlockView', null)
      this.setButtonState(SwapButtonState.initialize)
      console.error(e)
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [SwapButtonElement.tagName]: SwapButtonElement
  }
}
