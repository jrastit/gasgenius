import type { TemplateResult } from 'lit'
import { Observable } from 'rxjs'
import { InitializingEntity } from '../base'

export type NotificationConfig = {
  title?: string
  notCache?: boolean
  errorStyle?: boolean
  warningStyle?: boolean
  customTemplate?: boolean
  pinned?: boolean
}

export interface INotificationsManager extends InitializingEntity {
  readonly notificationsCount$: Observable<number>
  openAllNotifications(): Promise<void>
  show(
    title: string,
    template: string | TemplateResult,
    config?: NotificationConfig
  ): Promise<string>
  error(template: string | TemplateResult): Promise<string>
  warning(template: string | TemplateResult): Promise<string>
}
