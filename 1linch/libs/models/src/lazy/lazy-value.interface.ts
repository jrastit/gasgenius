export interface ILazyValue<T> {
  readonly value: T
  readonly isInit: boolean
  set(value: T): void
}

export type LazyValueFactory = <T>(
  error: () => Error | string,
  setter?: () => T | undefined
) => ILazyValue<T>
