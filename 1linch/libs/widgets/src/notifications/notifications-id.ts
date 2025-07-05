import { genRandomHex } from '@1inch-community/core/random'

export function getNotificationId(): string {
  return genRandomHex(10)
}
