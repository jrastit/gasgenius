// components/AddressHistory.tsx
'use client';

import { useState } from 'react';

interface Erc7730Info {
  name: string;
  description?: string;
  symbol?: string;
}

interface TxRecord {
  hash: string;
  from: string;
  to: string | null;
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

      <ul className="space-y-4">
        {txs.map((tx) => (
          <li
            key={tx.hash}
            className={`p-4 rounded border ${
              tx.erc7730
                ? 'bg-yellow-50 border-yellow-400'
                : 'bg-gray-50 border-gray-300'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs break-all">{tx.hash}</span>
              <span className="text-xs text-gray-600">
                {new Date(tx.timestamp).toLocaleString()}
              </span>
            </div>

            <div className="text-sm mt-2">
              <p>
                <strong>From:</strong> {tx.from}
              </p>
              <p>
                <strong>To:</strong> {tx.to ?? '—'}
              </p>
              <p>
                <strong>Value:</strong> {tx.value} wei
              </p>

              {tx.erc7730 && (
                <div className="mt-2 p-2 rounded bg-yellow-100 border-l-4 border-yellow-600">
                  <p className="font-semibold">
                    ERC‑7730 Contract: {tx.erc7730.name}
                  </p>
                  {tx.erc7730.description && (
                    <p className="text-xs">{tx.erc7730.description}</p>
                  )}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}