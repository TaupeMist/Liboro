import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import logger from 'redux-logger'

import * as address from './address'
import * as contract from './contract'
import * as state from './state'

const store = configureStore({
  reducer: {
    address: address.slice.reducer,
    contract: contract.reducer,
    state: state.reducer,
  },
  middleware: [...getDefaultMiddleware(), logger]
})

export default store
