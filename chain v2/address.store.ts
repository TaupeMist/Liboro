import { createSlice, PayloadAction, AnyAction } from '@reduxjs/toolkit'

import * as contract from './contract.types'

export interface State {
  ids: string[],
  entities: {
    [k: string]: {
      id: string,
      contractId: string,
      contractIds: string[]
    }
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
    const { id } = action.payload

    state.entities[id] = {
      id,
      contractIds: []
    }
    state.ids.push(id)
  },
}

export const slice = createSlice({
  name: 'address',
  initialState,
  reducers,
  extraReducers: builder =>
    builder
      .addMatcher(
        (action): action is AnyAction => action.type.startsWith(contract.SET_CONTRACT),
        (state, action) => {
          const { addressId, contractId } = action.payload

          state.entities[addressId].contractId = contractId
        }
      )
})

export const {
  addAddress
} = slice.actions

export const stateSelector = (root, addressId: string) => root.address.entities[addressId]
