import { ILazyInitializer, LazyInitializerFactory } from '@1inch-community/models'

export class LazyInitializer<T> implements ILazyInitializer<T> {
  private _value: T | undefined

  get value(): T {
    this.init()
    return this._value as T
  }

  constructor(private readonly factory: () => T) {}

  private init() {
    if (this._value !== undefined) return
    this._value = this.factory()
  }
}

export const lazy: LazyInitializerFactory = <T>(factory: () => T): ILazyInitializer<T> =>
  new LazyInitializer(factory)
