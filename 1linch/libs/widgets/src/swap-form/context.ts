import { ISwapContext } from '@1inch-community/models'
import { createContext } from '@lit/context'

export const swapContext = createContext<ISwapContext>('swap context')
