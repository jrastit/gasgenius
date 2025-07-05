import { BigFloat } from '@1inch-community/core/math'
import { IBigFloat, IToken, NullableValue, TokenSnapshot } from '@1inch-community/models'
import { distinctUntilChanged, map, Observable, shareReplay, startWith, Subject } from 'rxjs'
import { getWrapperNativeToken, isNativeToken } from '../chain'
import { isTokensEqual } from '../tokens'

export class TokenContext {
  private lastSnapshot: NullableValue<TokenSnapshot> = { token: null, amount: null }
  private readonly signalChange$ = new Subject<void>()

  setToken(token: IToken | null) {
    const { token: tokenFromSnap } = this.lastSnapshot
    if (tokenFromSnap && token && isTokensEqual(tokenFromSnap, token)) {
      return
    }
    this.lastSnapshot = { ...this.lastSnapshot, token, amount: BigFloat.zero() }
    this.signalChange$.next()
  }

  setAmount(amount: IBigFloat) {
    const { amount: amountFromSnap } = this.lastSnapshot
    if (amountFromSnap?.isEqualTo(amount)) {
      return
    }
    this.lastSnapshot = { ...this.lastSnapshot, amount }
    this.signalChange$.next()
  }

  getSnapshot(convertToWrapped: boolean = false): NullableValue<TokenSnapshot> {
    if (
      this.lastSnapshot.token &&
      isNativeToken(this.lastSnapshot.token.address) &&
      convertToWrapped
    ) {
      return {
        token: getWrapperNativeToken(this.lastSnapshot.token.chainId),
        amount: this.lastSnapshot.amount,
      }
    }

    return this.lastSnapshot
  }

  streamSnapshot(): Observable<NullableValue<TokenSnapshot>> {
    return this.signalChange$.pipe(
      map(() => this.lastSnapshot),
      startWith(this.lastSnapshot),
      distinctUntilChanged(tokenSnapshotEquals),
      shareReplay({ bufferSize: 1, refCount: true })
    )
  }
}

function tokenSnapshotEquals(
  s1: NullableValue<TokenSnapshot>,
  s2: NullableValue<TokenSnapshot>
): boolean {
  const { token: token1, amount: amount1 } = s1
  const { token: token2, amount: amount2 } = s2
  if (token1 === null || token2 === null || amount1 === null || amount2 === null) {
    return false
  }
  return amount1.isEqualTo(amount2) && isTokensEqual(token1, token2)
}
