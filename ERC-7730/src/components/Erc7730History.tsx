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
    erc7730?: any;
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
                console.log('Processing transaction2:', tx);
                try {
                    console.log('Transaction data:', tx.erc7730);
                    results[tx.hash] = { decoded: tx.erc7730 };
                    
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
    console.log('Decoded transactions to return:', decoded);
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
                                {console.log('Decoded for', tx.hash, decoded[tx.hash]?.decoded)}
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