import { IPersistSyncStorage } from '@1inch-community/models'
import { BigFloat } from '../math'
import { MemoryStorage } from './memory.storage'

type StorageConfig = {
  storagePrefix?: string
  storageSeparator?: string
}

export class StorageManager implements IPersistSyncStorage {
  private readonly storage: globalThis.Storage = getStorage()

  private get prefix() {
    return this.config.storagePrefix ?? ''
  }

  private get separator() {
    return this.config.storageSeparator ?? ':'
  }

  constructor(private readonly config: StorageConfig) {}

  set<T>(key: string, data: T): void {
    try {
      const _key = this.key(key)
      const strData = typeof data !== 'string' ? JSON.stringify(data) : data
      this.storage.setItem(_key, strData)
    } catch (error) {
      console.error(error)
    }
  }

  get<T>(key: string, parser: (value: string) => T): T | null {
    try {
      const _key = this.key(key)
      const strData = this.storage.getItem(_key)
      if (strData === null) return null
      return parser(strData)
    } catch (error) {
      console.error(error)
      return null
    }
  }

  remove(key: string): void {
    try {
      const _key = this.key(key)
      this.storage.removeItem(_key)
    } catch (error) {
      console.error(error)
    }
  }

  update<T>(key: string, updates: (value: T | null) => T): T {
    const value = this.get<T>(key, JsonParser)
    const newValue = updates(value)
    this.set(key, newValue)
    return newValue
  }

  updateEntity(key: string, entityKey: string, value: unknown) {
    const entity: any = this.get<object>(key, JsonParser) ?? {}
    const newEntity = { ...entity, [entityKey]: value }
    this.set(key, newEntity)
  }

  getEntityValue<T>(key: string, entityKey: string): T | null {
    const entity: any = this.get<object>(key, JsonParser) ?? {}
    return entity[entityKey] ?? null
  }

  private key(rawKey: string): string {
    return [this.prefix, rawKey].join(this.separator)
  }
}

function getStorage(): globalThis.Storage {
  if (isSupportedStorage(window.localStorage)) {
    return window.localStorage
  }
  if (isSupportedStorage(window.sessionStorage)) {
    return window.sessionStorage
  }
  return new MemoryStorage()
}

const testKey = '@__test__@'
function isSupportedStorage(storage: globalThis.Storage): boolean {
  try {
    storage.setItem(testKey, '1')
    const item1 = storage.getItem(testKey)
    storage.removeItem(testKey)
    const item2 = storage.getItem(testKey)
    return item1 === '1' && item2 === null
  } catch {
    return false
  }
}

export function JsonParser<T>(value: string): T {
  return JSON.parse(value)
}

export function JsonBigFloatParser<T>(value: string): T {
  return JSON.parse(value, (key, value) => {
    if (BigFloat.isBigFloat(value)) {
      return BigFloat.parseJSON(value)
    }
    return value
  })
}

export const storage = new StorageManager({
  storagePrefix: 'one-inch',
  storageSeparator: ':',
})
