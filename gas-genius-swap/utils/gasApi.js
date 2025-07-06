import { parseUnits } from "ethers";

export async function getOptimisedGasPrice() {
  const res = await fetch("http://51.159.164.51:8000/predict/now");
  const data = await res.json();
  const lowGwei = data.predicted_gas_fee_at_now?.low;

  if (!lowGwei) throw new Error("Invalid gas price response");

  return parseUnits(lowGwei.toString(), "gwei"); // Convert Gwei → wei
}
