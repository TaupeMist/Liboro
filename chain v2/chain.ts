import Address from './address'
import store, { State } from './store'

// import { createSelector } from 'reselect'

const addressSelector = (state: State) => state.address

const addressEntitiesSelector = (state: State) => addressSelector(state).entities

const addressesSelector = (state: State) => {
  const address = addressSelector(state)

  return address.ids.map(id => address.entities[id])
}

// const stringSelector = (state, str) => str

// const addressByNameSelector = createSelector(
//   [addressesSelector, stringSelector],
//   (addresses, name) => addresses.find(entity => entity.name === name)
// )

export class Chain {
  constructor(private chain: typeof store) { }

  addAddress(addressId) {
    return new Address(this.chain, addressId)
  }

  public get state() {
    return this.chain.getState()
  }

  public get address() {
    return addressEntitiesSelector(this.state)
  }

  public get addresses() {
    return addressesSelector(this.state)
  }
}

export default new Chain(store)
