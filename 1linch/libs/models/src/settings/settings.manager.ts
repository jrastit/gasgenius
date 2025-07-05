import { InitializingEntity } from '../base'
import { ISettingController } from './setting.controller'

export interface ISettingsManager extends InitializingEntity {
  getSetting<Value>(name: string, initialValue?: Value): ISettingController<Value>
}
