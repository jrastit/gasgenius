import { TokenRecordId } from '@1inch-community/models'

export function calculateSize(
  showMoreChain: boolean,
  tokenIdListWithoutBalance: TokenRecordId[],
  tokenIdListWithBalance: TokenRecordId[] | null
): number {
  const zeroBalance = tokenIdListWithBalance === null || tokenIdListWithBalance.length === 0
  const chainItemSize = 60
  const chainItemMargin = 4
  const openMoreItemSize = 24
  const openMoreItemPaddingTop = 8
  let total = 0
  if (!zeroBalance) {
    total += tokenIdListWithBalance.length * (chainItemSize + chainItemMargin)
  }
  if (!zeroBalance && tokenIdListWithoutBalance.length) {
    total += openMoreItemSize + openMoreItemPaddingTop
  }
  if (showMoreChain || zeroBalance) {
    total += tokenIdListWithoutBalance.length * (chainItemSize + chainItemMargin)
  }
  return total
}
