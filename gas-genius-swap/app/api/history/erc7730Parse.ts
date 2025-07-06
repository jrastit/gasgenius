import { Interface } from 'ethers';

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY 
export async function getErc7730Info(data : string, erc7730: any) {
    if (!data || !erc7730) {
        return null;
    }
    
    let abi = erc7730?.context?.contract?.abi || erc7730?.context?.eip712?.abi;
    
    if (typeof abi === 'string') {
        try {
            const abi_url = new URL(abi);
            if (abi_url.protocol === 'http:' || abi_url.protocol === 'https:') {
                // Fetch the ABI from the URL
                const ret = await fetch(abi_url.toString() + `&apikey=${ETHERSCAN_API_KEY}`)
                if (!ret.ok) {
                    console.error('Failed to fetch ABI from URL:', abi_url.toString());
                    return null;
                }
                const abiData = await ret.json();
                if (abiData.status !== '1') {
                    console.error('Failed to fetch ABI:', abiData.result);
                    return null;
                }
                abi = JSON.parse(abiData.result);
            }
        } catch (e) {
            console.error('Failed to parse ABI string:', e);
            return null;
        }
    }

    //console.log('getErc7730Info', abi);

    if (!Array.isArray(abi) || abi.length === 0) {
        console.warn('No valid ABI found for ERC-7730');
        return null;
    }
    const ret = getErc7730InfoAbi(data, abi, erc7730);
    // console.info('getErc7730InfoAbi', ret);
    return ret;
    
}
export interface Erc7730Format {
  /** Human-readable field name, e.g. "recipient" */
  name: string;
  /** Solidity type, e.g. "address", "uint256" */
  type: string;
  /** If you want indexed (event-style) support later */
  indexed?: boolean;
}

export interface Erc7730Meta {
  /** Array that describes how to map decoded args               */
  formats: Erc7730Format[];
}

export interface ParsedErc7730Tx<Args = Record<string, unknown>> {
  /** Function name, e.g. "transfer"                            */
  method: string;
  /** 0x…4-byte selector                                       */
  selector: string;
  /** Solidity signature, e.g. "transfer(address,uint256)"       */
  signature: string;
  /** Raw ethers `Result` object                                 */
  rawArgs: readonly unknown[];
  /** Named args keyed by `formats[N].name`                      */
  args: Args;
}
/**
 * Decode a calldata blob with a full ABI and (optionally) map the result
 * onto a more ergonomic object using the ERC-7730 `formats` array.
 *
 * @param data     0x-prefixed calldata
 * @param abi      Full contract ABI that includes the target function
 * @param erc7730  Optional metadata that declares how to label each arg
 * @returns        A richly-typed object or `null` on failure
 */
export function getErc7730InfoAbi<
  F extends readonly Erc7730Format[] | undefined
>(
  data: string,
  abi: unknown[],
  erc7730?: {metadata:any, display : { formats: F }},
): ParsedErc7730Tx<
  F extends readonly Erc7730Format[]
    ? { [K in keyof F as F[K] extends Erc7730Format ? F[K]['name'] : never]:
          unknown }
    : Record<string, unknown>
> | null {
  if (!Array.isArray(abi) || abi.length === 0) {
    console.warn('[getErc7730Info] No valid ABI supplied');
    return null;
  }

  let parsed;
  try {
    const iface = new Interface(abi as any);
    parsed = iface.parseTransaction({ data });
  } catch (err) {
    console.error('[getErc7730Info] Failed to parse calldata', err);
    return null;
  }

  // Map raw positional args → named object if `formats` is provided
  const namedArgs: Record<string, unknown> = {};
  const formats = erc7730?.display?.formats || {};
  // console.log('getErc7730InfoAbi', formats, parsed);
// Try to map args using the format structure if available

let erc7730Info: { intent?: string, metadata: any } | undefined = undefined;

if (formats) {
    // Get selector from calldata
    const selector : string = parsed?.selector || data.slice(0, 10);
    const formatEntry = (formats as Record<string, any>)[selector];
    // console.log('getErc7730InfoAbi formatEntry', formatEntry, selector);
    if (formatEntry && Array.isArray(formatEntry.fields)) {
        formatEntry.fields.forEach((field: any, idx: number) => {
            // Use field.name if available, else fallback to index
            const name = field.name || `arg${idx}`;
            namedArgs[name] = parsed?.args?.[idx];
        });
    }
    erc7730Info = {
        metadata: erc7730?.metadata,
        intent : formatEntry?.intent 
    };
} 

  return {
    // method: parsed?.name,
    // selector: data.slice(0, 10),
    // signature: parsed?.signature,
    // rawArgs: parsed?.args,
    // args: Object.keys(namedArgs).length ? namedArgs : (parsed?.args as any),
    ...(erc7730Info ? { erc7730: erc7730Info } : {}),
  } as any;
}