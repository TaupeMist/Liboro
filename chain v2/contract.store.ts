import { createAction, createReducer, PayloadAction, AnyAction, PrepareAction } from '@reduxjs/toolkit'

import * as token from './token'
import {
  SET_CONTRACT,
  CONTRACT,
  ContractPayload,
  SetContractPayload,
  initialState
} from './contract.types'

export const setContract = createAction<PrepareAction<SetContractPayload>>(
  SET_CONTRACT,
  function prepare({ contractId, addressId }: SetContractPayload) {
    return {
      payload: {
        contractId,
        addressId
      }
    }
  }
)

export const reducer = createReducer(initialState, builder => 
  builder
    .addCase(
      setContract.type,
      (state, action: PayloadAction<SetContractPayload>) => {
        const { contractId } = action.payload
    
        state.ids.push(contractId)
        state.entities[contractId] = { id: contractId }
      }
    )
    .addMatcher(
      (action): action is AnyAction => action.type.startsWith(CONTRACT),
      (state, action: PayloadAction<ContractPayload>) => {
        const { contractId } = action.payload

        token.reducer(state.entities[contractId], action)
      }
    )
)
