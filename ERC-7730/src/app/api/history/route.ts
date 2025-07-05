import { NextResponse } from 'next/server';
import { getProvider } from '@/lib/provider';
import { ERC7730_REGISTRY } from '@/lib/erc7730Registry';

export async function POST(req: Request) {
  try {
    const { address, chainId = 1 } = await req.json();

    if (!address) {
      return NextResponse.json({ error: 'Missing address' }, { status: 400 });
    }

    const provider = getProvider(chainId);
    const history = await provider.getHistory(address);

    const enriched = await Promise.all(
      history.map(async (tx) => {
        // get timestamp via block lookup
        const block = await provider.getBlock(tx.blockNumber);
        const erc7730 =
          ERC7730_REGISTRY[(tx.to ?? '').toLowerCase()] ??
          ERC7730_REGISTRY[(tx.from ?? '').toLowerCase()] ??
          null;

        return {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value.toString(),
          blockNumber: tx.blockNumber,
          timestamp: block.timestamp * 1000,
          erc7730,
        };
      }),
    );

    enriched.sort((a, b) => b.blockNumber - a.blockNumber);

    return NextResponse.json(enriched);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 },
    );
  }
}
