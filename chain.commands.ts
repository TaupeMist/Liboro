import {
  CommandType,
  ExecuteType,
  UndoType,
  WalletType,
  ContractType
} from './chain.types'

export const addWallet = (wallet: WalletType): CommandType => {
  let prev = undefined;

  const execute: ExecuteType = state => {
    prev = state

    state.wallet[wallet.id] = wallet

    return state
  }

  const undo: UndoType = state => {
    prev = state
    return { ...prev }
  }

  return {
    execute,
    undo
  }
}

export const addContract = (contract: ContractType, id?: string): CommandType => {
  let prev = undefined;

  const execute: ExecuteType = state => {
    prev = state

    state.contract[id || contract.id] = contract

    return state
  }

  const undo: UndoType = state => {
    prev = state
    return { ...prev }
  }

  return {
    execute,
    undo
  }
}

export const addContractNew = (contract: any): CommandType => {
  const execute: ExecuteType = state => {
    if (state.contractNew === undefined) state.contractNew = {}

    state.contractNew[contract.id] = {
      assets: {},
      table: {},
      ...contract
    }

    return state
  }

  const undo: UndoType = state => {
    delete state.contractNew[contract.id]

    return state
  }

  return {
    execute,
    undo
  }
}
