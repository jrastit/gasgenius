import { ILazyValue, LazyValueFactory } from '@1inch-community/models'

export class LazyValue<T> implements ILazyValue<T> {
  private _value: T | undefined

  get value(): T {
    if (this._value === undefined && this.setter) {
      this._value = this.setter()
    }
    if (this._value === undefined) {
      const error = this.error()
      if (error instanceof Error) throw error
      throw new Error(error)
    }
    return this._value
  }

  get isInit() {
    if (this._value === undefined && this.setter) {
      this._value = this.setter()
    }
    return this._value !== undefined
  }

  constructor(
    private readonly error: () => Error | string,
    private readonly setter?: () => T | undefined
  ) {}

  set(value: T): void {
    this._value = value
  }
}

export const lazyValue: LazyValueFactory = <T>(
  error: () => Error | string,
  setter?: () => T | undefined
) => new LazyValue<T>(error, setter)
