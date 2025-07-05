import { IApplicationContext, ILazyValue } from '@1inch-community/models'
import { lazyValue } from './lazy-value'

export class ApplicationContextInitializedError extends Error {
  constructor(initPoint?: unknown) {
    super('ApplicationContext not initialized. query point: ' + initPointToString(initPoint))
  }
}

export const lazyAppContext = (initPoint?: unknown): ILazyValue<IApplicationContext> => {
  return lazyValue(() => new ApplicationContextInitializedError(initPoint))
}

function initPointToString(initPoint?: unknown) {
  if (initPoint === undefined || initPoint === null) return 'unknown'
  if (typeof initPoint === 'string') return initPoint
  if (typeof initPoint === 'function') return initPoint.name
  try {
    return initPoint.toString()
  } catch {
    return 'unknown'
  }
}
