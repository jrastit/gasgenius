import { NextResponse } from 'next/server';
import { getErc7730Registry } from '@/app/api/history/erc7730Registry';
import { Interface } from 'ethers';

const ERC7730_REGISTRY = await getErc7730Registry();

const abiCache: Record<string, any> = {};

export async function POST(req: Request) {
  try {
    const { address, chainId = 1 } = await req.json();

    if (!address) {
      return NextResponse.json({ error: 'Missing address' }, { status: 400 });
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
            abiCache[contractAddress] = {  };
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
