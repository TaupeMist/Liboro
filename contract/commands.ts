import {
  ContractStateType
} from './types'

import {
  format
} from './utils'

import {
  Contract
} from './contract'

import {
  CommandType,
  ExecuteType,
  AssetType,
  WalletType
} from '../chain'

export const addAsset = (asset: AssetType, target: Contract): CommandType => {
  const execute: ExecuteType = state => {
    const { contract } = state;

    contract[target.id].assets[asset.toLowerCase()] = 0

    return { ...state, contract }
  }

  return {
    execute
  }
}

export const deposit = (
  amount: number,
  asset: AssetType,
  sender: WalletType,
  contractId: string
): CommandType => {
  const execute: ExecuteType = state => {
    const { contract, wallet } = state;
    const assets = wallet[sender.id].assets

    wallet[sender.id].assets[asset] = format(assets[asset] - amount)

    contract[contractId].assets[asset] = format((contract[contractId].assets[asset] || 0) + amount)

    return { ...state, contract }
  }

  return {
    execute
  }
}

export const withdraw = (
  amount: number,
  asset: AssetType,
  receiver: WalletType,
  contractId: string
): CommandType => {
  const execute: ExecuteType = state => {
    const { contract, wallet } = state;

    contract[contractId].assets[asset] = format(contract[contractId].assets[asset] - amount)

    wallet[receiver.id].assets[asset] = format((wallet[receiver.id].assets[asset] || 0) + amount)

    return { ...state, contract }
  }

  return {
    execute
  }
}

export const transfer = (
  amount: number,
  asset: AssetType,
  sender: WalletType,
  receiver: WalletType,
): CommandType => {
  const execute: ExecuteType = state => {
    const { wallet } = state

    if (wallet[sender.id].assets[asset] < amount)
      throw new Error('Cannot send. Send has insufficient funds.')

    wallet[sender.id].assets[asset] = format(wallet[sender.id].assets[asset] - amount)

    wallet[receiver.id].assets[asset] = format((wallet[receiver.id].assets[asset] || 0) + amount)

    return { ...state, wallet }
  }

  return {
    execute
  }
}

export const setTable = (
  table: ContractStateType['table'],
  target: Contract
): CommandType => {
  const execute: ExecuteType = state => {
    const { contract } = state;

    contract[target.id].table = table

    return { ...state, contract }
  }

  return {
    execute
  }
}
