export interface ILazyInitializer<T> {
  readonly value: T
}

export type LazyInitializerFactory = <T>(factory: () => T) => ILazyInitializer<T>
