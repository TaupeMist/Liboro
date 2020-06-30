import { createAction } from '@reduxjs/toolkit';

import Contract from './contract'
import Address from './address';
import { setState } from './state'

export interface MintPayload {
  receiver: string
}

export const initialState = {
  supply: 0
}

export class Token extends Contract {
  public mint() {
    this.dispatch(setState({
      contractId: this.id,
      addressId: this.address.id,
      contractState: {
        ...this.state,
        supply: 5
      }
    }))
  }
}

export default Token
