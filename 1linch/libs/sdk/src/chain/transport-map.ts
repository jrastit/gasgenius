import { ChainId } from '@1inch-community/models'
import { RPC } from './transport'

export function getRPC(chainId: ChainId) {
  const http = HTTP_RPC_MAP[chainId]
  const ws = WS_RPC_MAP[chainId]
  return { http, ws } as const
}

const HTTP_RPC_MAP: Record<ChainId, RPC[]> = {
  [ChainId.eth]: [
    { rpc: 'https://ethereum-rpc.publicnode.com', config: { batchSize: 200 } },
    { rpc: 'https://ethereum.publicnode.com', config: { batchSize: 200 } },
    { rpc: 'https://cloudflare-eth.com', config: { batchSize: 100 } },
    'https://eth.merkle.io',
    'https://1rpc.io/eth',
    'https://eth-pokt.nodies.app',
    'https://eth.drpc.org',
    'https://eth.llamarpc.com',
    'https://eth-mainnet.public.blastapi.io',
    'https://rpc.ankr.com/eth',
    'https://endpoints.omniatech.io/v1/eth/mainnet/public',
    'https://mainnet.gateway.tenderly.co',
    'https://rpc.flashbots.net/fast',
    'https://rpc.mevblocker.io',
    'https://rpc.mevblocker.io/fast',
    'https://rpc.mevblocker.io/noreverts',
    'https://rpc.mevblocker.io/fullprivacy',
    'https://eth.drpc.org',
  ],
  [ChainId.bnb]: [
    'https://bsc.publicnode.com',
    'https://bsc-rpc.publicnode.com',
    'https://endpoints.omniatech.io/v1/bsc/mainnet/public',
    'https://bsc-pokt.nodies.app',
    'https://bsc.meowrpc.com',
    'https://bsc.drpc.org',
  ],
  [ChainId.matic]: [
    'https://polygon-bor-rpc.publicnode.com',
    'https://polygon-rpc.com',
    'https://polygon-pokt.nodies.app',
    'https://polygon-heimdall-rpc.publicnode.com:443',
    'https://polygon-bor.publicnode.com',
    'https://polygon.drpc.org',
    'https://polygon.meowrpc.com',
    'https://polygon.llamarpc.com',
  ],
  [ChainId.op]: [
    'https://optimism-rpc.publicnode.com',
    'https://optimism.llamarpc.com',
    'https://optimism.publicnode.com',
    'https://op-pokt.nodies.app',
    'https://optimism.meowrpc.com',
    'https://optimism.drpc.org',
    'https://endpoints.omniatech.io/v1/op/mainnet/public',
  ],
  [ChainId.arbitrum]: [
    'https://arbitrum-one.publicnode.com',
    'https://arb-pokt.nodies.app',
    'https://arbitrum.meowrpc.com',
    'https://arbitrum.drpc.org',
  ],
  [ChainId.gnosis]: [
    'https://gnosis.publicnode.com',
    'https://gnosis-rpc.publicnode.com',
    'https://rpc.gnosischain.com',
    'https://gnosis.drpc.org',
  ],
  [ChainId.avalanche]: [
    'https://avalanche-c-chain.publicnode.com',
    'https://1rpc.io/avax/c',
    'https://endpoints.omniatech.io/v1/avax/mainnet/public',
    'https://avax.meowrpc.com',
    'https://avalanche.drpc.org',
  ],
  [ChainId.fantom]: [
    'https://fantom.publicnode.com',
    'https://fantom-pokt.nodies.app',
    'https://1rpc.io/ftm',
    'https://fantom.drpc.org',
  ],
  [ChainId.aurora]: [
    'https://mainnet.aurora.dev',
    'https://endpoints.omniatech.io/v1/aurora/mainnet/public',
    'https://1rpc.io/aurora',
    'https://aurora.drpc.org',
  ],
  [ChainId.klaytn]: [
    'https://klaytn.drpc.org',
    'https://rpc.ankr.com/klaytn',
    'https://klaytn.blockpi.network/v1/rpc/public',
  ],
  [ChainId.zkSyncEra]: [
    'https://mainnet.era.zksync.io',
    'https://zksync-era.blockpi.network/v1/rpc/public',
    'https://zksync.meowrpc.com',
    'https://zksync.drpc.org',
    'https://go.getblock.io/f76c09905def4618a34946bf71851542',
    'https://zksync-mainnet.public.blastapi.io',
  ],
}

const WS_RPC_MAP: Record<ChainId, RPC[]> = {
  [ChainId.eth]: [
    'wss://ethereum-rpc.publicnode.com',
    'wss://ethereum.callstaticrpc.com',
    'wss://ethereum.publicnode.com',
    'wss://eth.drpc.org',
    'wss://mainnet.gateway.tenderly.co',
  ],
  [ChainId.bnb]: ['wss://bsc.publicnode.com', 'wss://bsc-rpc.publicnode.com'],
  [ChainId.matic]: [
    'wss://polygon.drpc.org',
    'wss://polygon-bor-rpc.publicnode.com',
    'wss://polygon-bor.publicnode.com',
    'wss://polygon-heimdall-rpc.publicnode.com:443/websocket',
  ],
  [ChainId.op]: ['wss://optimism.publicnode.com'],
  [ChainId.arbitrum]: ['wss://arbitrum-one.publicnode.com'],
  [ChainId.gnosis]: [
    'wss://rpc.gnosischain.com/wss',
    'wss://gnosis-rpc.publicnode.com',
    'wss://gnosis.publicnode.com',
  ],
  [ChainId.avalanche]: ['wss://avalanche-c-chain.publicnode.com'],
  [ChainId.fantom]: ['wss://gnosis.publicnode.com'],
  [ChainId.aurora]: ['wss://mainnet.aurora.dev'],
  [ChainId.klaytn]: ['wss://public-en-cypress.klaytn.net/ws'],
  [ChainId.zkSyncEra]: ['wss://zksync.drpc.org'],
}
