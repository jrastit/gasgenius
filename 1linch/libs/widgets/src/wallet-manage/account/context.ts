import { IWalletAccountContext } from '@1inch-community/models'
import { createContext } from '@lit/context'

export const walletAccountContext = createContext<IWalletAccountContext>(
  Symbol('wallet account context')
)
