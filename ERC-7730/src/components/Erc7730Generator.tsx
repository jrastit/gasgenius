'use client';

import { useState } from 'react';

export default function Erc7730Generator() {
  const [address, setAddress] = useState('');
  const [chainId, setChainId] = useState(1);
  const [json, setJson] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    setLoading(true);

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, chainId }),
    });

    const data = await res.json();
    setJson(data);
    setLoading(false);
  };

  const download = () => {
    if (!json) return;
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'erc7730.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-4">
        ERC-7730 Generator from Etherscan
      </h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Contract address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="border px-2 py-1 rounded w-80"
          required
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
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          {loading ? 'Generating…' : 'Generate'}
        </button>

        <button
          type="button"
          className="bg-gray-300 text-black px-4 py-1 rounded"
          onClick={() =>
            setAddress('0x111111111117dC0aa78b770fA6A738034120C302')
          }
        >
          Autofill 1inch
        </button>
      </form>

      {json && (
        <>
          <pre className="w-full max-w-3xl bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(json, null, 2)}
          </pre>

          <button
            className="mt-4 bg-green-600 text-white px-4 py-1 rounded"
            onClick={download}
          >
            Download JSON
          </button>
        </>
      )}
    </main>
  );
}