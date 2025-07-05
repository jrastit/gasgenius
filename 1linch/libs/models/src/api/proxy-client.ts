import { InitializingEntity } from '../base'

export interface IProxyClient extends InitializingEntity {
  readonly isAuth: boolean
  get<T>(url: string): Promise<T>
  post<T, Body = unknown>(url: string, body: Body): Promise<T>
}
