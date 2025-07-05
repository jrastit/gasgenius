import { JsonParser } from '@1inch-community/core/storage'
import { ChainId, IPersistSyncStorage } from '@1inch-community/models'
import { Address } from 'viem'

export function setChainIdInStorage(storage: IPersistSyncStorage, chainId: ChainId) {
  storage.set('chainId', Number(chainId))
}

export function getChainIdsFromStorage(storage: IPersistSyncStorage): ChainId[] | null {
  return storage.get<ChainId[]>('chainIds', JsonParser)
}

export function setActiveAddress(storage: IPersistSyncStorage, address: Address) {
  storage.set('activeAddress', address)
}

export function getActiveAddress(storage: IPersistSyncStorage): Address | null {
  return storage.get('activeAddress', String) as Address
}

export function setActiveWallet(storage: IPersistSyncStorage, id: string | null) {
  storage.set('activeWallet', id)
}

export function getActiveWallet(storage: IPersistSyncStorage): string | null {
  return storage.get('activeWallet', (value) => (value === 'null' ? null : value))
}

export function addConnectedWallet(storage: IPersistSyncStorage, id: string) {
  const connectedWalletList = storage.get('connectedWallet', JSON.parse)
  const connectedWalletSet = new Set<string>(connectedWalletList)
  if (connectedWalletSet.has(id)) {
    return
  }
  connectedWalletSet.add(id)
  storage.set('connectedWallet', [...connectedWalletSet.keys()])
}

export function getConnectedWallet(storage: IPersistSyncStorage) {
  return storage.get('connectedWallet', JSON.parse)
}

export function removeConnectedWallet(storage: IPersistSyncStorage, id: string) {
  const connectedWalletList = storage.get('connectedWallet', JSON.parse)
  const connectedWalletSet = new Set<string>(connectedWalletList)
  if (!connectedWalletSet.has(id)) {
    return
  }
  connectedWalletSet.delete(id)
  storage.set('connectedWallet', [...connectedWalletSet.keys()])
}
