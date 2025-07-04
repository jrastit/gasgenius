
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { buildErc7730Json } from '../../lib/erc7730'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' })

  const { address, chainId = 1 } = req.body
  if (!address)
    return res.status(400).json({ error: 'Address parameter missing' })

  const apiKey = process.env.ETHERSCAN_API_KEY
  if (!apiKey)
    return res
      .status(500)
      .json({ error: 'ETHERSCAN_API_KEY not configured on server' })

  const url = `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`
  try {
    const { data } = await axios.get(url)
    if (data.status !== '1')
      return res
        .status(400)
        .json({ error: data.result, url })
    const result = data.result[0]
    const abi = JSON.parse(result.ABI)
    const contractName = result.ContractName || 'Contract'
    const json = buildErc7730Json({
      address,
      chainId: Number(chainId),
      abi,
      contractName,
    })
    return res.status(200).json(json)
  } catch (err: any) {
    console.error(err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
