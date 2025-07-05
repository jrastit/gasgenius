import { dispatchEvent } from '@1inch-community/core/lit-utils'
import { IToken, TokenRecordId } from '@1inch-community/models'

export function selectToken(ctx: HTMLElement, value: IToken) {
  dispatchEvent(ctx, 'selectToken', value)
}

export function changeExpand(ctx: HTMLElement) {
  dispatchEvent(ctx, 'changeExpand', null)
}

export function changeExpandMore(ctx: HTMLElement) {
  dispatchEvent(ctx, 'changeExpandMore', null)
}

export function favoriteToken(ctx: HTMLElement, value: [boolean, TokenRecordId]) {
  dispatchEvent(ctx, 'favoriteToken', value)
}

export function changeSearchState(ctx: HTMLElement, value: boolean) {
  dispatchEvent(ctx, 'changeSearchState', value)
}
