'use client';

import { useState } from 'react';

export default function Erc7730Generator({ address: address = '' }: { address?: string }) {
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
    <div>
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={loading || !address}
          className="bg-blue-600 text-white px-4 py-1 rounded mb-4"
          style={{ marginTop: '1em' }}
        >
          {loading ? 'Loading…' : 'Create erc7730'}
        </button>
      </div>

      {json && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
        style={{
        minHeight: '100vh',
        minWidth: '100vw',
        overflow: 'auto',
        scrollbarWidth: 'none',
        }}
      >
        <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
        `}</style>
        <div
        className="relative bg-white rounded shadow-lg p-6 max-w-3xl w-full flex flex-col"
        style={{
          // paddingTop: '1em',
          color: '#222',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
          onClick={() => setJson(null)}
          aria-label="Close"
        >
          &times;
        </button>
        <pre className="w-full bg-gray-100 p-4 rounded text-sm overflow-x-auto">
          {JSON.stringify(json, null, 2)}
        </pre>
        <button
          className="mt-4 bg-green-600 text-white px-4 py-1 rounded"
          onClick={download}
        >
          Download JSON
        </button>
        </div>
      </div>
      )}
    </div>
  );
}