import {
  TransactionStateType,
  TransactionType
} from './types'

export const getTransaction = (
  curr: TransactionStateType,
  next: TransactionStateType
): TransactionType => {
  return {
    curr,
    next,
    meta: {}
  }
}
