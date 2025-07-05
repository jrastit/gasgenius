import { IEnvironment, IEnvironmentController } from '@1inch-community/models'
import { setEnvironmentValue } from './get-environment-value'

export class EnvironmentController implements IEnvironmentController {
  constructor(private readonly env: IEnvironment) {
    for (const key in env) {
      setEnvironmentValue(key as keyof IEnvironment, (env as any)[key])
    }
  }

  get<K extends keyof IEnvironment>(key: K): IEnvironment[K] {
    return this.env[key]
  }
}
