import { http, webSocket } from 'viem'
import { asyncTimeout } from '../libs/core/src/async'
import { ChainId } from '../libs/models/src'
import { getChainById, parseChainId } from '../libs/sdk/src/chain'
import { getChainIdList } from '../libs/sdk/src/chain/chain-id-list'
import { getRPC } from '../libs/sdk/src/chain/transport-map'

let totalHttpRpc = 0
let totalWsRpc = 0

async function main() {
  console.log('start')
  const chainList = getChainIdList()
  const chainSet = new Set(chainList)
  const chains = await fetch('https://chainid.network/chains_mini.json').then((res) => res.json())
  const recordHttp = {} as Record<string, Set<string>>
  const recordWss = {} as Record<string, Set<string>>
  for (const chain of chains) {
    if (!chainSet.has(chain.chainId)) continue
    const rpcList: string[] = chain.rpc.filter((rpc: string) => !rpc.includes('${'))
    const { http, ws } = getRPC(chain.chainId as ChainId)
    recordHttp[chain.chainId] = new Set([
      ...http.map((rpc) => (typeof rpc === 'string' ? rpc : rpc.rpc)),
      ...rpcList.filter((rpc) => !rpc.startsWith('wss')),
    ])
    recordWss[chain.chainId] = new Set([
      ...ws.map((rpc) => (typeof rpc === 'string' ? rpc : rpc.rpc)),
      ...rpcList.filter((rpc) => rpc.startsWith('wss')),
    ])
    totalHttpRpc += recordHttp[chain.chainId].size
    totalWsRpc += recordWss[chain.chainId].size
  }

  console.log('total http rpc: ', totalHttpRpc)
  console.log('total wss rpc: ', totalWsRpc)

  await Promise.all([
    testRecord(recordHttp),
    // testRecord(recordWss)
  ])

  console.log('test done')

  console.log(recordHttp)
  console.log(recordWss)
}

async function testRecord(record: Record<string, Set<string>>) {
  await Promise.all(
    Object.keys(record).map((chainId) => testRpcCollection(parseChainId(chainId), record[chainId]))
  )
}

async function testRpcCollection(chainId: ChainId, collection: Set<string>) {
  await Promise.all(
    collection
      .values()
      .toArray()
      .map((rpc) => testRPCAndRemove(chainId, rpc, collection))
  )
}

async function testRPCAndRemove(chainId: ChainId, rpc: string, collection: Set<string>) {
  const result = await testRPC(chainId, rpc)
  if (!result) {
    collection.delete(rpc)
  }
}

async function testRPC(chainId: ChainId, rpc: string): Promise<boolean> {
  const transportFactory = rpc.startsWith('wss') ? webSocket(rpc) : http(rpc)
  const transport = transportFactory({
    chain: getChainById(chainId),
    retryCount: 0,
    timeout: 20_000,
    pollingInterval: 0,
  })
  const getTotal = () => {
    let total
    if (rpc.startsWith('wss')) {
      total = totalWsRpc--
    } else {
      total = totalHttpRpc--
    }
    return total
  }
  try {
    console.log('start test', rpc)
    const pending = transport
      .request({ method: 'net_listening' })
      .catch(() => transport.request({ method: 'net_listening' }))
      .catch(() => transport.request({ method: 'web3_clientVersion' }))
      .catch(() => transport.request({ method: 'eth_blockNumber' }))
      .catch(() => transport.request({ method: 'net_version' }))
      .catch(() => transport.request({ method: 'eth_syncing' }))
      .then((result) => {
        console.log('test success', getTotal(), rpc, chainId, result)
        return !!result
      })
    return await Promise.any([pending, asyncTimeout(2000).then(() => Promise.reject('Timeout'))])
  } catch (error) {
    console.log('test error', getTotal(), rpc, chainId, error)
    return false
  }
}

main().catch(console.error)
