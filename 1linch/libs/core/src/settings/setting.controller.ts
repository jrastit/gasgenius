import { IApplicationContext, ISettingController } from '@1inch-community/models'
import { BehaviorSubject, defer, Observable } from 'rxjs'

const persistStorageKey = 'settings'

export class SettingController<Value> implements ISettingController<Value> {
  private readonly valueState$: BehaviorSubject<Value | null>

  readonly value$: Observable<Value | null> = defer(() => this.valueState$)

  private originalValue: Value | null = null

  private context?: IApplicationContext

  get value(): Value | null {
    return this.valueState$.value
  }

  constructor(
    readonly name: string,
    readonly initValue: Value | null = null
  ) {
    this.valueState$ = new BehaviorSubject(initValue)
  }

  async init(context: IApplicationContext): Promise<void> {
    this.context = context
    const next = this.getPersistValue() ?? this.initValue
    if (next === null) return
    this.setValue(next)
  }

  setValue(value: Value): void {
    this.valueState$.next(value)
    this.updatePersist(value)
  }

  resetValue() {
    this.valueState$.next(this.originalValue)
    this.updatePersist(this.originalValue)
  }

  cleanValue() {
    this.valueState$.next(null)
    this.updatePersist(null)
  }

  startChangingValue() {
    if (this.originalValue !== null) {
      throw new Error('value changing in progress')
    }
    this.originalValue = this.value
  }

  endChangingValue() {
    this.originalValue = null
  }

  private updatePersist<Value>(value: Value) {
    if (!this.context)
      throw new Error('SettingController.updatePersist Error:  context is not initialized')
    this.context.storage.updateEntity(persistStorageKey, this.name, value)
  }

  private getPersistValue(): Value | null {
    if (!this.context)
      throw new Error('SettingController.getPersistValue Error: context is not initialized')
    return this.context.storage.getEntityValue(persistStorageKey, this.name)
  }
}
