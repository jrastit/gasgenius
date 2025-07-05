import { InitializingEntity } from '../base'

export interface ITurnstileController extends InitializingEntity {
  getToken(): Promise<string>
}
