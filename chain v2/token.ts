import { createAction, createReducer, PayloadAction, PrepareAction } from '@reduxjs/toolkit'

import Address from './address'
import Contract from './contract'
import * as contract from './contract.types'

export const initialGlobalState = {
  supply: 0
}

export const initialState = {
  amount: 0
}

export interface IssuePayload extends contract.ContractPayload {
  amount: number,
  receiverId: string
}

export const issue = createAction<PrepareAction<IssuePayload>>(
  `${contract.CONTRACT}/token/issue`,
  function prepare({ contractId, amount, receiverId }: IssuePayload) {
    return {
      payload: {
        contractId,
        amount,
        receiverId
      }
    }
  }
)

export const reducer = createReducer({}, {
  [contract.SET_CONTRACT]: (state) => {
    state.global = initialGlobalState
  },
  [issue.type]: (state, action: PayloadAction<IssuePayload>) => {
    const { amount, receiverId } = action.payload

    state.global.supply += amount
    if (!state[receiverId]) state[receiverId] = initialState

    state[receiverId].amount += amount
  }
})

export interface TokenIssue {
  amount: number,
  receiver: Address
}

export class Token extends Contract {
  constructor(public address: Address, public id: string) {
    super(address, id)
  }

  public issue({ amount, receiver }: TokenIssue): void {
    this.dispatch(issue({ contractId: this.id, amount, receiverId: receiver.id }))
  }
}

export default Token
