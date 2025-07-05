'use client';

import { useState, useEffect } from 'react';
import { getQuote } from '../utils/oneInchApi';
import { parseUnits, formatUnits } from 'ethers';
import { useDebounce } from '../hooks/useDebounce';

const tokenMeta = {
  ETH: {
    symbol: 'ETH',
    name: 'Ether',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    logo: '/tokens/eth.png',
    decimals: 18,
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    logo: '/tokens/usdc.png',
    decimals: 6,
  },
  DAI: {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    logo: '/tokens/dai.png',
    decimals: 18,
  },
};

export default function SwapPage() {
  const [connected, setConnected] = useState(false);
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');
  const [amount, setAmount] = useState('');
  const debouncedAmount = useDebounce(amount, 500);
  const [quote, setQuote] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    if (!debouncedAmount || isNaN(Number(debouncedAmount)) || Number(debouncedAmount) <= 0) {
      setQuote(null);
      setLoadingQuote(false);
      return;
    }

    const fetchQuote = async () => {
      setLoadingQuote(true);
      const amountWei = parseUnits(debouncedAmount, tokenMeta[fromToken].decimals).toString();

      try {
        const quoteData = await getQuote(
          tokenMeta[fromToken].address,
          tokenMeta[toToken].address,
          amountWei
        );

        const rawAmount = quoteData.toAmount ?? quoteData.toTokenAmount;
        if (!rawAmount) {
          setQuote(null);
          setLoadingQuote(false);
          return;
        }

        const output = formatUnits(rawAmount, tokenMeta[toToken].decimals);
        setQuote(output);
      } catch (err) {
        console.error('Quote error:', err);
        setQuote(null);
      } finally {
        setLoadingQuote(false);
      }
    };

    fetchQuote();
  }, [fromToken, toToken, debouncedAmount]);

  const handleConnect = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
if (accounts && accounts.length > 0) {
  setConnected(true);
  setWalletAddress(accounts[0]);
}
    if (typeof window.ethereum === 'undefined') {
      alert('MetaMask not detected. Please install MetaMask.');
      return;
    
    }
  
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        console.log('Connected account:', accounts[0]);
        setConnected(true);
      } else {
        alert('No accounts returned.');
      }
    } catch (err) {
      console.error('Connection error:', err);
      alert('Connection failed. Check console for details.');
    }
  };
  
  const handleSwap = async () => {
    alert('Swap logic goes here!');
  };

  const handleReverse = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setQuote(null);
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white flex justify-center items-center px-4">
<div className="absolute top-4 right-4 transform scale-120 origin-top-right">
  {!connected ? (
    <button
      onClick={handleConnect}
      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white text-xs px-3 py-1 rounded-lg shadow"
    >
      Connect Wallet
    </button>
  ) : (
    <div className="flex items-center gap-2 bg-[#1c2233] px-3 py-2 rounded-xl text-sm text-white shadow-md">
      <img src="/icons/metamask.svg" alt="MetaMask" className="w-5 h-5" />
      <span className="font-mono">
        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
      </span>
    </div>
  )}
</div>


      <div className="w-full max-w-md bg-[#131a2a] rounded-2xl p-4 shadow-xl space-y-4">
        <h2 className="text-lg font-bold">Gas Genius</h2>

        {/* From Section */}
        <div className="bg-[#1c2233] rounded-xl p-4">
          <p className="text-xs text-gray-400">Sell</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={tokenMeta[fromToken].logo} className="w-6 h-6" alt={fromToken} />
              <div>
                <p className="font-medium">{tokenMeta[fromToken].symbol}</p>
                <p className="text-xs text-gray-500">on Ethereum</p>
              </div>
            </div>
            <input
  type="number"
  placeholder="0.0"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  className="bg-transparent text-right outline-none text-lg appearance-none 
             [&::-webkit-inner-spin-button]:appearance-none 
             [&::-webkit-outer-spin-button]:appearance-none 
             [-moz-appearance:textfield]"
/>

          </div>
        </div>

        {/* Arrow Button */}
        <div className="flex justify-center">
          <button onClick={handleReverse} className="bg-[#1c2233] rounded-full p-2">
            <img src="/icons/arrow-down.svg" alt="reverse" className="w-4 h-4" />
          </button>
        </div>

        {/* To Section */}
        <div className="bg-[#1c2233] rounded-xl p-4">
          <p className="text-xs text-gray-400">Buy</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={tokenMeta[toToken].logo} className="w-6 h-6" alt={toToken} />
              <div>
                <p className="font-medium">{tokenMeta[toToken].symbol}</p>
                <p className="text-xs text-gray-500">on Ethereum</p>
              </div>
            </div>
            <div className="text-right text-lg font-semibold">
              {quote && !loadingQuote ? quote : '0.00'}
            </div>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="text-xs text-gray-400 text-center">
          {quote && debouncedAmount && Number(debouncedAmount) > 0 && !loadingQuote && (
            <p>
              1 {fromToken} ≈ {(Number(quote) / Number(debouncedAmount)).toFixed(2)} {toToken} <span className="text-gray-600">(~$2498.1)</span>
            </p>
          )}
        </div>
        <button
  className={`w-full py-2 rounded-xl font-semibold transition-all text-white ${
    !connected || (connected && quote && !loadingQuote)
      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90'
      : 'bg-gray-600 cursor-not-allowed'
  }`}
  onClick={() => {
    if (!connected) {
      console.log('Connecting wallet...');
      handleConnect();
    } else if (quote && !loadingQuote) {
      console.log('Swapping...');
      handleSwap();
    }
  }}
  disabled={connected && (!quote || loadingQuote)}
>
  {!connected
    ? 'Connect Wallet'
    : loadingQuote
    ? 'Loading...'
    : 'Swap'}
</button>


      </div>
    </div>
  );
}
