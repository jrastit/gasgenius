import { DestroyedEntity, InitializingEntity } from '../base'

export interface ITheme extends InitializingEntity, DestroyedEntity {
  applyStyle(element: HTMLStyleElement): void
}
