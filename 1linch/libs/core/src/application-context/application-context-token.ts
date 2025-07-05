import { IApplicationContext } from '@1inch-community/models'
import { createContext } from '@lit/context'

export const ApplicationContextToken = createContext<IApplicationContext>(
  Symbol('ApplicationContextToken')
)
