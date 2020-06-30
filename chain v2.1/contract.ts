import { createAction, createReducer, createSlice, PayloadAction } from '@reduxjs/toolkit'

import store from './store'
import Address from './address'
import { setState } from './state'

export interface State {
  ids: string[],
  entities: {
    [k: string]: any
  }
}

export const initialState: State = {
  ids: [],
  entities: {}
}

export interface SetContractPayload {
  addressId: string,
  contractId: string
}

export const setContract = createAction('contract/setContract', function prepare({ contractId, addressId }) {
  return {
    payload: {
      contractId,
      addressId
    }
  }
})

export const reducer = createReducer(initialState, {
  [setContract.type]: (state, action: PayloadAction<SetContractPayload>) => {
    const { contractId, addressId } = action.payload

    state.entities[contractId] = addressId
    state.ids.push(contractId)
  }
})

const stateSelector = (root, addressId, contractId) => root.state[`${addressId}-${contractId}`]

export class Contract {
  constructor(public address: Address, public id: string) {
    address.setContract(id)
  }

  public get state() {
    return stateSelector(this.address.chain.getState(), this.address.id, this.id)
  }

  public dispatch(action) {
    this.dispatch(setState({
      contractId: this.id,
      addressId: this.address.id,
      contractState: {
        ...this.state,
        supply: 5
      }
    }))

    return this.address.chain.dispatch
  }
}

export default Contract
