export interface Erc7730Info {
  name: string;
  description?: string;
  symbol?: string;
}

export const ERC7730_REGISTRY: Record<string, Erc7730Info> = {
  // 1inch Router example — add your own entries
  '0x111111111117dc0aa78b770fa6a738034120c302': {
    name: '1inch Router',
    description: 'Aggregated DEX router implementing ERC‑7730',
    symbol: '1INCH',
  },
};
