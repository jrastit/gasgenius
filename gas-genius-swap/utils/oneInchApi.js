import axios from "axios";
import { parseUnits, formatUnits, ethers } from 'ethers';

const BASE_URL = "https://1inch-vercel-proxy-kl16.vercel.app/swap/v5.2/1"; // ETH mainnet
const BALANCE_URL = "https://1inch-vercel-proxy-kl16.vercel.app/balance/v1.2/1"; // ETH Mainnet

/**
 * Get a swap quote between two tokens.
 */
export async function getQuote(fromToken, toToken, amount, retries = 2) {
  console.log("[getQuote]", { fromToken, toToken, amount });

  try {
    const { data } = await axios.get(`${BASE_URL}/quote`, {
      params: {
        fromTokenAddress: fromToken,
        toTokenAddress: toToken,
        amount,
      },
    });

    console.log("[getQuote response]", data);
    return data;
  } catch (err) {
    const status = err.response?.status;
    console.warn(`[getQuote] Error (status: ${status})`);

    if (status === 429 && retries > 0) {
      console.log("[getQuote] Retrying after 300ms...");
      await new Promise((res) => setTimeout(res, 300));
      return getQuote(fromToken, toToken, amount, retries - 1);
    }

    throw err;
  }
}
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

const tokenPriceCache = {};


/**
 * Get swap transaction data to send via wallet.
 */
export async function getSwapTx(fromToken, toToken, amount, fromAddress, retries = 2) {
  try {
    const { data } = await axios.get(`${BASE_URL}/swap`, {
      params: {
        fromTokenAddress: fromToken,
        toTokenAddress: toToken,
        amount,
        fromAddress,
        slippage: 1,
        disableEstimate: false,
        allowPartialFill: false,
        referrerAddress: '', // Optional: your ref address here
      },
    });

    return data.tx;
  } catch (err) {
    const status = err.response?.status;
    console.warn(`[getSwapTx] Error (status: ${status})`);

    if (status === 429 && retries > 0) {
      console.log("[getSwapTx] Retrying after 300ms...");
      await new Promise((res) => setTimeout(res, 300));
      return getSwapTx(fromToken, toToken, amount, fromAddress, retries - 1);
    }

    throw err;
  }
}


/**
 * Get the balance of a specific token (including ETH) for a wallet.
 * Uses 1inch balance API which returns all balances as a map.
 */
export async function getTokenBalance(walletAddress, tokenAddress, retries = 2) {
  try {
    const { data } = await axios.get(`${BALANCE_URL}/balances/${walletAddress}`);
    const balanceMap = data ?? {};
    const normalizedAddress = tokenAddress.toLowerCase();
    return balanceMap[normalizedAddress] ?? "0";
  } catch (err) {
    const status = err.response?.status;
    console.warn(`[getTokenBalance] Error (status: ${status})`);

    if (status === 429 && retries > 0) {
      console.log("[getTokenBalance] Retrying after 300ms...");
      await new Promise((res) => setTimeout(res, 300));
      return getTokenBalance(walletAddress, tokenAddress, retries - 1);
    }

    return "0";
  }
}
