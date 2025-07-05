// lib/provider.ts
import { EtherscanProvider, type Networkish } from 'ethers';

const NETWORKS: Record<number, Networkish> = {
  1:  'homestead',   // Ethereum mainnet
  137: 'matic',      // Polygon
  42161: 'arbitrum', // Arbitrum One
};

export function getProvider(chainId: number = 1) {
  const network = NETWORKS[chainId] ?? 'homestead';
  return new EtherscanProvider(network, process.env.ETHERSCAN_API_KEY);
}