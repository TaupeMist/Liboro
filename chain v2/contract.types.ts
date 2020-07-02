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

export interface ContractPayload {
  contractId: string
}

export interface SetContractPayload extends ContractPayload {
  addressId: string
}

export const CONTRACT = 'contract'

export const SET_CONTRACT = `${CONTRACT}/set`
