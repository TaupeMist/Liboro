import {
  CommandType,
  ExecuteType,
  UndoType,
  WalletType,
} from '../chain'

import {
  LiboroAssetType,
  format,
  getTable
} from '../contract'

export const mint = (
  assetSelling: LiboroAssetType,
  buyer: WalletType,
  contractId: string,
  payable: LiboroAssetType
): CommandType => {
  const execute: ExecuteType = state => {
    const { contract, wallet } = state
    const { baseToken } = getTable(state, contractId)
  
    // if (!hasFunds(assetSelling.value, baseToken, assetSelling.id, wallet[buyer.id])(getContract(state, contractId))) return state

    const { assets } = wallet[buyer.id]

    wallet[buyer.id].assets[assetSelling.id] = format(assets[assetSelling.id] - assetSelling.value)

    contract[contractId].assets[assetSelling.id] = format(contract[contractId].assets[assetSelling.id] + assetSelling.value)

    wallet[buyer.id].assets[baseToken.id] = format((assets[baseToken.id] || 0) + payable.value)
      
    return { ...state, contract, wallet }
  }

  const undo: UndoType = state => {
    const { contract } = state;
    const { baseToken } = getTable(state, contractId)

    contract[contractId].assets[assetSelling.id] = 0
    contract[contractId].assets[baseToken.id] = 0

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
  contractId: string,
  payable: LiboroAssetType
): CommandType => {
  const execute: ExecuteType = state => {
    const { contract, wallet } = state
    const { baseToken } = getTable(state, contractId)

    // if (!hasFunds(assetBuying.value, baseToken, assetBuying.id, wallet[buyer.id])(getContract(state, contractId))) return state

    const { assets } = wallet[buyer.id]

    wallet[buyer.id].assets[baseToken.id] = format(assets[baseToken.id] - assetBuying.value)

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
