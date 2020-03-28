import {
  CommandType,
  AssetHardType,
  ExecuteType,
  UndoType,
  AssetType,
  WalletType,
  ContractStateType,
  StateType,
  LiboroAssetType
} from './types'

import {
  format,
  hasFunds,
  calcMintPayable,
  calcBurnPayable
} from './utils'

import {
  Contract
} from './index'

const getContract = (state: StateType, id: string): Contract => state.contract[id]

const getTable = (state: StateType, id: string): ContractStateType['table'] => getContract(state, id).table

export const addAsset = (asset: AssetType, target: Contract): CommandType => {
  const execute: ExecuteType = state => {
    const { contract } = state;

    contract[target.id].assets[asset.toLowerCase()] = 0
      
    return { ...state, contract }
  }

  const undo: UndoType = state => {
    const { contract } = state;

    delete contract[target.id].assets[asset.toLowerCase()]

    return { ...state, contract }
  }
  
  return {
    execute,
    undo
  }
}

export const seed = (
  amount: number,
  assetSeeding: AssetHardType,
  buyer: WalletType,
  contractId: string
): CommandType => {
  const execute: ExecuteType = state => {
    const { contract, wallet } = state;
    const assets = wallet[buyer.id].assets

    wallet[buyer.id].assets[assetSeeding] = format(assets[assetSeeding] - amount)

    contract[contractId].assets[assetSeeding] = amount
      
    return { ...state, contract }
  }

  const undo: UndoType = state => {
    const { contract } = state;
    const { baseToken } = getTable(state, contractId)

    contract[contractId].assets[assetSeeding] = 0
    contract[contractId].assets[baseToken] = 0

    return { ...state, contract }
  }
  
  return {
    execute,
    undo
  }
}

export const mint = (
  assetSelling: LiboroAssetType,
  buyer: WalletType,
  contractId: string
): CommandType => {
  const execute: ExecuteType = state => {
    const { contract, wallet } = state
    const { baseToken } = getTable(state, contractId)

    if (!hasFunds(assetSelling.value, baseToken, assetSelling.id, wallet[buyer.id])(getContract(state, contractId))) return state
    
    const payable = calcMintPayable(assetSelling)(contract[contractId])

    const { assets } = wallet[buyer.id]

    wallet[buyer.id].assets[assetSelling.id] = format(assets[assetSelling.id] - assetSelling.value)

    contract[contractId].assets[assetSelling.id] = format(contract[contractId].assets[assetSelling.id] + assetSelling.value)

    wallet[buyer.id].assets[baseToken] = format((assets[baseToken] || 0) + payable.value)
      
    return { ...state, contract, wallet }
  }

  const undo: UndoType = state => {
    const { contract } = state;
    const { baseToken } = getTable(state, contractId)

    contract[contractId].assets[assetSelling.id] = 0
    contract[contractId].assets[baseToken] = 0

    return { ...state, contract }
  }
  
  return {
    execute,
    undo
  }
}

export const burn = (
  assetBuying: LiboroAssetType,
  buyer: WalletType,
  contractId: string
): CommandType => {
  const execute: ExecuteType = state => {
    const { contract, wallet } = state
    const { baseToken } = getTable(state, contractId)

    if (!hasFunds(assetBuying.value, baseToken, assetBuying.id, wallet[buyer.id])(getContract(state, contractId))) return state
    
    const payable = calcBurnPayable(assetBuying)

    const { assets } = wallet[buyer.id]

    wallet[buyer.id].assets[baseToken] = format(assets[baseToken] - assetBuying.value)

    contract[contractId].assets[assetBuying.id] = format(contract[contractId].assets[assetBuying.id] - payable.value)

    wallet[buyer.id].assets[assetBuying.id] = format((assets[assetBuying.id] || 0) + payable.value)
      
    return { ...state, contract, wallet }
  }

  const undo: UndoType = state => {
    const { contract } = state;

    contract[contractId].assets[assetBuying.id] = 0

    return { ...state, contract }
  }
  
  return {
    execute,
    undo
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

  const undo: UndoType = state => {
    const { wallet } = state

    wallet[sender.id].assets[asset] = format(wallet[sender.id].assets[asset] + amount)

    wallet[receiver.id].assets[asset] = format(wallet[receiver.id].assets[asset] - amount)
      
    return { ...state, wallet }
  }
  
  return {
    execute,
    undo
  }
}

export const setTable = (
  table: ContractStateType['table'],
  target: Contract
): CommandType => {
  let prev

  const execute: ExecuteType = state => {
    const { contract } = state;

    prev = { ...contract[target.id].table }
    contract[target.id].table = table
      
    return { ...state, contract }
  }

  const undo: UndoType = state => {
    const { contract } = state;

    contract[target.id].table = { ...prev }

    return { ...state, contract }
  }
  
  return {
    execute,
    undo
  }
}
