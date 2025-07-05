import { IApplicationContext, InitializingEntity } from '@1inch-community/models'
import { lazyAppContext } from '../lazy'

export class TTLStorage implements InitializingEntity {
  private readonly context = lazyAppContext('TTLStorage')
  private timestamp = 0

  constructor(
    private readonly key: string,
    private readonly expireTime: number
  ) {}

  async init(context: IApplicationContext): Promise<void> {
    this.context.set(context)
    this.timestamp = this.context.value.storage.get<number>(this.key, Number) ?? 0
  }

  reset(): void {
    this.timestamp = Date.now()
    this.context.value.storage.set(this.key, this.timestamp)
  }

  isExpired(): boolean {
    return Date.now() - this.timestamp > this.expireTime
  }
}
