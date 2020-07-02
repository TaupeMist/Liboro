import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import logger from 'redux-logger'

import * as address from './address'
import * as contract from './contract.store'

const store = configureStore({
  reducer: {
    address: address.slice.reducer,
    contract: contract.reducer
  },
  middleware: [...getDefaultMiddleware(), logger]
})

export default store
