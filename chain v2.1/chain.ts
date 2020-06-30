import Address, { addAddress } from './address'

import store from './store'

// import { createSelector } from 'reselect'

const addressSelector = state => state.address

const addressEntitiesSelector = state => addressSelector(state).entities

const addressesSelector = state => {
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

  addAddress(id) {
    this.chain.dispatch(addAddress({ id }))

    return new Address(this.chain, id)
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
