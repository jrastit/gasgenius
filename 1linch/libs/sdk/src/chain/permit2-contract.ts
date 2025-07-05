import { Address, parseAbi } from 'viem'

export const PERMIT2_ABI = parseAbi([
  'function DOMAIN_SEPARATOR() external view returns (bytes32)',
  'function allowance(address owner, address token, address spender) external view returns (uint160 amount, uint48 expiration, uint48 nonce)',
  'function approve(address token, address spender, uint160 amount, uint48 expiration) external',
  'function permit(address owner, ((address token, uint160 amount, uint48 expiration, uint48 nonce) details, address spender, uint256 sigDeadline) permitSingle, bytes calldata signature) external',
])

export interface PermitSingle {
  details: {
    token: Address
    amount: bigint
    expiration: number
    nonce: number
  }
  spender: Address
  sigDeadline: bigint
}
