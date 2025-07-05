// src/app/api/generate/route.ts
import axios from 'axios';
import { NextResponse } from 'next/server';
import { buildErc7730Json } from '@/lib/erc7730';

export async function POST(req: Request) {
  // 1️⃣ Parse body
  const { address, chainId = 1 } = await req.json();

  if (!address) {
    return NextResponse.json(
      { error: 'Address parameter missing' },
      { status: 400 },
    );
  }

  // 2️⃣ Check env
  const apiKey = process.env.ETHERSCAN_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ETHERSCAN_API_KEY not configured on server' },
      { status: 500 },
    );
  }

  // 3️⃣ Call Etherscan
  const url = `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`;

  try {
    const { data } = await axios.get(url);

    if (data.status !== '1') {
      return NextResponse.json({ error: data.result }, { status: 400 });
    }

    const result = data.result[0];
    const abi = JSON.parse(result.ABI);
    const contractName = result.ContractName || 'Contract';

    // 4️⃣ Build ERC-7730 JSON
    const json = buildErc7730Json({
      address,
      chainId: Number(chainId),
      abi,
      contractName,
    });

    return NextResponse.json(json, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}