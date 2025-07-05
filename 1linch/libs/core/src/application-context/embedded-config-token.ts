import { EmbeddedBootstrapConfig } from '@1inch-community/models'
import { createContext } from '@lit/context'

export const EmbeddedConfigToken = createContext<EmbeddedBootstrapConfig>(
  Symbol('EmbeddedConfigToken')
)
