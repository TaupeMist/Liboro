import store from './store'
import Token from './token'

import {
  addAddress,
  stateSelector
} from './address.store'

export class Address {
  constructor(public chain: typeof store, public id: string) {
    this.chain.dispatch(addAddress({ id }))
  }

  public get state() {
    return stateSelector(this.chain.getState(), this.id)
  }

  public addContract(contractId: string) {
    return new Token(this, contractId)
  }
}

export default Address
