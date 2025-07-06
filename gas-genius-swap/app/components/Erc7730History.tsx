import React, { useEffect, useState } from 'react';
import { Interface } from 'ethers';
import Erc7730Generator from './Erc7730Generator';

interface Transaction {
    hash: string;
    from: string;
    to: string;
    value: string;
    data: string;
    blockNumber?: number;
    timestamp?: number;
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
        <div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {transactions.map((tx) => (
                    <li
                        key={tx.hash}
                        style={{
                            color: 'rgba(255, 255, 255, 1)',
                            background: 'rgba(62, 11, 70, 0.7)',
                            margin: '16px 0',
                            borderRadius: 8,
                            boxShadow: '0 2px 8px #0001',
                            padding: 20,
                        }}
                    >
                        {tx.timestamp && (
                            <div style={{ color: '#bdbdbd', fontSize: 13, marginBottom: 8 }}>
                                {new Date(tx.timestamp).toLocaleString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                })}
                            </div>
                        )}
                        <div>
                            <strong >Tx:</strong> <a
                                href={`https://etherscan.io/tx/${tx.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: 'underline', color: '#0070f3' }}
                            >
                                <code>
                                    {tx.hash.slice(0, 22)}...
                                </code>
                            </a>
                        </div>
                        <div>
                            <strong>From:</strong>{' '}
                            <a
                                href={`https://etherscan.io/address/${tx.from}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: 'underline', color: '#0070f3' }}
                            >
                                <code>
                                    {tx.from.slice(0, 10)}...{tx.from.slice(-8)}
                                </code>
                            </a>
                        </div>
                        <div>
                            <strong>To:</strong>{' '}
                            <a
                                href={`https://etherscan.io/address/${tx.to}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: 'underline', color: '#0070f3' }}
                            >
                                <code>{tx.to.slice(0, 10)}...{tx.to.slice(-8)}</code>
                            </a>
                        </div>
                        {Number(tx.value) > 0 && (
                            <div>
                                <strong>Value:</strong> {require('ethers').formatEther(tx.value)} ETH
                            </div>
                        )}
                        {decodeEnabled && decoded[tx.hash]?.decoded && (
                            <div style={{ marginTop: 12 }}>
                                <pre
                                    style={{
                                        background: '#f0f0f0',
                                        color: '#222',
                                        padding: 10,
                                        borderRadius: 4,
                                        overflowX: 'auto',
                                    }}
                                >
                                    {(() => {
                                        const decodedData = decoded[tx.hash]?.decoded;
                                        if (!decodedData) return 'No data available';

                                        // Display metadata if present
                                        const { metadata, intent } = decodedData;
                                        return (
                                            <div>
                                                {metadata && (
                                                    <div style={{ marginBottom: 8 }}>
                                                        <strong>Owner:</strong> {metadata.owner}
                                                        {metadata.info && (
                                                            <div style={{ marginLeft: 12 }}>
                                                                <div>
                                                                    <strong>Legal Name:</strong> {metadata.info.legalName}
                                                                </div>
                                                                <div>
                                                                    <strong>Website:</strong>{' '}
                                                                    <a href={metadata.info.url} target="_blank" rel="noopener noreferrer">
                                                                        {metadata.info.url}
                                                                    </a>
                                                                </div>
                                                                {/* <div>
                                                                    <strong>Deployment Date:</strong>{' '}
                                                                    {new Date(metadata.info.deploymentDate).toLocaleDateString()}
                                                                </div> */}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {intent && (
                                                    <div>
                                                        <strong>Intent:</strong> {intent}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </pre>
                                
                            </div>
                        )}
                        {decodeEnabled && !decoded[tx.hash]?.decoded && (
                            <Erc7730Generator address={tx.to}></Erc7730Generator>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};