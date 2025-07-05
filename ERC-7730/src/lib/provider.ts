// lib/provider.ts
import { ethers } from 'ethers';

const NETWORKS: Record<number, ethers.networks.Networkish> = {
  1: 'homestead',
  137: 'matic',
  42161: 'arbitrum',
};

export function getProvider(chainId: number = 1) {
  const network = NETWORKS[chainId] ?? 'homestead';
  return new ethers.providers.EtherscanProvider(
    network,
    process.env.ETHERSCAN_API_KEY,
  );
}