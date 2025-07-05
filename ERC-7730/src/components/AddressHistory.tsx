// components/AddressHistory.tsx
'use client';

import { useState } from 'react';
import { Erc7730History } from './Erc7730History';

interface Erc7730Info {
  name: string;
  description?: string;
  symbol?: string;
}

interface TxRecord {
  hash: string;
  from: string;
  to: string | null;
  data: string;
  value: string;
  blockNumber: number;
  timestamp: number;
  erc7730: Erc7730Info | null;
}

export default function AddressHistory() {
  const [address, setAddress] = useState('');
  const [chainId, setChainId] = useState(1);
  const [txs, setTxs] = useState<TxRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, chainId }),
      });
      if (!res.ok) {
        throw new Error('Failed to fetch');
      }
      const data = await res.json();
      setTxs(data);
    } catch (e: any) {
      setError(e.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Transaction History</h1>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="0x…"
          className="border px-2 py-1 rounded w-96"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <select
          value={chainId}
          onChange={(e) => setChainId(Number(e.target.value))}
          className="border px-2 py-1 rounded"
        >
          <option value={1}>Ethereum Mainnet</option>
          <option value={137}>Polygon</option>
          <option value={42161}>Arbitrum One</option>
        </select>
        <button
          className="bg-blue-600 text-white px-4 py-1 rounded"
          onClick={fetchHistory}
          disabled={loading || !address}
        >
          {loading ? 'Loading…' : 'Load History'}
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <Erc7730History
        transactions={txs.map((tx) => ({
          ...tx,
          data: tx.data, // or tx.data if available
          to: tx.to ?? '', // ensure 'to' is a string
          erc7730: tx.erc7730 || null, // ensure erc7730 is not undefined
        }))}
      />
    </div>
  );
}