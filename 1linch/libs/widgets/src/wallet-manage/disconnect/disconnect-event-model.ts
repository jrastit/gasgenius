import { EIP6963ProviderInfo } from '@1inch-community/models'
import { Address } from 'viem'

export class DisconnectEventModel {
  static readonly EVENT_TYPE = 'disconnectEvent'

  readonly info?: EIP6963ProviderInfo | null
  readonly address?: Address | null

  constructor(info?: EIP6963ProviderInfo | null, address?: Address | null) {
    this.info = info
    this.address = address
  }
}
