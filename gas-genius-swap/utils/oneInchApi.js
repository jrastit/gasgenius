import axios from "axios";

const BASE_URL = "https://1inch-vercel-proxy-kl16.vercel.app/swap/v5.2/1"; // ETH mainnet
const BALANCE_URL = "https://1inch-vercel-proxy-kl16.vercel.app/balance/v1.2/1"; // ETH Mainnet

/**
 * Get a swap quote between two tokens.
 */
export async function getQuote(fromToken, toToken, amount) {
  console.log("[getQuote]", { fromToken, toToken, amount });

  const { data } = await axios.get(`${BASE_URL}/quote`, {
    params: {
      fromTokenAddress: fromToken,
      toTokenAddress: toToken,
      amount,
    },
  });

  console.log("[1inch response]", data);
  return data;
}

/**
 * Get swap transaction data to send via wallet.
 */
export async function getSwapTx(fromToken, toToken, amount, fromAddress) {
  const { data } = await axios.get(`${BASE_URL}/swap`, {
    params: {
      fromTokenAddress: fromToken,
      toTokenAddress: toToken,
      amount,
      fromAddress,
      slippage: 1,
    },
  });

  return data.tx;
}

/**
 * Get the balance of a specific token (including ETH) for a wallet.
 * Uses 1inch balance API which returns all balances as a map.
 */
export async function getTokenBalance(walletAddress, tokenAddress) {
  try {
    const { data } = await axios.get(`${BALANCE_URL}/balances/${walletAddress}`);

    const balanceMap = data ?? {};
    const normalizedAddress = tokenAddress.toLowerCase();

    return balanceMap[normalizedAddress] ?? "0"; // return as string in raw wei format
  } catch (err) {
    console.error("[getTokenBalance] Error:", err);
    return "0";
  }
}
