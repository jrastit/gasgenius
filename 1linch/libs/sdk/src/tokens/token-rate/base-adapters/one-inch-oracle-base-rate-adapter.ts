import { BigFloat } from '@1inch-community/core/math'
import {
  ChainId,
  IApplicationContext,
  IBigFloat,
  IToken,
  ITokenRateSourceAdapter,
  Rate,
  RateSource,
} from '@1inch-community/models'
import { Address, parseAbi } from 'viem'

const abi = parseAbi([
  'function getRate(address srcToken, address dstToken, bool useWrappers) external view returns (uint256 weightedRate)',
])

export class OneInchOracleBaseRateAdapter implements ITokenRateSourceAdapter {
  private context?: IApplicationContext

  constructor(
    public readonly name: string,
    private readonly factoryContractGetter: (chainId: ChainId) => Address,
    private readonly supportedChain: ChainId[]
  ) {}

  async init(context: IApplicationContext) {
    this.context = context
  }

  async getRate(
    chainId: ChainId,
    sourceToken: IToken,
    destinationToken: IToken
  ): Promise<Rate | null> {
    if (!this.context) {
      return null
    }
    const client = await this.context.onChain.getClient(chainId)
    const contractAddress = this.factoryContractGetter(chainId)
    const rateRaw = await client.readContract({
      abi,
      address: contractAddress,
      functionName: 'getRate',
      args: [sourceToken.address, destinationToken.address, false],
    })
    const [rate, revertedRate] = normalizeRate(rateRaw, sourceToken, destinationToken)
    return {
      source: RateSource.onChain,
      sourceToken,
      destinationToken,
      rate,
      revertedRate,
      isReverted: false,
    }
  }

  isSupportedChain(chainId: ChainId): boolean {
    return this.supportedChain.includes(chainId)
  }
}

function normalizeRate(
  rate: bigint,
  sourceToken: IToken,
  destinationToken: IToken
): [IBigFloat, IBigFloat] {
  const numerator = BigFloat.from(10 ** sourceToken.decimals)
  const denominator = BigFloat.from(10 ** destinationToken.decimals)
  const rateBigFloat = BigFloat.fromBigInt(rate, 0)
  const price = rateBigFloat.times(numerator).dividedBy(denominator).dividedBy(BigFloat.from(1e18))
  return [price, BigFloat.from(1).dividedBy(price)]
}
