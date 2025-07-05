import { NotificationConfig } from '@1inch-community/models'

export interface INotificationsControllerInternal {
  closeNotifications(): Promise<void>
  removeNotifications(): Promise<void>
  removeNotification(id: string): Promise<void>
}

export type NotificationRecord = {
  id: string
  config: NotificationConfig
  timestamp: number
  element: HTMLElement
}
