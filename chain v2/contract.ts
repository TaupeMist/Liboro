import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import * as data from './data'
import { Address } from './address'

export interface ContractPayload {
  id: string
}

export interface AddPayload extends data.AddPayload {
  contract: Contract
}

export const initialState = {
  ...data.initialState,
  address: {
    ...data.initialState
  }
}

export const slice = createSlice({
  name: 'contract',
  initialState,
  reducers: {
    add: {
      prepare(contract) {
        return {
          payload: {
            contract,
            id: contract.id,
          }
        }
      },
      reducer(state, action: PayloadAction<AddPayload>) {
        data.default(state, data.add(action.payload))
      }
    }
  }
})

export const {
  add
} = slice.actions

const stateSelector = (state, id) => state.contract.entities[id]

export class Contract {
  public address: Address

  constructor(public id: string) { }

  public connect(address: Address) {
    this.address = address
  }

  public dispatch<PartialActionPayload extends object>(action, payload: PartialActionPayload) {
    type ActionPayload = PartialActionPayload & data.AddPayload

    const payloadFull = {
      id: this.id,
      ...(payload as object)
    } as ActionPayload

    this.address.chain.dispatch(action(payloadFull))
  }

  public get state() {
    return stateSelector(this.address.state, this.id)
  }
}

export default Contract
