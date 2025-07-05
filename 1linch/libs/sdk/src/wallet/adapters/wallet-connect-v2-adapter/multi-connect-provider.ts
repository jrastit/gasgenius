import { genRandomHex } from '@1inch-community/core/random'
import { storage } from '@1inch-community/core/storage'
import { ChainId, EIP1193Provider, EventMap, RequestArguments } from '@1inch-community/models'
import { EthereumProviderOptions } from '@walletconnect/ethereum-provider'
import { EventEmitter } from 'eventemitter3'
import { fromEvent, merge, Subject, Subscription, tap } from 'rxjs'
import { Address, isAddressEqual } from 'viem'
import type { EthereumProvider } from './ethereum-provider'

type MultiConnectProviderStorage = {
  provider: EthereumProvider
  topic: string
  uri: string
  address: Address
  persistStorePrefix: string
  subscription: Subscription
}

const internalEvents = ['accountsChanged']

export class MultiConnectProvider implements EIP1193Provider {
  readonly connectionUriLink$ = new Subject<string>()
  private readonly storage = new Map<Address, MultiConnectProviderStorage>()
  private activeAddress: Address | null = null
  private readonly eventEmitter = new EventEmitter()

  get chainId() {
    return this.signer()?.chainId ?? ChainId.eth
  }

  private signer(address: Address | null = this.activeAddress): EthereumProvider | null {
    if (address && this.storage.has(address)) {
      return this.storage.get(address)?.provider ?? null
    }
    return null
  }

  async connect(opts?: unknown) {
    const persistStorePrefix = genRandomHex(10)
    try {
      const provider = await makeProvider(persistStorePrefix, opts as EthereumProviderOptions)
      const subscription = this.listenEvents(provider)
      const { topic } = await provider.signer.client.core.pairing.create()
      let originalUri: string = ''

      provider.signer.once('display_uri', (uri: string) => {
        originalUri = uri
        this.connectionUriLink$.next(uri)
      })

      await provider.connect({
        pairingTopic: topic,
      })
      const address = provider.accounts[0] as Address
      if (this.storage.has(address)) {
        return
      }
      const storage: MultiConnectProviderStorage = {
        provider: provider,
        topic: topic,
        uri: originalUri,
        address: address,
        persistStorePrefix,
        subscription,
      }
      this.storage.set(address, storage)
      this.activeAddress = address
      this.updatePersist()
      this.eventEmitter.emit('accountsChanged', this.getAddresses())
    } catch (error) {
      await dropStorage(persistStorePrefix)
      throw error
    }
  }

  async restoreConnect() {
    const persistData = this.getPersistData()
    for (const data of persistData) {
      try {
        const provider = await makeProvider(data.persistStorePrefix)
        const address = provider.accounts[0] as Address
        if (!isAddressEqual(address, data.address as Address)) {
          await dropStorage(data.persistStorePrefix)
          continue
        }
        const subscription = this.listenEvents(provider)
        this.storage.set(address, {
          provider: provider,
          uri: data.uri,
          topic: data.topic,
          address: data.address as Address,
          persistStorePrefix: data.persistStorePrefix,
          subscription,
        })
        if (data.isActive) {
          this.activeAddress = address
        }
      } catch (error) {
        await dropStorage(data.persistStorePrefix)
        throw error
      }
    }
    this.eventEmitter.emit('accountsChanged', this.getAddresses())
  }

  setActiveAddress(address: Address | null): void {
    this.activeAddress = address
    this.eventEmitter.emit('accountsChanged', this.getAddresses())
  }

  private async disconnectAll() {
    for (const address of this.storage.keys()) {
      await this.signer(address)
        ?.disconnect()
        .catch(() => {
          /* ignore */
        })
    }

    this.storage.clear()
    this.activeAddress = null
    this.setActiveAddress(null)
    this.updatePersist()
  }

  async disconnect(address?: Address | null) {
    if (!address) {
      await this.disconnectAll()
    } else {
      this.storage.delete(address)

      await this.signer(address)
        ?.disconnect()
        .catch(() => {
          /* ignore */
        })

      if (this.activeAddress === address) {
        this.activeAddress = null

        this.setActiveAddress(this.getAddresses()[0] ?? null)
      }
    }

    this.updatePersist()
  }

  isConnected() {
    return this.activeAddress !== null
  }

  async request(args: RequestArguments): Promise<unknown> {
    const method = args.method
    if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
      return this.getAddresses()
    }
    return (await this.signer()?.request(args)) ?? null
  }

  async enable(): Promise<Address[]> {
    return this.getAddresses()
  }

  on<TEvent extends keyof EventMap>(
    event: TEvent,
    listener: (result: EventMap[TEvent]) => void
  ): void {
    if (internalEvents.includes(event)) {
      this.eventEmitter.on(event, listener)
      return
    }
    this.signer()?.on(event, listener as any)
  }

  removeListener<TEvent extends keyof EventMap>(
    event: TEvent,
    listener: (result: EventMap[TEvent]) => void
  ): void {
    if (internalEvents.includes(event)) {
      this.eventEmitter.removeListener(event, listener)
      return
    }
    this.signer()?.removeListener(event, listener as any)
  }

  private updatePersist() {
    const persistStorePrefixSet = new Set<string>()
    const data: {
      uri: string
      topic: string
      address: string
      persistStorePrefix: string
      isActive: boolean
    }[] = []
    this.storage.forEach(({ uri, topic, address, persistStorePrefix }) => {
      persistStorePrefixSet.add(persistStorePrefix)
      data.push({
        uri,
        topic,
        address,
        persistStorePrefix,
        isActive: !!this.activeAddress && isAddressEqual(this.activeAddress, address),
      })
    })
    this.cleanOldStorage().catch()
    storage.set('wc2_persist', data)
  }

  private getPersistData(): {
    uri: string
    topic: string
    address: string
    persistStorePrefix: string
    isActive: boolean
  }[] {
    return storage.get('wc2_persist', JSON.parse) ?? []
  }

  private getAddresses() {
    const addresses = new Set<Address>()
    this.activeAddress && addresses.add(this.activeAddress)
    this.storage.forEach((value) => {
      addresses.add(value.address)
    })
    return [...addresses]
  }

  private listenEvents(provider: EthereumProvider) {
    let address: Address
    return merge(
      fromEvent(provider, 'disconnect').pipe(
        tap(() => {
          this.storage.forEach((value) => {
            if (value.provider !== provider) return
            address = value.address
          })
          if (address && this.storage.has(address)) {
            const store = this.storage.get(address)!
            this.storage.delete(address)
            store.subscription.unsubscribe()
            if (this.activeAddress === address) {
              const nextActiveAddressStore = [...this.storage.values()][0]
              this.activeAddress = nextActiveAddressStore?.address ?? null
            }
            this.eventEmitter.emit('accountsChanged', this.getAddresses())
            this.updatePersist()
          }
        })
      )
    ).subscribe()
  }

  private async cleanOldStorage() {
    const databasesList = await indexedDB.databases()
    const dbNameSet = new Set<string>()
    for (const store of this.storage.values()) {
      const dbName = await getDatabaseName(store.persistStorePrefix)
      dbNameSet.add(dbName)
    }
    for (const db of databasesList) {
      if (db.name && db.name.startsWith('wallet-connect') && !dbNameSet.has(db.name)) {
        await dropStorageByName(db.name)
      }
    }
  }
}

async function makeProvider(
  persistStorePrefix: string,
  opts?: EthereumProviderOptions
): Promise<EthereumProvider> {
  const options = await import('./wallet-connect-init-options').then((m) => m.options())
  const { EthereumProvider } = await import('./ethereum-provider')
  const updatedOptions = opts && typeof opts === 'object' ? { ...options, ...opts } : options

  return await EthereumProvider.initProvider(updatedOptions, persistStorePrefix)
}

async function dropStorageByName(name: string) {
  const { WalletConnectStorage } = await import('./ethereum-provider')
  await WalletConnectStorage.dropStorageByName(name)
}

async function getDatabaseName(name: string) {
  const { WalletConnectStorage } = await import('./ethereum-provider')
  return await WalletConnectStorage.getDatabaseName(name)
}

async function dropStorage(name: string) {
  const { WalletConnectStorage } = await import('./ethereum-provider')
  return await WalletConnectStorage.dropStorage(name)
}
