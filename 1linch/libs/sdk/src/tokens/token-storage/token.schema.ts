import { buildDatabaseSchema } from '@1inch-community/core/database'
import { lazyAppContext } from '@1inch-community/core/lazy'
import { TtlMapStorage, TTLStorage } from '@1inch-community/core/storage'
import {
  BalanceTokenRecordId,
  IApplicationContext,
  IBalancesTokenRecord,
  ICrossChainTokensBindingRecord,
  InitializingEntity,
  ITokenPriceRecord,
  ITokenRecord,
  TokenRecordId,
} from '@1inch-community/models'
import type { Table } from 'dexie'
import { Subject } from 'rxjs'
import { type Address } from 'viem'

interface TokenSchemaDatabase {
  readonly tokens: Table<ITokenRecord, TokenRecordId>
  readonly balances: Table<IBalancesTokenRecord, BalanceTokenRecordId>
  readonly tokenPrice: Table<ITokenPriceRecord, TokenRecordId>
  readonly crossChainTokensBinding: Table<ICrossChainTokensBindingRecord, string>
  readonly favoriteTokens: Table<{ id: TokenRecordId }, string>
}

type UpdateEmitters = Record<
  keyof Omit<TokenSchemaDatabase, 'crossChainTokensBinding'>,
  Subject<unknown>
>

export class TokenSchema implements InitializingEntity, TokenSchemaDatabase {
  static databaseVersion = 1
  static databaseName = 'one-inch-token-v3'

  private database?: TokenSchemaDatabase

  private readonly context = lazyAppContext('TokenSchema')

  private readonly tokensTTL = new TTLStorage(
    buildTTLStorageName('tokens'),
    6.048e8 as const // week,
  )

  private readonly balancesTTL = new TtlMapStorage<Address>(buildTTLStorageName('balances'), 12000)

  private readonly tokenPriceTTL = new TTLStorage(buildTTLStorageName('tokenPrice'), 12000)

  readonly updateEmitters: UpdateEmitters = {
    tokens: new Subject(),
    balances: new Subject(),
    tokenPrice: new Subject(),
    favoriteTokens: new Subject(),
  }

  get tokens() {
    if (!this.database) throw new Error('token database not init')
    return this.database.tokens
  }

  get balances() {
    if (!this.database) throw new Error('token database not init')
    return this.database.balances
  }

  get tokenPrice() {
    if (!this.database) throw new Error('token database not init')
    return this.database.tokenPrice
  }

  get crossChainTokensBinding() {
    if (!this.database) throw new Error('token database not init')
    return this.database.crossChainTokensBinding
  }

  get favoriteTokens() {
    if (!this.database) throw new Error('token database not init')
    return this.database.favoriteTokens
  }

  async init(context: IApplicationContext) {
    this.context.set(context)
    const [Dexie] = await Promise.all([
      import('dexie').then((m) => m.Dexie),
      this.tokensTTL.init(context),
      this.balancesTTL.init(context),
      this.tokenPriceTTL.init(context),
    ])
    const db = new Dexie(TokenSchema.databaseName)
    db.version(TokenSchema.databaseVersion).stores({
      tokens: buildDatabaseSchema<ITokenRecord>(
        '&id',
        'address',
        'decimals',
        'chainId',
        'name',
        'symbol',
        '*tags',
        'eip2612',
        'logoURL',
        'priority',
        'isSupportCrossChain'
      ),
      balances: buildDatabaseSchema<IBalancesTokenRecord>(
        '&id',
        'tokenRecordId',
        'chainId',
        'tokenAddress',
        'walletAddress',
        'amount'
      ),
      tokenPrice: buildDatabaseSchema<ITokenPriceRecord>(
        '&id',
        'tokenRecordId',
        'chainId',
        'price'
      ),
      crossChainTokensBinding: buildDatabaseSchema<ICrossChainTokensBindingRecord>(
        '&symbol',
        '*tokenRecordIds',
        '*tokenAddresses',
        '*tokenNames',
        'supportedChainIds',
        'priority'
      ),
      favoriteTokens: buildDatabaseSchema<{ id: TokenRecordId }>('&id'),
    })
    this.database = db as unknown as TokenSchemaDatabase
  }

  tokensIsExpired() {
    return this.tokensTTL.isExpired()
  }

  balancesIsExpired(walletAddress: Address) {
    return this.balancesTTL.isExpired(walletAddress)
  }

  tokenPriceIsExpired() {
    return this.tokenPriceTTL.isExpired()
  }

  async balancesIsEmpty(walletAddress: Address) {
    const count = await this.balances
      .where('walletAddress')
      .equals(walletAddress.toLowerCase())
      .count()
    return count === 0
  }

  async tokenPriceIsEmpty() {
    const count = await this.tokenPrice.count()
    return count === 0
  }

  updateTokensComplete() {
    this.tokensTTL.reset()
    this.updateEmitters.tokens.next(void 0)
  }

  updateBalancesComplete(walletAddress: Address) {
    this.balancesTTL.reset(walletAddress)
    this.updateEmitters.balances.next(walletAddress)
  }

  updateTokenPriceComplete() {
    this.tokenPriceTTL.reset()
    this.updateEmitters.tokenPrice.next(void 0)
  }

  updateFavoriteTokensComplete() {
    this.updateEmitters.favoriteTokens.next(void 0)
  }
}

function buildTTLStorageName(prefix: string) {
  return `${TokenSchema.databaseName}:${TokenSchema.databaseVersion}:${prefix}`
}
