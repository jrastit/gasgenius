import type { EthereumProviderOptions } from '@walletconnect/ethereum-provider'
import { default as WcEthereumProvider } from '@walletconnect/ethereum-provider'
import type { Dexie, Table } from 'dexie'

export interface EthereumRpcMap {
  [chainId: string]: string
}

export interface ConnectOps {
  chains?: number[]
  optionalChains?: number[]
  rpcMap?: EthereumRpcMap
  pairingTopic?: string
}

export class EthereumProvider extends WcEthereumProvider {
  static async initProvider(
    opts: EthereumProviderOptions,
    persistStorePrefix: string
  ): Promise<EthereumProvider> {
    const provider = new EthereumProvider(persistStorePrefix)
    await provider.initialize(opts)
    return provider
  }

  constructor(private readonly persistStorePrefix: string) {
    super()
  }

  override async connect(opts?: ConnectOps): Promise<void> {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type !== 'attributes' || mutation.attributeName !== 'theme') return
        this.modal.closeModal()
      })
    })
    try {
      const htmlElement = document.querySelector('html')!
      observer.observe(htmlElement, { attributes: true })
      return await super.connect(opts)
    } finally {
      observer.disconnect()
    }
  }

  protected override async initialize(opts: EthereumProviderOptions) {
    this.rpc = this.getRpcConfig(opts)
    this.chainId = this.rpc.chains.length
      ? getEthereumChainId(this.rpc.chains)
      : getEthereumChainId(this.rpc.optionalChains)
    const storage = await WalletConnectStorage.init(this.persistStorePrefix)
    const { UniversalProvider } = await import('@walletconnect/universal-provider')
    this.signer = await UniversalProvider.init({
      projectId: this.rpc.projectId,
      metadata: this.rpc.metadata,
      disableProviderPing: opts.disableProviderPing,
      relayUrl: opts.relayUrl,
      storageOptions: opts.storageOptions,
      storage,
    })
    this.registerEventListeners()
    await this.loadPersistedSession()
    if (this.rpc.showQrModal) {
      let WalletConnectModalClass
      try {
        const { WalletConnectModal } = await import('@walletconnect/modal')
        WalletConnectModalClass = WalletConnectModal
      } catch {
        throw new Error('To use QR modal, please install @walletconnect/modal package')
      }
      if (WalletConnectModalClass) {
        try {
          this.modal = new WalletConnectModalClass({
            projectId: this.rpc.projectId,
            ...this.rpc.qrModalOptions,
          })
        } catch (e) {
          this.signer.logger.error(e)
          throw new Error('Could not generate WalletConnectModal Instance')
        }
      }
    }
  }

  override async disconnect() {
    await super.disconnect().catch(() => {
      /* ignore */
    })
    await this.signer.disconnect().catch(() => {
      /* ignore */
    })
    await this.dropPersist().catch(() => {
      /* ignore */
    })
  }

  async dropPersist() {
    return (this.signer.client.core.storage as WalletConnectStorage).dropStorage()
  }
}

export class WalletConnectStorage {
  private static instances: Map<string, WalletConnectStorage> = new Map()

  static async dropStorage(persistStorePrefix: string) {
    const storage = await WalletConnectStorage.init(persistStorePrefix)
    await storage.dropStorage()
  }

  static async dropStorageByName(name: string) {
    const storage = await WalletConnectStorage.init(name)
    await storage.dropStorage()
  }

  static getDatabaseName(persistStorePrefix: string) {
    return `wallet-connect-connection-storage-${persistStorePrefix}`
  }

  static async init(persistStorePrefix: string) {
    if (!this.instances.has(persistStorePrefix)) {
      const instance = new WalletConnectStorage()
      await instance.init(WalletConnectStorage.getDatabaseName(persistStorePrefix))
      this.instances.set(persistStorePrefix, instance)
    }
    return this.instances.get(persistStorePrefix)!
  }

  private data!: Table<{ key: string; value: unknown }, string>

  private dexie!: Dexie

  async init(name: string) {
    const DexieCtx = await import('dexie').then((m) => m.default)
    this.dexie = new DexieCtx(name)
    this.dexie.version(1).stores({
      data: ['key', 'value'].join(', '),
    })
    this.data = this.dexie.table('data')
    return this
  }

  async dropStorage() {
    this.dexie.delete()
  }

  async getKeys(): Promise<string[]> {
    const keys = await this.data.toCollection().keys()
    return keys as string[]
  }

  async getEntries<T = unknown>(): Promise<[string, T][]> {
    const entries: [string, T][] = []
    await this.data.each((data) => {
      entries.push([data.key, data.value as T])
    })
    return entries
  }

  async getItem<T = unknown>(key: string): Promise<T | undefined> {
    return (await this.data.get(key).then((data) => data?.value)) as T | undefined
  }

  async setItem<T = unknown>(key: string, value: T): Promise<void> {
    await this.data.put({ key, value })
  }

  async removeItem(key: string): Promise<void> {
    await this.data.delete(key)
  }
}

export function getEthereumChainId(chains: string[]): number {
  return Number(chains[0].split(':')[1])
}
