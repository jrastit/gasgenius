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
  to: string;
  data: string;
  value: string;
  blockNumber: number;
  timestamp: number;
  erc7730: Erc7730Info | null;
}

export default function AddressHistory({ address: address = '' }: { address?: string }) {
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
    <div style={{ paddingTop: '2em', paddingBottom: '2em' }}>
      {/* <h2>Transaction History</h2> */}

      <div className="flex justify-center">
      <button
        className="bg-blue-600 text-white px-4 py-1 rounded"
        onClick={fetchHistory}
        disabled={loading || !address}
      >
        {loading ? 'Loading…' : 'Load Transaction History'}
      </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Show history block on top when loading is done and txs are loaded */}
      {!loading && txs.length > 0 && (
      <div className="fixed top-0 left-0 w-full h-full bg-white shadow-lg z-50" style={{ scrollbarWidth: 'none' as any }}>
        {/* Background image */}
        <img
          src="/back.png"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none select-none"
        />
        <div className="relative z-10 flex justify-center items-start h-full">
          <div
        className="max-w-3xl w-full p-6 overflow-y-auto max-h-full relative"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
          >
        <style jsx>{`
          .max-w-3xl::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <button
          className="absolute top-4 right-6 text-gray-500 hover:text-gray-800 text-2xl font-bold"
          aria-label="Close"
          onClick={() => setTxs([])}
          style={{ zIndex: 100 }}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">Transaction History</h2>
        <Erc7730History
          transactions={txs.map((tx) => ({
            ...tx,
          }))}
        />
          </div>
        </div>
      </div>
      )}
    </div>
  );
}