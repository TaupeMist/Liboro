import {
  CommandType,
  AssetType,
  AssetHardType,
  ExecuteType,
  UndoType,
  ContractType,
  WalletType
} from './chain.types'

import {
  format,
  getAltAssetType,
  hasFunds,
  calcPayable
} from './balance.utils'

export const init = (id: string): ContractType => {
  return {
    id,
    assets: {
      token: 0
    }
  }
}

export const add = (asset: AssetHardType, contractAdding: ContractType): CommandType => {
  let prev = undefined;

  const execute: ExecuteType = state => {
    const { contract } = state;

    prev = { ...state }

    contract[contractAdding.id].assets[asset] = 0
      
    return { ...state, contract }
  }
  const undo: UndoType = state => {
    prev = { ...state }
    return { ...prev }
  }
  
  return {
    execute,
    undo
  }
}

export const seed = (amount: number, assetBuying: AssetType, contractBuying: ContractType, buyer: WalletType): CommandType => {
  let prev = undefined;

  const execute: ExecuteType = state => {
    const { contract, wallet } = state;

    if (!hasFunds(amount, assetBuying, wallet[buyer.id])(contractBuying)) return state
    
    const assetSelling = getAltAssetType(assetBuying)

    const assets = wallet[buyer.id].assets
    
    prev = { ...state }

    wallet[buyer.id].assets[assetSelling] = format(assets[assetSelling] - amount)

    contract[contractBuying.id].assets[assetBuying] = amount
    contract[contractBuying.id].assets[assetSelling] = amount
    
    return { contract, wallet }
  }
  const undo: UndoType = state => {
    prev = { ...state }
    return { ...prev }
  }

  return {
    execute,
    undo
  }
}

export const buy = (amount: number, assetBuying: AssetType, contractBuying: ContractType, buyer: WalletType): CommandType => {
  let prev = undefined;

  const execute: ExecuteType = state => {
    const { contract, wallet } = state;

    if (!hasFunds(amount, assetBuying, wallet[buyer.id])(contractBuying)) return state
    
    const assetSelling = getAltAssetType(assetBuying)
    
    const payable = calcPayable(amount, assetBuying)(contractBuying);

    const assets = wallet[buyer.id].assets
    
    prev = { ...state }

    wallet[buyer.id].assets[assetSelling] = format(assets[assetSelling] - amount)

    contract[contractBuying.id].assets[assetSelling] = format(contract[contractBuying.id].assets[assetSelling] + amount)
    contract[contractBuying.id].assets[assetBuying] = format(contract[contractBuying.id].assets[assetBuying] - payable)

    wallet[buyer.id].assets[assetBuying] = format(assets[assetBuying] + payable)
      
    return { contract, wallet }
  }
  const undo: UndoType = state => {
    prev = { ...state }
    return { ...prev }
  }
  
  return {
    execute,
    undo
  }
}
