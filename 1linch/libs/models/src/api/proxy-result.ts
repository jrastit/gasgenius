import type { Address } from 'viem'

export interface ProxyResult<R> {
  id: string
  result: R | null
  error: ProxyResultError | null
}

export interface ProxyResultError {
  code: number
  message: string
}

export type ProxyResultBalanceItem = ProxyResult<Record<Address, string>>
export type ProxyResultBalance = ProxyResultBalanceItem[]

export type ProxyResultTokenPriceItem = ProxyResult<Record<Address, string>>
export type ProxyResultTokenPrice = ProxyResultTokenPriceItem[]
