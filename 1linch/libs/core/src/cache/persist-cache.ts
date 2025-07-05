import { IApplicationContext, ICache, InitializingEntity } from '@1inch-community/models'
import { debounceTime } from '../decorators'
import { lazyAppContext } from '../lazy'
import { JsonParser } from '../storage'

export class PersistCache<Key, Value> implements ICache<Key, Value>, InitializingEntity {
  private readonly context = lazyAppContext('PersistCache')
  private cache: Map<Key, Value> = new Map<Key, Value>()

  constructor(
    private readonly key: string,
    private readonly parser = JsonParser
  ) {}

  async init(context: IApplicationContext): Promise<void> {
    this.context.set(context)
    const data = this.context.value.storage.get<[Key, Value][]>(this.key, this.parser)
    if (data) {
      this.cache = new Map(data)
    }
  }

  set(key: Key, value: Value): void {
    this.cache.set(key, value)
    this.updatePersist()
  }

  get(key: Key): Value | null {
    return this.cache.get(key) ?? null
  }

  has(key: Key): boolean {
    return this.cache.has(key)
  }

  delete(key: Key): boolean {
    this.cache.delete(key)
    this.updatePersist()
    return true
  }

  clear(): void {
    this.cache.clear()
    this.updatePersist()
  }

  size(): number {
    return this.cache.size
  }

  @debounceTime(100)
  private updatePersist() {
    const data = Array.from(this.cache.entries())
    this.context.value.storage.set(this.key, data)
  }
}
