import { Observable } from 'rxjs'
import { InitializingEntity } from '../base'

export interface ISettingController<Value> extends InitializingEntity {
  readonly name: string
  readonly value: Value | null
  readonly value$: Observable<Value | null>
  setValue(value: Value): void
  resetValue(): void
  cleanValue(): void
  startChangingValue(): void
  endChangingValue(): void
}
