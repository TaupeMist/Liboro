import { createSlice } from '@reduxjs/toolkit';

import Contract from './contract'
import Address from './address'

export interface MintPayload {
  receiver: string
}

export const initialState = {
  supply: 0
}

export const slice = createSlice({
  name: 'tokenContract',
  initialState,
  reducers: {
    mint(state) {
      state.supply += 1
    }
  },
})

export const {
  mint
} = slice.actions

export class Token extends Contract {
  public mint(receiver: Address) {
    this.dispatch<MintPayload>(mint, { receiver: receiver.id })
  }
}

export default Token
