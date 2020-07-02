import { configureStore, getDefaultMiddleware, combineReducers } from '@reduxjs/toolkit'
import logger from 'redux-logger'

import * as address from './address.store'
import * as contract from './contract.store'

const reducer = combineReducers({
  address: address.slice.reducer,
  contract: contract.reducer
})

export type State = ReturnType<typeof reducer>

const store = configureStore({
  middleware: [...getDefaultMiddleware(), logger],
  reducer
})

export default store
