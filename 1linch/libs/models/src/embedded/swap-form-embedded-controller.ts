import type { EventEmitter } from 'eventemitter3'
import { TokenType } from '../swap'
import { IEmbeddedController } from './embedded-controller'

export interface ISwapFormEmbeddedController extends IEmbeddedController {
  setToken(tokenType: TokenType, symbol: string): Promise<void>
  setSourceTokenAmount(tokenAmount: string): Promise<void>
  onChangeChain(callback: () => void): void
  onConnectWallet(callback: () => void): void
}

export interface __ISwapFormEmbeddedController extends ISwapFormEmbeddedController {
  readonly emitter: EventEmitter<'changeChain' | 'connectWallet'>
}
