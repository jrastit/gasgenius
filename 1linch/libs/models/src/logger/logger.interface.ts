import { InitializingEntity } from '../base'

export interface ILogger extends InitializingEntity {
  error(error: unknown): void
}
