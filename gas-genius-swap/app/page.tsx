'use client';

import { useState, useEffect, useRef } from 'react';
import { parseUnits, formatUnits, ethers } from 'ethers';
import { useDebounce } from '../hooks/useDebounce';
import { getQuote, getTokenBalance } from '../utils/oneInchApi';
import AddressHistory from './components/AddressHistory';
import { getQuote, getTokenBalance ,getSwapTx} from '../utils/oneInchApi';
import { erc20Abi } from '../utils/erc20Abi';
import TransactionSuccessModal from './TransactionSuccessModal';

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
  const ONE_INCH_SPENDER = "0x1111111254EEB25477B68fb85Ed929f73A960582";
  const [connected, setConnected] = useState(false);
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');
  const [amount, setAmount] = useState('');
  const debouncedAmount = useDebounce(amount, 500);
  const [quote, setQuote] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(null);
  const debouncedFromToken = useDebounce(fromToken, 500);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [swapDetails, setSwapDetails] = useState({ fromSymbol: '', toSymbol: '' });

  const [usdPrice, setUsdPrice] = useState(null);
  const quoteInProgress = useRef(false);
  const balanceInProgress = useRef(false);

  const isInvalidAmount = !debouncedAmount || isNaN(Number(debouncedAmount)) || Number(debouncedAmount) <= 0;
  const handleDisconnect = () => {
    setConnected(false);
    setWalletAddress('');
    localStorage.setItem('disconnected', 'true');
    setShowWalletMenu(false);
  };
  const amountWei = debouncedAmount
  ? parseUnits(debouncedAmount, tokenMeta[fromToken].decimals)
  : null;

  useEffect(() => {
    if (typeof window.ethereum === 'undefined') return;
  
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // MetaMask disconnected manually
        setConnected(false);
        setWalletAddress('');
        localStorage.setItem('disconnected', 'true');
      } else {
        // MetaMask account changed or connected
        setConnected(true);
        setWalletAddress(accounts[0]);
        localStorage.removeItem('disconnected');
      }
    };
  
    window.ethereum.on('accountsChanged', handleAccountsChanged);
  
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);
  
const hasEnoughFunds =
  tokenBalance && amountWei && BigInt(tokenBalance) >= BigInt(amountWei);
  useEffect(() => {
    const wasDisconnected = localStorage.getItem('disconnected') === 'true';
    if (wasDisconnected) return;
  
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum
        .request({ method: 'eth_accounts' })
        .then((accounts) => {
          if (accounts.length > 0) {
            setConnected(true);
            setWalletAddress(accounts[0]);
          }
        })
        .catch((err) => {
          console.error('Auto-connect error:', err);
        });
    }
  }, []);
  
  
// Quote fetch logic
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

// Token balance fetch logic — defined separately
useEffect(() => {
  if (!connected || !walletAddress || !debouncedFromToken) return;

  const fetchBalance = async () => {
    try {
      const balance = await getTokenBalance(walletAddress, tokenMeta[debouncedFromToken].address);
      setTokenBalance(balance);
    } catch (err) {
      console.error('Error fetching token balance:', err);
    }
  };

  fetchBalance();
}, [connected, walletAddress, debouncedFromToken]);




const handleConnect = async () => {
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (accounts && accounts.length > 0) {
      localStorage.removeItem('disconnected'); // 👈 Clear manual disconnect flag
      setConnected(true);
      setWalletAddress(accounts[0]);
    }
  } catch (err) {
    console.error('Connection failed:', err);
  }
};

  

const handleSwap = async () => {
  if (!window.ethereum) {
    alert("Wallet not found");
    return;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const fromAddress = await signer.getAddress();

    const amountWei = parseUnits(debouncedAmount, tokenMeta[fromToken].decimals).toString();

    // 🔐 ERC-20 Approval (if not ETH)
    if (tokenMeta[fromToken].address !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
      const tokenContract = new ethers.Contract(tokenMeta[fromToken].address, erc20Abi, signer);
      const allowance = await tokenContract.allowance(fromAddress, ONE_INCH_SPENDER);
      if (BigInt(allowance) < BigInt(amountWei)) {
        const approvalTx = await tokenContract.approve(ONE_INCH_SPENDER, amountWei);
        await approvalTx.wait();
        console.log("Token approval confirmed.");
      }
    }

    // ⚙️ Get swap tx from 1inch
    const txData = await getSwapTx(
      tokenMeta[fromToken].address,
      tokenMeta[toToken].address,
      amountWei,
      fromAddress
    );

    // 🐢 Use a slow gas price (half of current market)
    const feeData = await provider.getFeeData();
    const safeGasPrice = feeData.gasPrice
    ? (feeData.gasPrice * BigInt(115)) / BigInt(100)  // +15% buffer
    : undefined;

    // 🧱 Build tx preview for gas estimate
    const txPreview = {
      to: txData.to,
      data: txData.data,
      value: txData.value ? BigInt(txData.value) : undefined,
    };

    
    const estimatedGas = txData.gas && parseInt(txData.gas) > 21000
    ? BigInt(txData.gas)
    : await signer.estimateGas(txPreview);
  
  const paddedGasLimit = estimatedGas * BigInt(110) / BigInt(100); // +10% buffer

    // 📦 Final tx request
    const txRequest = {
      ...txPreview,
      gasLimit: paddedGasLimit,
      gasPrice: safeGasPrice,
    };

    // 🚀 Send transaction
    const tx = await signer.sendTransaction(txRequest);
    console.log("Swap tx sent:", tx.hash);
    alert(`Swap sent! Tx hash: ${tx.hash}`);

    await tx.wait();
setSwapDetails({ fromSymbol: tokenMeta[fromToken].symbol, toSymbol: tokenMeta[toToken].symbol });
setShowSuccessModal(true);
    

    // 🔄 Refresh balance
    const updatedBalance = await getTokenBalance(fromAddress, tokenMeta[fromToken].address);
    setTokenBalance(updatedBalance);
  } catch (err) {
    console.error("Swap failed:", err);
    alert("Swap failed: " + (err?.message || "Unknown error"));
  }
};




  const handleReverse = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setQuote(null);
  
    // Optional: Delay balance call after quote finishes
    setTimeout(() => {
      setFromToken(toToken); // trigger balance fetch again safely
    }, 200);
  };

  return (
    <div className="relative min-h-screen w-full text-white overflow-hidden">
    {/* Background */}
    <img
      src="/back.png"
      alt="Background"
      className="absolute inset-0 w-full h-full object-cover z-0"
    />

    {/* Logo */}
    <div className="absolute top-0 left-0 z-2">
      <img src="/logo.png" alt="Logo" className="h-32 w-auto" />
    </div>

    <div className="relative z-10 flex justify-center items-center min-h-screen px-4">
<div className="absolute top-4 right-4 transform scale-120 origin-top-right z-20">
  {!connected ? (
    <button
      onClick={handleConnect}
      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white text-xs px-3 py-1 rounded-lg shadow"
    >
      Connect Wallet
    </button>
  ) : (
    <div className="relative">
      <button
        onClick={() => setShowWalletMenu((prev) => !prev)}
        className="flex items-center gap-2 bg-[#1c2233] px-3 py-2 rounded-xl text-sm text-white shadow-md"
      >
        <img src="/metamask.svg" alt="MetaMask" className="w-5 h-5" />
        <span className="font-mono">
          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </span>
      </button>

      {showWalletMenu && (
        <div className="absolute right-0 mt-2 bg-[#1c2233] border border-[#2a3045] rounded-xl shadow-lg w-full text-sm font-mono z-50">
          <button
            onClick={handleDisconnect}
            className="w-full px-4 py-2 text-left text-white hover:bg-[#2a3045] rounded-xl transition-colors duration-200"
          >
            Disconnect
          </button>
        </div>
      )}
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
          {connected && tokenBalance !== null && (
  <p className="text-right text-xs text-gray-500 mt-1">
    {formatUnits(tokenBalance, tokenMeta[fromToken].decimals)} {tokenMeta[fromToken].symbol}
  </p>
)}
        </div>

        {/* Arrow Button */}
        <div className="flex justify-center">
<button onClick={handleReverse} className="bg-[#1c2233] p-4 rounded-full hover:bg-[#2b334d] transition">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" fill="transparent" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m0 0l-4-4m4 4l4-4" />
  </svg>
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
              1 {fromToken} ≈ {(Number(quote) / Number(debouncedAmount)).toFixed(
  Number(quote) / Number(debouncedAmount) < 0.01 ? 12 : 2
)} {toToken}
{usdPrice && quote && (
  <span className="text-gray-600">
    (~${(Number(quote) * usdPrice).toFixed(2)})
  </span>
)}
            </p>
          )}
        </div>
        <button
  className={`w-full py-2 rounded-xl font-semibold transition-all text-white ${
    !connected
      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90'
      : quote && !loadingQuote && hasEnoughFunds
      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90'
      : 'bg-gray-600 cursor-not-allowed'
  }`}
  onClick={() => {
    if (!connected) {
      handleConnect();
    } else if (quote && !loadingQuote && hasEnoughFunds && !isInvalidAmount) {
      handleSwap();
    }
  }}
  disabled={
    connected &&
    (!quote || loadingQuote || isInvalidAmount || !hasEnoughFunds)
  }
>
{!connected
  ? 'Connect Wallet'
  : loadingQuote
  ? 'Loading...'
  : isInvalidAmount
  ? 'Enter an amount to swap'
  : !hasEnoughFunds
  ? 'Insufficient Balance'
  : 'Swap'}

</button>


      <section style={{ width: '100%' }}>
        <AddressHistory address={walletAddress}/>
      </section>

      </div>
    </div>
    
    {showSuccessModal && (
  <TransactionSuccessModal
    fromSymbol={swapDetails.fromSymbol}
    toSymbol={swapDetails.toSymbol}
    onClose={() => setShowSuccessModal(false)}
    onShowClearSignin={() => {
      alert("Clear Signin coming soon");
    }}
  />
)}

    </div>
    

  );
}
