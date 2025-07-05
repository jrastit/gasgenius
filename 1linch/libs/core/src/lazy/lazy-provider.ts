import { ILazyValue } from '@1inch-community/models'
import { Context, ContextProvider, ContextType } from '@lit/context'
import type { ReactiveControllerHost } from 'lit'

export interface Options<C extends Context<unknown, unknown>> {
  context: C
  initialValue?: ContextType<C>
}

class LazyProviderError extends Error {
  constructor(host: ReactiveControllerHost & HTMLElement, context: Context<unknown, unknown>) {
    super(`Context provider is not available for ${host.tagName} ${context.toString()}`)
  }
}

export class LazyProvider<
  C extends Context<unknown, unknown>,
  T extends ContextType<C> = ContextType<C>,
> implements ILazyValue<T>
{
  private readonly provider: ContextProvider<C>

  get value(): T {
    if (this.provider.value === undefined) {
      throw new LazyProviderError(this.host, this.options.context)
    }
    return this.provider.value as T
  }

  get isInit() {
    return this.provider.value !== undefined
  }

  constructor(
    private readonly host: ReactiveControllerHost & HTMLElement,
    private readonly options: Options<C>
  ) {
    this.provider = new ContextProvider(host, options)
  }

  set(value: T): void {
    this.provider.setValue(value)
  }
}

export const lazyProvider = <C extends Context<unknown, unknown>>(
  host: ReactiveControllerHost & HTMLElement,
  options: Options<C>
): LazyProvider<C> => new LazyProvider(host, options)
