import Address from './address'
import * as store from './store'

import {
  setContract
} from './contract.store'

const stateSelector = (root: store.State, contractId: string) => root.contract.entities[contractId]

export class Contract {
  constructor(public address: Address, public id: string) {
    this.dispatch(setContract({ contractId: id, addressId: address.id }))
  }

  public get state() {
    return stateSelector(this.address.chain.getState(), this.id)
  }

  public get dispatch() {
    return this.address.chain.dispatch
  }
}

export default Contract
