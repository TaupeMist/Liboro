import { createAction, createReducer, PayloadAction, PrepareAction } from '@reduxjs/toolkit'

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
