import Address from './address'

import {
  setContract
} from './contract.store'

const stateSelector = (root, addressId, contractId) => root.contract[`${addressId}-${contractId}`]

export class Contract {
  constructor(public address: Address, public id: string) {
    this.dispatch(setContract({ contractId: id, addressId: address.id }))
  }

  public get state() {
    return stateSelector(this.address.chain.getState(), this.address.id, this.id)
  }

  public get dispatch() {
    return this.address.chain.dispatch
  }
}

export default Contract
