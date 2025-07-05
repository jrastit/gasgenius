import {
  Address,
  decodeAbiParameters,
  encodeAbiParameters,
  encodeFunctionData,
  Hash,
  Hex,
  maxUint160,
  maxUint256,
  maxUint48,
  parseSignature,
} from 'viem'
import { PERMIT2_ABI, PermitSingle } from '../../chain'

interface PermitArgs {
  amount: bigint
  expiration: number
  nonce: number
  sigDeadline: bigint
  r: string
  vs: string
}

const permit2AbiParams = [
  { name: 'owner', type: 'address' },
  { name: 'token', type: 'address' },
  { name: 'amount', type: 'uint160' },
  { name: 'expiration', type: 'uint48' },
  { name: 'nonce', type: 'uint48' },
  { name: 'spender', type: 'address' },
  { name: 'sigDeadline', type: 'uint256' },
  { name: 'signature', type: 'bytes' },
] as const

export const OneInchSdkPermit2Converter = (
  walletAddress: Address,
  permitSingle: PermitSingle,
  signedPermit: Hash,
  compact: boolean = false
): string => {
  validatePermit2Details(permitSingle)
  const permitCall = encodePermitCall(walletAddress, permitSingle, signedPermit)
  const compressedPermit = compressPermit(permitCall)

  if (compact) {
    return compressedPermit
  } else {
    return decompressPermit(
      compressedPermit,
      permitSingle.details.token,
      walletAddress,
      permitSingle.spender
    )
  }
}

const validatePermit2Details = (details: PermitSingle): void => {
  if (maxUint48 < details.details.nonce) {
    throw new Error('NonceOutOfRangeException')
  }

  if (maxUint160 < details.details.amount) {
    throw new Error('AmountOutOfRangeException')
  }

  if (maxUint48 < details.details.expiration) {
    throw new Error('ExpirationOutOfRangeException')
  }

  if (maxUint256 < details.sigDeadline) {
    throw new Error('SigDeadLineOutOfRangeException')
  }
}

const trim0x = (hexString: Hex | string): string => {
  return hexString.startsWith('0x') ? hexString.slice(2) : hexString
}

const cutSelector = (data: Hash): Hash => {
  const hexPrefix = '0x'
  return (hexPrefix + data.substring(hexPrefix.length + 8)) as Hex
}

const computeYParityAndS = (s: string, v: bigint): string => {
  const sBigInt = BigInt(s)
  const vAdjusted = v - 27n
  const result = (vAdjusted << 255n) | sBigInt
  return result.toString(16).padStart(64, '0')
}

const encodePermitCall = (
  walletAddress: Address,
  permitSingle: PermitSingle,
  signedPermit: Hash
): Hex => {
  const signature = parseSignature(signedPermit)
  const yParityAndS =
    signature.v === 27n ? signature.s : computeYParityAndS(signature.s, signature.v!)
  const updatedSig = `${signature.r}${trim0x(yParityAndS)}` as Hex

  const permitCallFull = encodeFunctionData({
    abi: PERMIT2_ABI,
    functionName: 'permit',
    args: [walletAddress, permitSingle, updatedSig],
  })

  return cutSelector(permitCallFull)
}

const compressPermit = (permit: Hash): string => {
  switch (permit.length) {
    case 450:
      throw new Error('IERC20Permit.permit not implemented yet')
    case 514:
      throw new Error('IDaiLikePermit.permit not implemented yet')
    case 706:
      return decodePermit(permit)

    case 202:
    case 146:
    case 194:
      throw new Error('Permit is already compressed')
    default:
      throw new Error('Invalid permit length')
  }
}

const decodePermit = (permit: Hash): Hash => {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [owner, token, amount, expiration, nonce, spender, sigDeadline, signature] =
    decodeAbiParameters(permit2AbiParams, permit)
  /* eslint-enable @typescript-eslint/no-unused-vars */

  const compressResult = [
    amount.toString(16).padStart(40, '0'),

    expiration.toString() === maxUint48.toString()
      ? '00000000'
      : (BigInt(expiration) + 1n).toString(16).padStart(8, '0'),

    nonce.toString(16).padStart(8, '0'),

    sigDeadline.toString() === maxUint48.toString()
      ? '00000000'
      : (sigDeadline + 1n).toString(16).padStart(8, '0'),

    BigInt(signature).toString(16).padStart(128, '0'),
  ].join('')

  return `0x${compressResult}`
}

export function decompressPermit(
  permit: string,
  token: Address,
  owner: Address,
  spender: Address
): string {
  const cleanPermit = permit.startsWith('0x') ? permit : '0x' + permit

  try {
    const args = parsePermit(cleanPermit)
    return encodePermit2Args(owner, token, spender, args)
  } catch (error) {
    console.error('Error decompressing permit:', error)
    throw new Error('Failed to decompress permit: ' + error)
  }
}

function parsePermit(permit: string): PermitArgs {
  const cleanPermit = permit.startsWith('0x') ? permit.slice(2) : permit

  return {
    amount: BigInt('0x' + cleanPermit.slice(0, 40)),
    expiration: Number('0x' + cleanPermit.slice(40, 48)),
    nonce: Number('0x' + cleanPermit.slice(48, 56)),
    sigDeadline: BigInt('0x' + cleanPermit.slice(56, 64)),
    r: '0x' + cleanPermit.slice(64, 128),
    vs: '0x' + cleanPermit.slice(128, 192),
  }
}

function encodePermit2Args(
  owner: Address,
  token: Address,
  spender: Address,
  permitArgs: PermitArgs
): string {
  const args = [
    owner,
    token,
    permitArgs.amount,
    permitArgs.expiration === 0 ? Number(maxUint48) : permitArgs.expiration - 1,
    permitArgs.nonce,
    spender,
    permitArgs.sigDeadline === 0n ? maxUint48 : permitArgs.sigDeadline - 1n,
    (permitArgs.r + trim0x(permitArgs.vs)) as Hex,
  ] as const

  return encodeAbiParameters(permit2AbiParams, args)
}
