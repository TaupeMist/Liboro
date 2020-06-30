import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import logger from 'redux-logger'

import { slice } from './address'

const store = configureStore({
  reducer: {
    address: slice.reducer
  },
  middleware: [...getDefaultMiddleware(), logger]
})

export default store
