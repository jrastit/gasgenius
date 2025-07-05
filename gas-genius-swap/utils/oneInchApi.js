import axios from "axios";

const BASE_URL = "https://1inch-vercel-proxy-kl16.vercel.app/swap/v5.2/1"; // ETH mainnet
const API_KEY = process.env.NEXT_PUBLIC_1INCH_API_KEY;

export async function getQuote(fromToken, toToken, amount) {
    console.log('[getQuote]', { fromToken, toToken, amount });
  
    const { data } = await axios.get(`${BASE_URL}/quote`, {
      params: {
        fromTokenAddress: fromToken,
        toTokenAddress: toToken,
        amount,
      },

    });
    console.log('[1inch response]', data);

    return data;
  }
  

export async function getSwapTx(fromToken, toToken, amount, fromAddress) {
  const { data } = await axios.get(`${BASE_URL}/swap`, {
    params: {
      fromTokenAddress: fromToken,
      toTokenAddress: toToken,
      amount,
      fromAddress,
      slippage: 1,
    },
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  });
  return data.tx;
}
