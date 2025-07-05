import { CacheActivePromise } from '@1inch-community/core/decorators'
import {
  ChainId,
  GasPriceDto,
  IApplicationContext,
  ICryptoAssetDataProvider,
  IProxyClient,
  ITokenV2Dto,
  ProxyResultBalance,
  ProxyResultBalanceItem,
  ProxyResultTokenPrice,
} from '@1inch-community/models'
import { Abi, Address, parseAbi, PublicClient } from 'viem'
import { getBalanceHelperAddress, isNativeToken } from '../../../chain'

const abi = parseAbi([
  'function balanceOf(address _owner) public view returns (uint256 balance)',
  'function getBalances(address user, address[] calldata tokenAddresses) external view returns (uint256[] memory)',
])

interface MulticallContract {
  address: Address
  abi: Abi
  functionName: string
  args: string[]
  _resultData: {
    chainId: ChainId
    tokenAddress: Address
    walletAddress: Address
  }
}

export class OneInchDevPortalCrossChainOnChainAdapter implements ICryptoAssetDataProvider {
  private context?: IApplicationContext

  async init(context: IApplicationContext): Promise<void> {
    this.context = context
  }

  @CacheActivePromise()
  async getBalances(chainIds: ChainId[], walletAddresses: Address[]): Promise<ProxyResultBalance> {
    if (!this.context) return []
    const tokenIdMap = await this.context.tokenStorage.getTokenAddressListOrderByChainId()
    const pending: Promise<ProxyResultBalance>[] = []
    for (const chainId of chainIds) {
      const client = await this.context.onChain.getClient(chainId)
      const tokenList = tokenIdMap[chainId]
      if (getBalanceHelperAddress(chainId) !== null) {
        this.getBalancesHelper(chainId, client, walletAddresses, tokenList, (collect) =>
          pending.push(collect)
        )
      } else {
        this.getBalancesMulticall(chainId, client, walletAddresses, tokenList, (collect) =>
          pending.push(collect)
        )
      }
    }

    const result = await Promise.all(pending)
    return mergeProxyResultBalance(result.flat())
  }

  async getTokenList(): Promise<ITokenV2Dto[]> {
    return await import('./token-list.json').then((data) => data.default as ITokenV2Dto[])
  }

  getGasPrice(): Promise<GasPriceDto | null> {
    throw new Error('Method not implemented.')
  }

  getTokenPrice(): Promise<ProxyResultTokenPrice> {
    throw new Error('Method not implemented.')
  }

  getProxyClient(): IProxyClient {
    throw new Error('OneInchDevPortalCrossChainOnChainAdapter not supported getProxyClient call')
  }

  private getBalancesMulticall(
    chainId: ChainId,
    client: PublicClient,
    walletAddresses: Address[],
    tokenList: Address[],
    collector: (collect: Promise<ProxyResultBalance>) => void
  ) {
    if (!this.context) {
      throw new Error(
        'OneInchDevPortalCrossChainOnChainAdapter.getBalancesMulticall Error: Missing context'
      )
    }
    const contracts: MulticallContract[] = []

    for (const token of tokenList) {
      for (const walletAddress of walletAddresses) {
        if (isNativeToken(token)) {
          collector(
            client
              .getBalance({ address: walletAddress })
              .catch(() => 0n)
              .then((result) => {
                return [
                  {
                    id: [chainId, walletAddress].join(':'),
                    result: {
                      [token]: result.toString(),
                    },
                    error: null,
                  },
                ]
              })
          )
          continue
        }

        contracts.push({
          abi,
          functionName: 'balanceOf',
          address: token,
          args: [walletAddress],
          _resultData: {
            chainId,
            walletAddress,
            tokenAddress: token,
          },
        })
      }
    }

    const requestResultPending = client
      .multicall({ contracts, batchSize: 1024 })
      .then((requestResult) => {
        const resultMap = new Map<string, ProxyResultBalanceItem>()
        for (let i = 0; i < requestResult.length; i++) {
          const result = requestResult[i]
          if (result.result === 0n) {
            continue
          }
          const { chainId, tokenAddress, walletAddress } = contracts[i]._resultData
          if (result.status === 'failure') {
            console.error(
              `Load token balance error ${chainId} ${tokenAddress} ${walletAddress} \n`,
              result.error.message
            )
            continue
          }
          const id = [chainId, walletAddress].join(':')
          let resultMapRecord = resultMap.get(id)
          if (!resultMapRecord) {
            resultMapRecord = {
              id,
              result: {},
              error: null,
            } satisfies ProxyResultBalanceItem
          }
          if (resultMapRecord.error === null && resultMapRecord.result !== null) {
            resultMapRecord.result[tokenAddress] = (result.result ?? 0).toString()
          }

          resultMap.set(id, resultMapRecord)
        }
        return [...resultMap.values()]
      })

    collector(requestResultPending)
  }

  private getBalancesHelper(
    chainId: ChainId,
    client: PublicClient,
    walletAddresses: Address[],
    tokenList: Address[],
    collector: (collect: Promise<ProxyResultBalance>) => void
  ) {
    const contractAddress = getBalanceHelperAddress(chainId)
    if (contractAddress === null) {
      throw new Error(
        `OneInchDevPortalCrossChainOnChainAdapter.getBalancesHelper Error, contract address address does not exist by chain ${chainId}`
      )
    }
    for (const walletAddress of walletAddresses) {
      const pending = client
        .readContract({
          abi,
          functionName: 'getBalances',
          address: contractAddress,
          args: [walletAddress, tokenList],
        })
        .then((balances) => {
          const result: Record<Address, string> = {}
          const id = [chainId, walletAddress].join(':')
          for (let i = 0; i < balances.length; i++) {
            const balance = balances[i]
            if (balance === 0n) continue
            const tokenAddress = tokenList[i]
            result[tokenAddress] = balance.toString()
          }
          return [
            {
              id,
              result,
              error: null,
            },
          ]
        })
        .catch((err) => {
          console.error(`Load balance from helper error`, err)
          return [
            {
              id: [chainId, walletAddress].join(':'),
              result: null,
              error: { code: err.code ?? 0, message: err.message },
            },
          ]
        })
      collector(pending)
    }
  }
}

function mergeProxyResultBalance(data: ProxyResultBalance): ProxyResultBalance {
  const result: Map<string, ProxyResultBalanceItem> = new Map()
  for (const item of data) {
    if (result.has(item.id)) {
      const resultItem = result.get(item.id)!
      if (resultItem.result) {
        resultItem.result = { ...resultItem.result, ...item.result }
      }
      continue
    }
    result.set(item.id, item)
  }

  return [...result.values()]
}
