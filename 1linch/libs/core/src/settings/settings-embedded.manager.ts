import {
  EmbeddedBootstrapConfig,
  IApplicationContext,
  ISettingController,
  ISettingsManager,
} from '@1inch-community/models'
import { SettingController } from './setting.controller'

export class SettingsEmbeddedManager implements ISettingsManager {
  private readonly settings: Map<string, ISettingController<unknown>> = new Map()
  private context?: IApplicationContext

  constructor(private readonly config: EmbeddedBootstrapConfig) {}

  async init(context: IApplicationContext): Promise<void> {
    this.context = context
  }

  getSetting<Value>(name: string, initialValue?: Value): ISettingController<Value> {
    if (!this.context)
      throw new Error('SettingsManager.getSetting Error: context is not initialized')
    if (this.settings.has(name)) return this.settings.get(name) as ISettingController<Value>
    const setting = new SettingController(name, initialValue)
    setting.init(this.context).then()
    this.settings.set(name, setting)
    return setting
  }
}
