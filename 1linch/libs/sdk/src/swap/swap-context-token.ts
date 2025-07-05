import { ISwapContext } from '@1inch-community/models'
import { createContext } from '@lit/context'

export const SwapContextToken = createContext<ISwapContext>(Symbol('SwapContextToken'))
