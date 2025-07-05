import { NextResponse } from 'next/server';
import { getErc7730Registry } from '@/app/api/history/erc7730Registry';
import { Interface } from 'ethers';
import { getErc7730Info } from './erc7730Parse';

const ERC7730_REGISTRY = await getErc7730Registry();

const abiCache: Record<string, any> = {};

export async function POST(req: Request) {
  try {
    const { address, chainId = 1 } = await req.json();

    if (!address) {
      return NextResponse.json({ error: 'Missing address' }, { status: 400 });
    }

    if (address === '0x0') {
      const erc7730 = ERC7730_REGISTRY[('0x45312ea0eFf7E09C83CBE249fa1d7598c4C8cd4e').toLowerCase()] ?? null;
      if (!erc7730) {
        console.log('ERC7730_REGISTRY entries:', Object.entries(ERC7730_REGISTRY));
        return NextResponse.json({ error: 'No ERC-7730 info found for address' }, { status: 404 });
      }
      // Return a mock transaction for the zero address
      return NextResponse.json([{
        hash: '0x0',
        from: '0x0',
        to: '0x45312ea0eFf7E09C83CBE249fa1d7598c4C8cd4e',
        value: '40000000000000',
        blockNumber: 0,
        timestamp: Date.now(),
        ... await getErc7730Info('0x5c9c18e2000000000000000000000000ae7ab96520de3a18e5e111b5eaab095312d7fe84000000000000000000000000dc24316b9ae028f1497c275eb9192a3ea0f67022000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000f5f5b97624542d72a9e06f04804bf81baa15e2b4000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec70000000000000000000000007c4e143b23d72e6938e06291f705b5ae3d5c7c7c00000000000000000000000015700b564ca08d9439c58ca5053166e8317aa138000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000001e0000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000076b6c3f52b700000000000000000000000000000000000000000000000000479a2923623d1392d000000000000000000000000dc24316b9ae028f1497c275eb9192a3ea0f67022000000000000000000000000f5f5b97624542d72a9e06f04804bf81baa15e2b40000000000000000000000007c4e143b23d72e6938e06291f705b5ae3d5c7c7c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000', erc7730),
      }], { status: 200 });
    }
    // const provider = getProvider(chainId); // Removed unused variable
    // Use getLogs to fetch transaction history for the address
    // Fetch transaction history from Etherscan API
    const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
    if (!ETHERSCAN_API_KEY) {
      return NextResponse.json({ error: 'Missing ETHERSCAN_API_KEY' }, { status: 500 });
    }

    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${ETHERSCAN_API_KEY}`;
    let lastCall = Date.now(); // Initialize lastCall for rate limiting
    const res = await fetch(url);
    let data;
    let rawText;
    try {
      rawText = await res.text();
      data = JSON.parse(rawText);
    } catch (jsonErr) {
      console.error('Failed to parse Etherscan response as JSON:', jsonErr);
      console.error('Response text:', rawText);
      return NextResponse.json({ error: 'Failed to parse Etherscan response as JSON' }, { status: 502 });
    }

    if (data.status !== "1" || !Array.isArray(data.result)) {
      return NextResponse.json({ error: 'Failed to fetch from Etherscan', result: data.result }, { status: 502 });
    }


    // Helper to delay execution (ms)
    function delay(ms: number) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    const enriched = [];
    for (const tx of data.result) {
      const erc7730 =
        ERC7730_REGISTRY[(tx.to ?? '').toLowerCase()] ??
        null;
      console.log('Found ERC-7730 info:', erc7730);
      if (!erc7730) {
        try {
          const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
          const contractAddress = (tx.to ?? tx.from ?? '').toLowerCase();

          let abiData = abiCache[contractAddress];
          if (!abiData) {
            console.log('Fetched ABI for contract:', contractAddress);
            const abiUrl = `https://api.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${ETHERSCAN_API_KEY}`;
            while (lastCall && Date.now() - lastCall < 2000) {
              // Wait until 2 seconds have passed since the last call
              await delay(2000 - (Date.now() - lastCall));
            }
            lastCall = Date.now(); // Update last call time
            const abiRes = await fetch(abiUrl);
            abiData = await abiRes.json();
            abiCache[contractAddress] = abiData;
          }
          if (abiData.status === '1') {

            const abi = JSON.parse(abiData.result);
            enriched.push({
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              value: tx.value,
              data: tx.input,
              blockNumber: Number(tx.blockNumber),
              timestamp: Number(tx.timeStamp) * 1000,
              erc7730: {
                abi,
                formatData: (data: string) => {
                  try {
                    const iface = new Interface(abi);
                    return iface.parseTransaction({ data });
                  } catch (err) {
                    console.error('Failed to decode data with ABI:', err);
                    return {};
                  }
                },
              },
            });
          } else {
            console.warn('Failed to fetch ABI for contract:', contractAddress, 'Error:', abiData.result);
            abiCache[contractAddress] = {};
            enriched.push({
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              value: tx.value,
              data: tx.input,
              blockNumber: Number(tx.blockNumber),
              timestamp: Number(tx.timeStamp) * 1000,
              erc7730: {
                abi: [],
                formatData: (data: string) => {
                  console.warn('No ABI available for contract:', contractAddress);
                  return {};
                },
              }
            });
          }
        } catch (e) {
          console.error('Failed to fetch ABI from Etherscan:', e);
          enriched.push({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: tx.value,
            data: tx.input,
            blockNumber: Number(tx.blockNumber),
            timestamp: Number(tx.timeStamp) * 1000,
            erc7730: null,
          });
        }
        // Add delay to avoid rate limit (Etherscan free tier: 2 req/sec)
        await delay(600);
      } else {
        enriched.push({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          data: tx.input,
          blockNumber: Number(tx.blockNumber),
          timestamp: Number(tx.timeStamp) * 1000,
          erc7730,
        });
      }
    }

    console.log('Enriched transactions:', enriched);

    return NextResponse.json(enriched);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 },
    );
  }
}
