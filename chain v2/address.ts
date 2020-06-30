import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import store from './store'

import * as data from './data'

import Contract, * as contract from './contract'

interface AddAddressPayload extends data.AddPayload { }

interface AddContractPayload {
  id: string,
  contract: contract.ContractPayload
}

interface State extends data.State {}

export const initialState: State = {
  ...data.initialState
}

export const slice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    addAddress: {
      prepare(id) {
        return {
          payload: {
            contract: contract.initialState,
            id
          }
        }
      },
      reducer(state, action: PayloadAction<AddAddressPayload>) {
        data.default(state, data.add(action.payload))
      }
    },
    addContract(state, action: PayloadAction<AddContractPayload>) {
      contract.slice.reducer(
        state.entities[action.payload.id].contract,
        contract.add(action.payload.contract)
      )
    }
  },
})

export const {
  addAddress,
  addContract
} = slice.actions

const stateSelector = (state, id) => state.address.entities[id]

const contractSelector = (state, id) => stateSelector(state, id).contract

const contractsSelector = (state, id) => {
  const contract = contractSelector(state, id)

  return contract.ids.map(id => contract.entities[id])
}

export class Address {
  constructor(public chain: typeof store, public id: string) { }

  public get state() {
    return stateSelector(this.chain.getState(), this.id)
  }

  public get contract() {
    return contractSelector(this.chain.getState(), this.id)
  }

  public get contracts() {
    return contractsSelector(this.chain.getState(), this.id)
  }

  addContract(contract) {
    this.chain.dispatch(addContract({
      id: this.id,
      contract: {
        id: contract.id
      }
    }))

    contract.connect(this)

    return contract
  }
}

export default Address
