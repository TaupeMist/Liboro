import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuid } from 'uuid'

export interface AddPayload {
  id: string
}

export interface State {
  ids: string[],
  entities: {
    [k: string]: any
  }
}

export const initialState: State = {
  ids: [],
  entities: {}
}

export const reducers = {
  add: {
    prepare(payload) {
      return {
        payload: {
          id: uuid(),
          ...payload
        }
      }
    },
    reducer(state, action: PayloadAction<AddPayload>) {
      const { id, ...rest } = action.payload

      state.entities[id] = { id, ...rest }
      state.ids.push(id)
    }
  }
}

export const slice = createSlice({
  name: 'data',
  initialState,
  reducers,
})

export const {
  add
} = slice.actions

export default slice.reducer
