import {
  CommandType,
  ExecuteType,
  WalletType
} from './types'

export const addWallet = (wallet: WalletType): CommandType => {
  let prev = undefined;

  const execute: ExecuteType = state => {
    prev = state

    state.wallet[wallet.id] = wallet

    return state
  }

  return {
    execute
  }
}

export const addContract = (contract: any): CommandType => {
  const execute: ExecuteType = state => {
    if (state.contract === undefined) state.contract = {}

    state.contract[contract.id] = {
      assets: {},
      table: {},
      ...contract
    }

    return state
  }

  return {
    execute
  }
}
