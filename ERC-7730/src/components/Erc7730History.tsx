import { Erc7730Info } from '../app/api/history/erc7730Registry';
import React, { useEffect, useState } from 'react';
import { Interface } from 'ethers';

interface Transaction {
    hash: string;
    from: string;
    to: string;
    value: string;
    data: string;
    blockNumber?: number;
    [key: string]: any;
    erc7730?: Erc7730Info | null;
}

interface Erc7730HistoryProps {
    transactions: Transaction[];
    decodeEnabled?: boolean;
}

export const Erc7730History: React.FC<Erc7730HistoryProps> = ({
    transactions,
    decodeEnabled = true,
}) => {
    const [decoded, setDecoded] = useState<Record<string, any>>({});

    useEffect(() => {
        if (!decodeEnabled) return;
        const fetchDecoded = async () => {
            const results: Record<string, any> = {};
            for (const tx of transactions) {
                console.log('Processing transaction:', tx);
                try {
                    const erc7730 = tx.erc7730;
                    if (!erc7730 || !erc7730.abi) {
                        results[tx.hash] = { decoded: null, info: null };
                        continue;
                    }
                    const { abi, formatData } = erc7730;
                    const iface = new Interface(abi);
                    const info = {
                        name: erc7730.name,
                        description: erc7730.description,
                        symbol: erc7730.symbol,
                    };
                    const parsed = iface.parseTransaction({ data: tx.data });
                    results[tx.hash] = {
                        decoded: formatData ? formatData(tx.data) : null,
                        info,
                    };
                } catch {
                    console.error('Failed to decode transaction:', tx.hash);
                    results[tx.hash] = { decoded: null, info: null };
                }
            }
            setDecoded(results);
        };
        fetchDecoded();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactions, decodeEnabled]);

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <h2>ERC-7730 Transaction History</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {transactions.map((tx) => (
                    <li
                        key={tx.hash}
                        style={{
                            background: '#f9f9f9',
                            margin: '16px 0',
                            borderRadius: 8,
                            boxShadow: '0 2px 8px #0001',
                            padding: 20,
                        }}
                    >
                        <div>
                            <strong>Tx Hash:</strong> <code>{tx.hash}</code>
                        </div>
                        <div>
                            <strong>From:</strong> <code>{tx.from}</code>
                        </div>
                        <div>
                            <strong>To:</strong> <code>{tx.to}</code>
                        </div>
                        <div>
                            <strong>Value:</strong> {tx.value}
                        </div>
                        {decodeEnabled && (
                            <div style={{ marginTop: 12 }}>
                                <strong>Decoded Call:</strong>
                                <pre
                                    style={{
                                        background: '#f0f0f0',
                                        padding: 10,
                                        borderRadius: 4,
                                        overflowX: 'auto',
                                    }}
                                >
                                    {decoded[tx.hash]?.decoded
                                        ? JSON.stringify(
                                              decoded[tx.hash].decoded,
                                              null,
                                              2
                                          )
                                        : 'No data available'}
                                </pre>
                                {decoded[tx.hash]?.info && (
                                    <div>
                                        <strong>Contract Info:</strong>
                                        <pre
                                            style={{
                                                background: '#f0f0f0',
                                                padding: 10,
                                                borderRadius: 4,
                                                overflowX: 'auto',
                                            }}
                                        >
                                            {JSON.stringify(
                                                decoded[tx.hash].info,
                                                null,
                                                2
                                            )}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};