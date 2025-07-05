import { BigFloat } from '@1inch-community/core/math'
import { JsonParser } from '@1inch-community/core/storage'
import {
  IApplicationContext,
  IBigFloat,
  IToken,
  NullableValue,
  Pair,
  TokenType,
} from '@1inch-community/models'
import { startWith, Subject, switchMap } from 'rxjs'
import { isTokensEqual } from '../tokens'
import { TokenContext } from './token-context'

export class PairHolder {
  private source = new TokenContext()
  private destination = new TokenContext()

  private readonly pairChance$ = new Subject<void>()

  constructor(private readonly applicationContext: IApplicationContext) {
    this.restorePair()
  }

  restorePair() {
    this.restoreToken('source')
    this.restoreToken('destination')
  }

  switchPair() {
    const { source, destination } = this
    this.source = destination
    this.destination = source
    this.updateTokenStore('source')
    this.updateTokenStore('destination')
    this.pairChance$.next()
  }

  setPair(pair: NullableValue<Pair>): void {
    this.setTokenInner(pair.source, 'source')
    this.setTokenInner(pair.destination, 'destination')
    this.pairChance$.next()
  }

  setToken(token: IToken | null, tokenType: TokenType) {
    if (tokenType === 'source' && token !== null) {
      const destinationTokenSnap = this.destination.getSnapshot()
      if (destinationTokenSnap.token !== null && isTokensEqual(token, destinationTokenSnap.token)) {
        return this.switchPair()
      }
      if (
        (destinationTokenSnap.token !== null &&
          destinationTokenSnap.token.isSupportCrossChain !== token.isSupportCrossChain) ||
        (destinationTokenSnap.token !== null &&
          !destinationTokenSnap.token.isSupportCrossChain &&
          destinationTokenSnap.token.isSupportCrossChain === token.isSupportCrossChain &&
          destinationTokenSnap.token.chainId !== token.chainId)
      ) {
        this.setTokenInner(null, 'destination')
      }
    }
    if (tokenType === 'destination' && token !== null) {
      const sourceTokenSnap = this.source.getSnapshot()
      if (sourceTokenSnap.token !== null && isTokensEqual(token, sourceTokenSnap.token)) {
        return this.switchPair()
      }
    }
    this.setTokenInner(token, tokenType)
  }

  setAmount(tokenType: TokenType, value: IBigFloat) {
    this.getTokenContext(tokenType).setAmount(value)
    this.updateTokenStore(tokenType)
  }

  streamSnapshot(tokenType: TokenType) {
    return this.pairChance$.pipe(
      startWith(null),
      switchMap(() => this.getTokenContext(tokenType).streamSnapshot())
    )
  }

  getSnapshot(tokenType: TokenType, convertToWrapped: boolean = false) {
    return this.getTokenContext(tokenType).getSnapshot(convertToWrapped)
  }

  private setTokenInner(token: IToken | null, tokenType: TokenType) {
    this.getTokenContext(tokenType).setToken(token)
    this.updateTokenStore(tokenType)
  }

  private getTokenContext(tokenType: TokenType) {
    if (tokenType === 'source') {
      return this.source
    }
    if (tokenType === 'destination') {
      return this.destination
    }
    throw new Error(`invalid token type ${tokenType}`)
  }

  private updateTokenStore(tokenType: TokenType) {
    const tokenContext = this.getTokenContext(tokenType)
    const snapshot = tokenContext.getSnapshot()
    if (snapshot.token !== null) {
      const { symbol, address, chainId, name, decimals, isSupportCrossChain, isInternalWrapToken } =
        snapshot.token
      const amount = snapshot.amount
      const jsonAmount = amount?.toJSON()
      this.applicationContext.storage.set(this.tokenStoreKey(tokenType), {
        symbol,
        address,
        chainId,
        name,
        decimals,
        isSupportCrossChain,
        isInternalWrapToken,
        amount: jsonAmount,
      } satisfies IToken & { amount?: string })
    }
  }

  private restoreToken(tokenType: TokenType) {
    const tokenContext = this.getTokenContext(tokenType)
    const token = this.applicationContext.storage.get<IToken & { amount: string }>(
      this.tokenStoreKey(tokenType),
      JsonParser
    )

    if (token !== null) {
      const amount = BigFloat.isBigFloat(token.amount)
        ? BigFloat.parseJSON(token.amount)
        : BigFloat.zero()
      tokenContext.setToken(token)
      tokenContext.setAmount(amount)
    }
  }

  private tokenStoreKey(tokenType: TokenType) {
    return `token_${tokenType}_v2`
  }
}
