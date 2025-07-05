export class MemoryStorage implements globalThis.Storage {
  private readonly storage = new Map<string, string>()

  get length(): number {
    return this.storage.size
  }

  clear(): void {
    this.storage.clear()
  }

  getItem(key: string): string | null {
    return this.storage.get(key) ?? null
  }

  key(index: number): string | null {
    return [...this.storage.keys()][index]
  }

  removeItem(key: string): void {
    this.storage.delete(key)
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value)
  }
}
