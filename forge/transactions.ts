import { LiboroAssetType } from '../contract'

import { getTransaction, TransactionType, TransactionStateType } from '../chain'

export type MintTransActionType = TransactionType & {
  meta: {
    minting: any,
    payable: any
  }
}

export const getMintTransaction = (
  curr: TransactionStateType,
  next: TransactionStateType,
  minting: LiboroAssetType,
  payable: LiboroAssetType
): MintTransActionType => {
  const transaction = getTransaction(curr, next) as MintTransActionType

  transaction.meta.minting = minting
  transaction.meta.payable = payable

  return transaction
}
