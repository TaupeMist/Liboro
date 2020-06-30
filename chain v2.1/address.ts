import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import store from './store'
import Contract, { setContract } from './contract'
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

export interface AddAddressPayload {
  id: string
}

export const reducers = {
  addAddress(state, action: PayloadAction<AddAddressPayload>) {
    const { id, ...rest } = action.payload

    state.entities[id] = { id, ...rest }
    state.ids.push(id)
  },
}

export const slice = createSlice({
  name: 'address',
  initialState,
  reducers,
  extraReducers: {
    [setContract.type]: (state, action) => {
      const { contractId, addressId } = action.payload

      state.entities[addressId].contractId = contractId
    }
  }
})

export const {
  addAddress
} = slice.actions

const stateSelector = (state, id) => state.entities[id]

export function getContractStateId({ addressId, contractId, contractStateId }) {
  if (contractStateId) {
    const [addressId, contractId] = contractStateId.split('-')

    return { addressId, contractId  }
  }

  return { addressId, contractId  }
}

export class Address {
  constructor(public chain: typeof store, public id: string) { }

  public get state() {
    return stateSelector(this.chain.getState(), this.id)
  }

  // public getContract() {
  //   return new Contract(this, id)
  // }

  setContract(id) {
    this.chain.dispatch(setContract({
      addressId: this.id,
      contractId: id
    }))
  }
}

export default Address
