export interface DestroyedEntity {
  destroy(): void | Promise<void>
}
