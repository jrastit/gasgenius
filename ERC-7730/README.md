
# ERC-7730 Generator (Next.js)

This project lets you generate an [ERC‑7730](https://eips.ethereum.org/EIPS/eip-7730) metadata JSON for any **verified** smart‑contract by fetching its ABI from Etherscan and auto‑mapping each function.

## Quick start

```bash
pnpm install  # or npm/yarn
cp .env.local.example .env.local
# add your Etherscan API key to .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser, paste a contract address,
choose the chain, and hit **Generate**.  
You can preview the generated JSON and download it directly.

## How it works

1. **`pages/api/generate.ts`**  
   Calls `https://api.etherscan.io/api?module=contract&action=getsourcecode`  
   to retrieve the verified source and ABI, then pipes the ABI into
   `lib/erc7730.ts`.
2. **`lib/erc7730.ts`**  
   Uses `ethers` to parse the ABI. For each function it:
   - Builds a Solidity signature (e.g. `transfer(address,uint256)`).
   - Guesses a user‑friendly intent (`Send`, `Approve`, default: `Call`).
   - Generates default field descriptors (raw integers, addresses as `addressOrName`, etc.).
3. Returns a minimal yet valid ERC‑7730 file that wallets such as Ledger **Clear‑Signing** can use immediately. You can extend the logic (decimals lookup, tokenAmount formatting, etc.) by editing `mapFormat` and `intent` heuristics in `lib/erc7730.ts`.

## Limitations & next steps

* Only Ethereum Mainnet, Polygon, and Arbitrum One presets are included — add more in the `<select>` list.
* Field formats default to *raw*; enhance the mapper to detect `tokenAmount`, `date`, etc.
* You might want to publish the generated JSON to IPFS or submit it to the [official registry](https://github.com/LedgerHQ/clear-signing-erc7730-registry).
* Error handling is basic; production apps should rate‑limit and cache Etherscan requests.

Happy hacking!
