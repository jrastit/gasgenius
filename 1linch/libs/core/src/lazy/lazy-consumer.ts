import { IApplicationContext, ILazyValue } from '@1inch-community/models'
import { Context, ContextConsumer, ContextType } from '@lit/context'
import type { ReactiveControllerHost } from 'lit'
import { ApplicationContextToken } from '../application-context'
import { ApplicationContextInitializedError } from './lazy-app-context'
import { lazyValue } from './lazy-value'

interface Options<C extends Context<unknown, unknown>> {
  context: C
  callback?: (value: ContextType<C>, dispose?: () => void) => void
  subscribe?: boolean
}

class LazyConsumerError extends Error {
  constructor(host: ReactiveControllerHost & HTMLElement) {
    super(`Lazy consumer not initialized for ${host.tagName}`)
  }
}

export function lazyConsumer<C extends Context<unknown, unknown>>(
  host: ReactiveControllerHost & HTMLElement,
  options: Options<C>
): ILazyValue<ContextType<C>> {
  const context = new ContextConsumer(host, options)
  return lazyValue(
    () => new LazyConsumerError(host),
    () => context.value
  )
}

export function lazyAppContextConsumer(
  host: ReactiveControllerHost & HTMLElement
): ILazyValue<IApplicationContext> {
  const context = new ContextConsumer(host, { context: ApplicationContextToken, subscribe: true })
  return lazyValue(
    () => new ApplicationContextInitializedError(host.tagName),
    () => context.value
  )
}
