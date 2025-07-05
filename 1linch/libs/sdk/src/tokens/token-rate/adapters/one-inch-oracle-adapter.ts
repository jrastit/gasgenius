import { ChainId } from '@1inch-community/models'
import { oneInchSpotPriceOracle } from '../../../chain'
import { OneInchOracleBaseRateAdapter } from '../base-adapters/one-inch-oracle-base-rate-adapter'

export const oneInchOracleAdapter = new OneInchOracleBaseRateAdapter(
  'one-inch-oracle-adapter',
  oneInchSpotPriceOracle,
  [
    ChainId.eth,
    ChainId.bnb,
    ChainId.matic,
    ChainId.op,
    ChainId.arbitrum,
    ChainId.gnosis,
    ChainId.avalanche,
    ChainId.fantom,
    ChainId.aurora,
    ChainId.klaytn,
    ChainId.zkSyncEra,
  ]
)
