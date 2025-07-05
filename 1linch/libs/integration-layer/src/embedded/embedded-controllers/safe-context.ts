import { IApplicationContext, IGlobalEmbeddedContextElement } from '@1inch-community/models'

export const safeContextMap = new WeakMap<
  any,
  { context: IApplicationContext; root: IGlobalEmbeddedContextElement }
>()
