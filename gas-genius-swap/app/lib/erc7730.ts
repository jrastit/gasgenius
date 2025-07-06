
import { Interface, Fragment, JsonFragment } from 'ethers'

export interface Erc7730Options {
  address: string
  chainId: number
  abi: JsonFragment[]
  contractName?: string
}

const prettyLabel = (name: string) =>
  name
    ? name
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase())
        .trim()
    : 'Parameter'

const mapFormat = (type: string) => {
  if (type.startsWith('uint') || type.startsWith('int')) return 'raw'
  //if (type === 'address') return 'addressName'
  return 'raw'
}

export function buildErc7730Json({
  address,
  chainId,
  abi,
  contractName = 'Contract',
}: Erc7730Options) {
  const iface = new Interface(abi)
  const formats: Record<string, any> = {}

  iface.fragments
    .filter((f) => f.type === 'function')
    .forEach((fn: Fragment) => {
      if (fn.type !== 'function') return

      const fn2 : any = { ...fn }
      
      const signature = iface?.getFunction(`${fn2.name}`)?.format()
      const inputs = (fn.inputs || []).map((input, idx) => ({
        path: input.name || `arg${idx}`,
        label: prettyLabel(input.name || `Arg ${idx + 1}`),
        format: mapFormat(input.type),
      }))

      if (signature) {
        formats[signature] = {
          intent:
            fn2.name.toLowerCase() === 'transfer'
              ? 'Send'
              : fn2.name.toLowerCase() === 'approve'
              ? 'Approve'
              : 'Call',
          fields: inputs,
          required: inputs.map((i) => i.path),
          excluded: [],
        }
      }
    })

  return {
    $schema:
      'https://eips.ethereum.org/assets/eip-7730/erc7730-v1.schema.json',
    context: {
      $id: contractName,
      contract: {
        abi: `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}`,
        //abi: abi,
        deployments: [
          {
            chainId,
            address,
          },
        ],
      },
    },
    metadata: {
      owner: contractName,
    },
    display: {
      formats,
    },
  }
}
