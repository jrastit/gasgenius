import { ISelectTokenContext } from '@1inch-community/models'
import { createContext } from '@lit/context'

export const selectTokenContext = createContext<ISelectTokenContext>(Symbol('select token context'))
