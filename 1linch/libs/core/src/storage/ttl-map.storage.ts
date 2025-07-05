import { IApplicationContext, InitializingEntity } from '@1inch-community/models'
import { lazyAppContext } from '../lazy'
import { JsonParser } from './storage.manager'

type ExpireFnOrTime<ExpireProps> = number | ((props: ExpireProps) => number)

export class TtlMapStorage<Key, ExpireProps = unknown> implements InitializingEntity {
  private readonly context = lazyAppContext('TtlMapStorage')
  private lastUpdateTimestampMap: Map<Key, number> = new Map()

  constructor(
    private readonly key: string,
    private readonly expireFnOrTime: ExpireFnOrTime<ExpireProps>
  ) {}

  async init(context: IApplicationContext): Promise<void> {
    this.context.set(context)
    const state = this.context.value.storage.get<[Key, number][]>(this.key, JsonParser)
    this.lastUpdateTimestampMap = new Map(state ?? [])
  }

  reset(key: Key) {
    const timestamp = Date.now()
    this.lastUpdateTimestampMap.set(key, timestamp)
    this.context.value.storage.set(this.key, [...this.lastUpdateTimestampMap.entries()])
  }

  isExpired(key: Key, props?: ExpireProps): boolean {
    const expire =
      typeof this.expireFnOrTime === 'function'
        ? this.expireFnOrTime(props as ExpireProps)
        : this.expireFnOrTime
    const lastUpdateTimestamp = this.lastUpdateTimestampMap.get(key)
    if (!lastUpdateTimestamp) return true
    return Date.now() - lastUpdateTimestamp > expire
  }
}
