import { Observable } from 'rxjs'
import {
  Address,
  Block,
  BlockTag,
  Hash,
  PublicClient,
  Transaction,
  WriteContractParameters,
} from 'viem'
import { InitializingEntity } from '../base'
import { IBigFloat } from '../big-float'
import { ChainId } from './chain-id'

export interface IOnChain extends InitializingEntity {
  readonly crossChainEmitter: Observable<void>
  getClient(chainId: ChainId): Promise<PublicClient>
  getBlockEmitter(chainId: ChainId): Observable<Block>
  getChainTickEmitter(chainId: ChainId): Observable<void>
  getAllowance(
    chainId: ChainId,
    token: Address,
    owner: Address,
    spender: Address
  ): Promise<IBigFloat>
  waitTransaction(chainId: ChainId, hash: Hash, blockTag?: BlockTag): Promise<Transaction>
  simulateApprove(
    chainId: ChainId,
    token: Address,
    owner: Address,
    spender: Address,
    value: IBigFloat
  ): Promise<WriteContractParameters>
  estimateWrapNativeToken(chainId: ChainId, value: IBigFloat): Promise<IBigFloat>
  simulateWrapNativeToken(chainId: ChainId, value: IBigFloat): Promise<WriteContractParameters>
}
