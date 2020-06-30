import { createAction, createReducer, PayloadAction } from '@reduxjs/toolkit'

import store from './store'
import Address from './address'

export interface State {
  [k: string]: any
}

export const initialState: State = {}

export interface SetStatePayload {
  addressId: string,
  contractId: string,
  contractState: any
}

export const getStateId = (contractId, addressId) => `${addressId}-${contractId}`

export const setState = createAction('state/setState',
  function prepare({ contractId, addressId, contractState }) {
    return {
      payload: {
        contractId,
        addressId,
        contractState
      }
    }
  }
)

export const reducer = createReducer(initialState, {
  [setState.type] : (state, action: PayloadAction<SetStatePayload>) => {
    const { contractId, addressId, contractState } = action.payload

    const stateId = getStateId(contractId, addressId)

    state[stateId] = {
      ...state[stateId],
      ...contractState,
      addressId,
      contractId
    }
  },
})

const stateSelector = (state, id) => state[id]

export class Contract {
  constructor(public address: Address, public contractId: string) { }

  public get state() {
    return stateSelector(this.address.chain.getState(), this.address.id)
  }
}

export default Contract
